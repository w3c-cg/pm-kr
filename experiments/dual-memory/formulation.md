## The formulation

Symbols used throughout: $V = 16$ symbols; $s_t$ the symbol at step $t$ and $y = s_{t+1}$ the truth to predict; $h_t$ the state and $q_t = h_t / \lVert h_t \rVert$ the query; a memory is a set of pairs $(k_i, v_i)$ of a stored query and a stored symbol; $\mathbb{1}[\cdot]$ is 1 when its argument holds and 0 otherwise.

### Dave's part

Dave Raggett's dual memory, as his intro describes it (https://www.w3.org/Data/cogai/dual-memory/, W3C Cognitive AI, 7 November 2026), restated here in his notation.

State, a predictive state-space step with a learned step size:
$$\Delta_t = \sigma(W_\Delta e_t + b_\Delta), \qquad \bar{A}_t = \exp(\Delta_t A), \qquad \bar{B}_t = \Delta_t B e_t, \qquad h_t = \bar{A}_t h_{t-1} + \bar{B}_t$$
where $e_t = E[s_t]$ is the embedding of the current symbol. His demo gives no learning rule for $W_\Delta$, $A$ and $B$, so this harness uses the fixed-decay form of the same recurrence, $h_t = \alpha h_{t-1} + (1 - \alpha) E[s_t]$ with $\alpha = 0.3$ (0.5 in the fair test), and a fixed random $E$.

Long-term memory, a Modern Hopfield network over the stored patterns $X = [x_1 \dots x_M]$, with the energy
$$E(q) = -\log \sum_{i=1}^{M} \exp(\beta  x_i^{T} q) + \tfrac{1}{2} q^{T} q + \text{const}$$
and the retrieval as the iterated fixed point
$$q^{(k)} = X \cdot \operatorname{softmax}(\beta X^{T} q^{(k-1)}), \qquad k = 1 \dots \text{steps}$$
with $\beta = 18$ and steps $= 4$ in his model, and $M = 256$ slots.

Working memory, a first-in first-out buffer of the last $K = 128$ state traces.

Surprise, the cross-entropy of the prediction at the truth, $S_t = -\log P(s_{t+1})$, averaged as $\bar{S}_t = (1 - a)\bar{S}_{t-1} + a S_t$ over a window of 1000 steps.

Consolidation: when the surprise exceeds an adaptive threshold $\theta$, $S_t > \theta$, the working trace is written into the long-term memory (his intro, section 2.A); his page gives no adaptation rule, and his DSL instantiates the gate with a fixed value, $\theta = 1.0$. Both are run here as his: the fixed instance of his DSL, and his adaptive threshold realised by our rule, the running mean plus one standard deviation of the surprise,
$$\mu_t = (1 - \rho)\mu_{t-1} + \rho S_t, \qquad \nu_t = (1 - \rho)\nu_{t-1} + \rho (S_t - \mu_{t-1})^2, \qquad \theta_t = \mu_t + \kappa \sqrt{\nu_t}$$
with $\rho = 0.02$ and $\kappa = 1$, applied after 50 steps. A decay of $0.01$ per step acts on the long-term memory (taken here as a slot strength, the weakest slot being overwritten).

His two metrics. One-shot acquisition, the fraction of injected rare sequences whose continuation is predicted at their second exposure,
$$A_{1\text{-shot}} = \frac{1}{M_{inj}} \sum_{m=1}^{M_{inj}} \mathbb{1}\big[\hat{s}_{m,k=2} = s_{m,k=2}\big] \times 100$$
and the forgetting resistance score, the accuracy on sequences learned before a stretch of $N$ background steps over the accuracy right after learning them,
$$\mathrm{FRS} = \frac{\mathrm{Acc}(S_{past} \mid t = T_0 + N)}{\mathrm{Acc}(S_{past} \mid t = T_0)}.$$
In this harness the pattern is $[3, 7, 12, 5]$ every 500 steps, the stretch is $N = 2000$ steps, and the two metrics are computed exactly as written, on the two positions whose context carries the pattern.

### Daniel's part

Daniel Campos Ramos's W- contrastive formulation, first written down on 8 February 2026 in his Knowledge3D project, after the Tiny Recursive Model paper: a model learns what is wrong beside what is right; the negative branch is larger than the positive one and shaped differently, so the two cannot collapse into copies; a decisor fuses them, so the model can say why and why not. Here it is placed on Dave's memory as a second memory, a fused decision and a live tuner of the gate, enhancing his part: with his adaptive threshold the background is kept at 24 percent and with the tuner at 41 (Markov); on top of the tuner the negative memory takes the deterministic fair test from 65 to 98 percent and from 11.8 to 2.8 exposures to acquisition (fairK2); on top of his adaptive threshold with a soft positive read, from 12.0 to 2.6 exposures (fairK4).

The principle, in Daniel's words: "we learn more from negative outcomes than from positive ones", a thing every human knows, and the reason he expects few-shot learning to be where contrastive learning shows that fewer steps render better results. The mechanism follows the principle: the negative memory is written from the model's own mistakes, the positive memory's best wrong alternative at the moment the model errs, so the model learns from its negative outcomes, not only from the positive ones Dave's memory stores.

Positive read, Dave's retrieval as a vote mass per symbol over the positive memory $M^{+}$ (one step, $\beta = 18$):
$$m^{+}(v) = \sum_{i \in M^{+}} \mathbb{1}[v_i = v]  \exp\big(\beta (k_i^{T} q - 1)\big), \qquad p^{+}(v) = \frac{m^{+}(v)}{\sum_u m^{+}(u)}.$$

Negative read over the negative memory $M^{-}$, three times the size of $M^{+}$, with its own sharpness $\beta^{-} \geq \beta$ (the same by default; 54 in the fair test), in one of five shapes:
$$m^{-}(v) = \sum_{j \in M^{-}} \mathbb{1}[v_j = v]  \exp\big(\beta^{-} (k_j^{T} q - 1)\big), \qquad p^{-}(v) = \frac{m^{-}(v)}{\sum_u m^{-}(u)}$$
- flat_linear: $\pi(v) = p^{-}(v)$, one pass.
- recursive_inverted: one fixed-point step first pulls the query toward the stored negatives, $q_1 = \operatorname{normalize}\big(\sum_j w_j k_j\big)$ with $w_j = \exp(\beta^{-}(k_j^{T} q - 1))$, then $\pi(v) = p^{-}(v)$ is read with $q_1$ in place of $q$; the positive read stays one step (depth on the negative side).
- anti_swiglu_gate: $\pi(v) = -\operatorname{silu}(-\gamma p^{-}(v)) = \gamma p^{-}(v)  \sigma(-\gamma p^{-}(v))$, a gate whose input is negated before the nonlinearity, with $\gamma = 4$.
- anti_tanh_flat: $\pi(v) = \tanh(\gamma p^{-}(v))$, bounded.
- multi_slab_parallel: $\pi(v) = \tfrac{1}{3} \sum_{s=1}^{3} p^{-}_s(v)$ over three slabs of $M^{-}$ written from three sources: the model's wrong guess at $q_t$, the positive memory's best wrong alternative at $q_t$, and the wrong guess keyed by $q_{t-1}$.
In every shape the negative mass used by the decisor is $\tilde{m}^{-}(v) = \pi(v) \sum_u m^{-}(u)$.

Decisor, the fusion of evidence for and against each symbol. Default, an energy difference with a prior count on the negative:
$$\mathrm{score}(v) = \log\big(m^{+}(v) + \varepsilon\big) - \lambda \log\big(\tilde{m}^{-}(v) + c\big), \qquad \varepsilon = 10^{-3},   c = 1,   \lambda = 1$$
with the prediction $\hat{s} = \arg\max_v \mathrm{score}(v)$ and $P(v) = \operatorname{softmax}_v \mathrm{score}(v)$, so the surprise is $S_t = -\log P(y)$. Two alternatives are selectable: the normalized difference $p^{+}(v) - \lambda \pi(v)$ and the mass difference $m^{+}(v) - \lambda \tilde{m}^{-}(v)$, both with $P(v) \propto \max(\mathrm{score}(v), 0) + \varepsilon$. In energy terms, with $E^{+} = -\log m^{+}$ and $E^{-} = -\log \tilde{m}^{-}$, the model prefers low positive energy and high negative energy.

The hard negative, the positive memory's best wrong alternative at this context:
$$y' = \arg\max_{v \neq y} m^{+}(v).$$

Write rules, both memories under the same gate. The positive write is Dave's: if $S_t > \theta$ then $M^{+} \leftarrow (q_t, y)$. The negative write is the first half of the hinge $\operatorname{ReLU}\big(m + E^{-}(y) - E^{-}(y')\big)$ in memory form: if $S_t > \theta$, $m^{+}(y') > 0$ and
$$\log\big(\tilde{m}^{-}(y') + \varepsilon\big) - \log\big(\tilde{m}^{-}(y) + \varepsilon\big) < m, \qquad m = 1,$$
then $M^{-} \leftarrow (q_t, y')$, so negatives against an alternative stop once the negative memory separates it from the truth by the margin. The other half of the hinge, pushing $E^{-}(y)$ up where the truth carries negative evidence, is a removal: the negative $j$ with $v_j = y$ and the largest $k_j^{T} q_t$ is deleted when $\exp(\beta^{-}(k_j^{T} q_t - 1)) \geq u_{min}$, $u_{min} = 0.5$, that is, only when it was written at a near-identical context.

Eviction, as Dave's decay: a strength $\sigma_i$ per slot, $\sigma_i \leftarrow (1 - \delta)\sigma_i$ every step with $\delta = 0.01$, raised by the slot's retrieval weight when read (capped at 4), set to 1 on write; a write goes to $\arg\min_i \sigma_i$ (or to a ring, the FIFO option).


The open live tuner, a controller, reactor and actuator loop that runs every step on the GPU. Signals (controller), exponential moving averages with rate $\rho = 0.01$:
$$r_t = (1 - \rho) r_{t-1} + \rho  \mathbb{1}[\text{a positive write at } t], \qquad a^{f}_t = (1 - \rho) a^{f}_{t-1} + \rho  \mathbb{1}[\hat{s}_t = y_t], \qquad a^{p}_t = (1 - \rho) a^{p}_{t-1} + \rho  \mathbb{1}[\arg\max_v m^{+}(v) = y_t].$$
Reactions and actuators, after 100 steps, with step $\eta = 0.02$, budget $b = 0.08$ writes per step and $\lambda_{max} = 2$:
$$\theta_{t+1} = \operatorname{clip}\big(\theta_t + \eta  \operatorname{sign}(r_t - b),  0.2,  6\big)$$
and for the negative weight, $\lambda_{t+1} = \operatorname{clip}(\lambda_t (1 - \eta), 0, \lambda_{max})$ when $a^{f}_t + 0.01 < a^{p}_t$, $\lambda_{t+1} = \operatorname{clip}(\lambda_t (1 + \eta), 0, \lambda_{max})$ when $a^{f}_t > a^{p}_t + 0.01$, and $\lambda_{t+1} = \lambda_t$ otherwise.
The threshold follows a write budget instead of a surprise statistic (Dave's adaptive threshold realised as mean plus one standard deviation is the surprise-statistic rule), and the negative weight grows only while the fused decision beats the positive read alone.

Two user-facing outputs. Abstention by Chow's rule: the model answers only when $P(\hat{s}) \geq \tau$, $\tau = 0.35$, and says "not sure" otherwise; a wrong answer given with $P(\hat{s}) \geq \tau$ is a confident mistake. The "why not": the positively supported symbol the negative memory rules out most strongly, $w = \arg\max_{v:  m^{+}(v) > 0} \tilde{m}^{-}(v)$, measured by how often $w \neq y$ against the chance level $15/16$.
