# Contrastive dual memory on WebGPU: Dave Raggett's dual memory, measured side by side with a negative memory and a live tuner

This folder builds on Dave Raggett's dual-memory demo (W3C Cognitive AI) and follows its licence, the [W3C Document License](https://www.w3.org/Consortium/Legal/copyright-documents), as his [w3c/cogai](https://github.com/w3c/cogai) repository does: see [LICENSE.md](LICENSE.md).

A few-shot sequence learner as three WebGPU compute dispatches per step: a positive associative memory, a negative memory three times its size, and a decisor that fuses them, with a live tuner that adjusts the consolidation gate while the model runs. It runs in any WebGPU browser from a static page, and headless in Deno with the same WGSL, so every number here can be repeated on the hardware you already own.

The task, the DSL notation and the two metrics (1-shot acquisition rate, forgetting resistance) follow Dave Raggett's dual-memory demo (W3C Cognitive AI, https://www.w3.org/Data/cogai/dual-memory/, announced on public-cogai on 7 November 2026). Two baselines are his: his DSL's fixed threshold 1.0 (gate_threshold(surprise, threshold=1.0) in his app.js), and his intro's adaptive threshold theta, for which his page gives no rule and which we realise as the running mean plus one standard deviation of the surprise; in both, beta 18, decay 0.01, a rare pattern [3, 7, 12, 5] injected every 500 steps into a background of 16 symbols. The negative memory follows Daniel Campos Ramos's W- contrastive formulation, which is open and engine-agnostic: a model learns what is wrong beside what is right, the negative branch is larger and shaped differently from the positive one so the two cannot collapse into copies, and a decisor fuses them, so that the model can say why and why not. The live tuner is an open controller, reactor and actuator loop. The code here was written for this harness.

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

## Run it

In a browser: serve this folder from any static host and open index.html (a module page needs http, not file://). Pick the arms, the seeds and the options, press Run. Nothing is installed and nothing leaves the page. `index.html?auto=1&arms=baseline,control&seeds=3` runs on load and writes its JSON into the page.

Headless, with Deno 2 (WebGPU is built in) and a Vulkan driver (lavapipe on any CPU, or a GPU):

```
deno run --allow-read --allow-write run.js --arms baseline,control,tuner,contrastive,both,ctrl-nomem,ctrl-scrambled,ctrl-randomneg --seeds 10 --task markov --out results.json
deno run --allow-read --allow-write run.js --task cycle --confuser 3 --betaneg 54 --set alpha=0.5 --seeds 10 --out fair.json
deno run --allow-read --allow-net run.js serve 8080
```

A seed gives the same symbol stream on every GPU (the stream is an integer hash computed on the GPU), so differences between GPUs come only from floating point: 227 of 230 runs had bit-identical acquisition curves on lavapipe (Mesa llvmpipe) and on an NVIDIA RTX 3060, and headless Chrome 158 on SwiftShader matched them bit for bit.

## The model

Each step t sees symbol s_t and must predict s_(t+1).

- State: h = alpha h + (1 - alpha) E[s_t]; q = h / |h|. E is a fixed random embedding (alpha 0.3; 0.5 in the fair test).
- Positive read (dispatch 1): every stored pair (k_i, v_i) votes for v_i with weight exp(beta (k_i . q - 1)); m+(v) is the vote mass for v.
- Negative read (dispatch 2): the same over the negative memory, with its own sharpness beta_neg when set, in one of five shapes: one pass (flat_linear); a Hopfield fixed-point step that first pulls q toward the stored negatives (recursive_inverted); a sign-flipped SiLU gate (anti_swiglu_gate); a bounded tanh (anti_tanh_flat); three parallel slabs with different write sources, averaged (multi_slab_parallel).
- Decisor (dispatch 3): score(v) = log(m+(v) + eps) - lambda log(m-(v) + 1) by default (an energy difference; two other decisors, normalized difference and mass difference, are selectable); prediction = argmax; surprise = -log p(s_(t+1)). With the abstain option (Chow's rule) the model answers only when p(best) reaches a threshold (0.35 here) and says "not sure" otherwise.
- Writes: if surprise > theta, (q, s_(t+1)) goes into the positive memory; at the same steps the positive memory's best wrong alternative goes into the negative memory as (q, alternative), until the negative memory separates that alternative from the truth by a margin (the hinge). A negative that votes for the truth at a near-exact context is removed (the hinge's other half). Eviction: the weakest slot by a decaying strength, or a FIFO ring.
- Gates: Dave's DSL fixed theta 1.0; Dave's adaptive threshold theta realised as mean + sd of the running surprise; or Daniel's live tuner, which every step moves theta toward a write-rate budget (0.08 writes per step) and moves lambda up or down by whether the fused decision beats the positive read alone, both bounded, on the GPU.
- "Why not": with a negative memory the model names, at every step, the positively supported symbol it rules out most strongly; the harness counts how often that symbol was indeed not the next one (chance is 15 of 16, 93.75 percent).

## The arms

baseline: Dave, DSL threshold 1.0 (fixed). control: Dave, adaptive threshold θ (his intro; realised as mean + one sd). tuner: open live tuner (Daniel). contrastive: Daniel's negative memory on Dave's fixed 1.0, in a chosen shape. both: Dave adaptive θ + W-. tuner-contrastive: tuner + W-. Three negative controls in every table: no memory at all (chance is 6.25 percent), a pattern that changes at every injection (acquisition must stay at chance), and a negative memory filled with random pairs that never learns (any gain over the baseline would not be from learning).

## The metrics

1-shot: accuracy on the pattern's continuation at its second exposure, averaged over positions 2 and 3 (position 1 predicts the second symbol from the first, which the background also produces; it is reported apart in the JSON). acq k2-7: the same over exposures 2 to 7. FRS: accuracy at the first exposure after a 2000-step gap over accuracy at the last exposure before it. ambient: accuracy on background steps (ceiling 45 percent in the Markov task, 6.25 in the uniform one, near 100 in the deterministic one). exposures to acq: the first exposure at which both positions are right (16 means never within 8). confident mistakes: wrong answers given with probability at least 0.35, counted over all 8000 steps (pattern, confuser and background) and reported per 1000 steps; on a deterministic background every one is a real wrong answer, on the Markov background most are the irreducible 55 percent of an ambient step answered at 0.45, so there the column mostly says how often an arm commits at all, and confident-right per 1000 (in the JSON) is its pair. abstentions per 1000. why-not precision against the 94 chance level. Means over 10 seeds (1 to 10), the same seeds for every arm, 8000 steps per run, on an RTX 3060.

## Measured: Dave's design against our formulations

Three backgrounds: markov (the one his intro describes: each symbol has two likely successors at 45 percent each), uniform (what his generator.js draws, every step surprising), and the fair test for the negative memory (K1 to K7: a deterministic permutation cycle or the Markov chain with a second pattern [8, 7, 12, 9] injected three times per cycle, sharing the middle of the target so that at the target's context the positive memory's best wrong alternative is a stable fact; K1 with the default alpha 0.3 and the same read for both memories, K2 and K4 with alpha 0.5 and a sharper negative read, K4 with a soft positive read, beta 8; K3 the Markov chain with the confuser; K5 the cycle without confuser; K6 and K7 variants of the unlearning rule).

| block | task | arm | n | 1-shot (p2,p3) | acq k2-7 +- sd | FRS (n) | ambient | exposures to acq | confident mistakes /1000 | abstentions /1000 | why-not precision (chance 94) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| fairK1 | cycle + confuser x3 | Dave, DSL threshold 1.0 (fixed) | 10 | 100 | 100 +- 0 | 1.00 (10) | 94 | 2.0 | 62.6 | 0 | - |
| fairK1 | cycle + confuser x3 | Dave, adaptive threshold θ (his intro; realised as mean + one sd) | 10 | 50 | 45 +- 16 | 0.33 (9) | 100 | 16.0 | 12.8 | 0 | - |
| fairK1 | cycle + confuser x3 | open live tuner (Daniel) | 10 | 45 | 45 +- 16 | 1.00 (9) | 100 | 16.0 | 10.0 | 0 | - |
| fairK1 | cycle + confuser x3 | Dave adaptive θ + W- flat | 10 | 45 | 49 +- 3 | 0.40 (10) | 100 | 16.0 | 12.8 | 0 | 99 |
| fairK1 | cycle + confuser x3 | Dave adaptive θ + W- flat + abstain | 10 | 45 | 49 +- 3 | 0.40 (10) | 100 | 16.0 | 12.8 | 2 | 99 |
| fairK1 | cycle + confuser x3 | Dave, DSL threshold 1.0 (fixed) + abstain | 10 | 100 | 100 +- 0 | 1.00 (10) | 94 | 2.0 | 62.6 | 3 | - |
| fairK1 | cycle + confuser x3 | control: no memory | 10 | 0 | 0 +- 0 | nan (0) | 6 | 16.0 | 0.0 | 0 | - |
| fairK1 | cycle + confuser x3 | control: random negatives | 10 | 100 | 100 +- 0 | 1.00 (10) | 93 | 2.0 | 72.6 | 0 | 94 |
| fairK1 | cycle + confuser x3 | control: scrambled pattern | 10 | 10 | 4 +- 6 | 0.00 (2) | 99 | 16.0 | 19.2 | 0 | 99 |
| fairK1 | cycle + confuser x3 | tuner + W- flat | 10 | 45 | 45 +- 16 | 1.00 (9) | 100 | 16.0 | 9.6 | 0 | 99 |
| fairK1 | cycle + confuser x3 | tuner + W- flat + abstain | 10 | 45 | 45 +- 16 | 1.00 (9) | 100 | 16.0 | 9.6 | 2 | 99 |
| fairK2 | cycle + confuser x3, beta_neg 54 | Dave, DSL threshold 1.0 (fixed) | 10 | 100 | 100 +- 0 | 1.00 (10) | 91 | 2.0 | 86.8 | 0 | - |
| fairK2 | cycle + confuser x3, beta_neg 54 | Dave, adaptive threshold θ (his intro; realised as mean + one sd) | 10 | 100 | 98 +- 4 | 0.95 (10) | 100 | 2.0 | 8.8 | 0 | - |
| fairK2 | cycle + confuser x3, beta_neg 54 | open live tuner (Daniel) | 10 | 65 | 65 +- 24 | 1.00 (10) | 100 | 11.8 | 8.5 | 0 | - |
| fairK2 | cycle + confuser x3, beta_neg 54 | Dave adaptive θ + W- flat | 10 | 100 | 100 +- 0 | 0.95 (10) | 100 | 2.0 | 9.1 | 0 | 99 |
| fairK2 | cycle + confuser x3, beta_neg 54 | Dave adaptive θ + W- flat + abstain | 10 | 100 | 100 +- 0 | 0.95 (10) | 100 | 2.0 | 9.1 | 2 | 99 |
| fairK2 | cycle + confuser x3, beta_neg 54 | Dave, DSL threshold 1.0 (fixed) + abstain | 10 | 100 | 100 +- 0 | 1.00 (10) | 91 | 2.0 | 86.8 | 3 | - |
| fairK2 | cycle + confuser x3, beta_neg 54 | control: no memory | 10 | 0 | 0 +- 0 | nan (0) | 6 | 16.0 | 0.0 | 0 | - |
| fairK2 | cycle + confuser x3, beta_neg 54 | control: random negatives | 10 | 100 | 100 +- 0 | 1.00 (10) | 91 | 2.0 | 86.8 | 0 | 92 |
| fairK2 | cycle + confuser x3, beta_neg 54 | control: scrambled pattern | 10 | 10 | 5 +- 6 | 0.50 (2) | 99 | 16.0 | 15.9 | 0 | 99 |
| fairK2 | cycle + confuser x3, beta_neg 54 | tuner + W- flat | 10 | 70 | 98 +- 5 | 1.00 (10) | 100 | 2.8 | 7.8 | 0 | 99 |
| fairK2 | cycle + confuser x3, beta_neg 54 | tuner + W- flat + abstain | 10 | 70 | 95 +- 11 | 1.00 (10) | 100 | 3.2 | 7.9 | 2 | 99 |
| fairK3 | markov + confuser x3, beta_neg 54 | Dave, DSL threshold 1.0 (fixed) | 10 | 75 | 68 +- 26 | 0.00 (9) | 44 | 5.2 | 524.4 | 0 | - |
| fairK3 | markov + confuser x3, beta_neg 54 | Dave, adaptive threshold θ (his intro; realised as mean + one sd) | 10 | 100 | 96 +- 7 | 0.95 (10) | 23 | 2.0 | 72.3 | 0 | - |
| fairK3 | markov + confuser x3, beta_neg 54 | open live tuner (Daniel) | 10 | 100 | 93 +- 12 | 1.00 (10) | 37 | 2.0 | 75.0 | 0 | - |
| fairK3 | markov + confuser x3, beta_neg 54 | Dave adaptive θ + W- flat | 10 | 100 | 94 +- 9 | 1.10 (10) | 23 | 2.0 | 76.5 | 0 | 93 |
| fairK3 | markov + confuser x3, beta_neg 54 | Dave adaptive θ + W- flat + abstain | 10 | 90 | 68 +- 31 | 0.93 (7) | 3 | 4.8 | 76.5 | 887 | 93 |
| fairK3 | markov + confuser x3, beta_neg 54 | Dave, DSL threshold 1.0 (fixed) + abstain | 10 | 60 | 52 +- 29 | 0.00 (8) | 42 | 10.5 | 524.4 | 57 | - |
| fairK3 | markov + confuser x3, beta_neg 54 | control: no memory | 10 | 0 | 0 +- 0 | nan (0) | 6 | 16.0 | 0.0 | 0 | - |
| fairK3 | markov + confuser x3, beta_neg 54 | control: random negatives | 10 | 75 | 68 +- 26 | 0.00 (9) | 44 | 5.2 | 524.4 | 0 | 95 |
| fairK3 | markov + confuser x3, beta_neg 54 | control: scrambled pattern | 10 | 0 | 5 +- 6 | 0.00 (1) | 23 | 16.0 | 77.9 | 0 | 93 |
| fairK3 | markov + confuser x3, beta_neg 54 | tuner + W- flat | 10 | 95 | 89 +- 13 | 1.05 (10) | 37 | 2.1 | 77.3 | 0 | 87 |
| fairK3 | markov + confuser x3, beta_neg 54 | tuner + W- flat + abstain | 10 | 90 | 63 +- 28 | 0.75 (8) | 4 | 4.8 | 76.8 | 876 | 87 |
| fairK4 | cycle + confuser x3, beta_neg 54 | Dave, DSL threshold 1.0 (fixed) | 10 | 100 | 99 +- 3 | 0.95 (10) | 91 | 2.0 | 89.3 | 0 | - |
| fairK4 | cycle + confuser x3, beta_neg 54 | Dave, adaptive threshold θ (his intro; realised as mean + one sd) | 10 | 60 | 55 +- 18 | 1.00 (10) | 100 | 12.0 | 11.1 | 0 | - |
| fairK4 | cycle + confuser x3, beta_neg 54 | open live tuner (Daniel) | 10 | 45 | 45 +- 16 | 0.78 (9) | 100 | 14.6 | 11.1 | 0 | - |
| fairK4 | cycle + confuser x3, beta_neg 54 | Dave adaptive θ + W- flat | 10 | 75 | 95 +- 6 | 1.00 (10) | 99 | 2.6 | 11.5 | 0 | 99 |
| fairK4 | cycle + confuser x3, beta_neg 54 | Dave adaptive θ + W- flat + abstain | 10 | 75 | 94 +- 6 | 1.00 (10) | 99 | 2.7 | 11.5 | 1 | 99 |
| fairK4 | cycle + confuser x3, beta_neg 54 | Dave, DSL threshold 1.0 (fixed) + abstain | 10 | 100 | 98 +- 6 | 0.95 (10) | 91 | 2.0 | 89.3 | 2 | - |
| fairK4 | cycle + confuser x3, beta_neg 54 | control: no memory | 10 | 0 | 0 +- 0 | nan (0) | 6 | 16.0 | 0.0 | 0 | - |
| fairK4 | cycle + confuser x3, beta_neg 54 | control: random negatives | 10 | 100 | 99 +- 3 | 0.95 (10) | 91 | 2.0 | 89.3 | 0 | 92 |
| fairK4 | cycle + confuser x3, beta_neg 54 | control: scrambled pattern | 10 | 10 | 5 +- 6 | 0.00 (1) | 99 | 16.0 | 16.2 | 0 | 99 |
| fairK4 | cycle + confuser x3, beta_neg 54 | tuner + W- flat | 10 | 45 | 74 +- 26 | 0.90 (10) | 100 | 9.6 | 9.9 | 0 | 99 |
| fairK4 | cycle + confuser x3, beta_neg 54 | tuner + W- flat + abstain | 10 | 45 | 59 +- 19 | 0.90 (10) | 100 | 13.5 | 10.0 | 1 | 99 |
| markov | markov | Dave, DSL threshold 1.0 (fixed) | 10 | 25 | 26 +- 21 | 0.00 (5) | 45 | 14.7 | 13.4 | 0 | - |
| markov | markov | Dave, adaptive threshold θ (his intro; realised as mean + one sd) | 10 | 100 | 96 +- 11 | 0.95 (10) | 24 | 2.0 | 13.6 | 0 | - |
| markov | markov | open live tuner (Daniel) | 10 | 90 | 80 +- 18 | 0.78 (9) | 41 | 2.5 | 12.5 | 0 | - |
| markov | markov | Dave adaptive θ + W- flat | 10 | 90 | 95 +- 8 | 0.80 (10) | 28 | 2.3 | 17.1 | 0 | 95 |
| markov | markov | Dave adaptive θ + W- flat + abstain | 10 | 60 | 33 +- 28 | 0.67 (6) | 2 | 10.4 | 45.5 | 933 | 95 |
| markov | markov | Dave, DSL threshold 1.0 (fixed) + abstain | 10 | 25 | 16 +- 16 | 0.00 (4) | 44 | 16.0 | 533.6 | 30 | - |
| markov | markov | W- anti_swiglu_gate | 10 | 35 | 26 +- 22 | 0.00 (2) | 43 | 13.8 | 270.8 | 0 | 63 |
| markov | markov | W- anti_tanh_flat | 10 | 45 | 47 +- 15 | 1.00 (7) | 28 | 10.5 | 96.2 | 0 | 59 |
| markov | markov | W- flat_linear | 10 | 35 | 32 +- 21 | 0.25 (4) | 43 | 14.9 | 305.4 | 0 | 59 |
| markov | markov | W- multi_slab_parallel | 10 | 30 | 48 +- 12 | 0.64 (7) | 42 | 8.0 | 75.0 | 0 | 58 |
| markov | markov | W- recursive_inverted | 10 | 35 | 48 +- 23 | 0.86 (7) | 41 | 9.3 | 174.8 | 0 | 59 |
| markov | markov | control: no memory | 10 | 0 | 0 +- 0 | nan (0) | 6 | 16.0 | 0.0 | 0 | - |
| markov | markov | control: random negatives | 10 | 25 | 26 +- 21 | 0.00 (5) | 44 | 14.7 | 13.1 | 0 | 95 |
| markov | markov | control: scrambled pattern | 10 | 0 | 8 +- 6 | 0.00 (4) | 27 | 14.8 | 17.0 | 0 | 96 |
| markov | markov | tuner + W- flat | 10 | 75 | 68 +- 27 | 0.78 (9) | 42 | 5.9 | 16.4 | 0 | 88 |
| markov | markov | tuner + W- flat + abstain | 10 | 45 | 28 +- 23 | 0.50 (4) | 3 | 13.2 | 42.0 | 931 | 87 |
| uniform | uniform | Dave, DSL threshold 1.0 (fixed) | 10 | 45 | 82 +- 14 | 0.60 (10) | 6 | 3.4 | 12.4 | 0 | - |
| uniform | uniform | Dave, adaptive threshold θ (his intro; realised as mean + one sd) | 10 | 95 | 73 +- 19 | 0.44 (8) | 6 | 2.1 | 42.6 | 0 | - |
| uniform | uniform | open live tuner (Daniel) | 10 | 90 | 63 +- 16 | 0.50 (10) | 6 | 3.9 | 11.4 | 0 | - |
| uniform | uniform | Dave adaptive θ + W- flat | 10 | 50 | 48 +- 24 | 0.78 (9) | 6 | 8.6 | 46.1 | 0 | 94 |
| uniform | uniform | Dave adaptive θ + W- flat + abstain | 10 | 30 | 0 +- 0 | nan (0) | 0 | 14.6 | 46.1 | 951 | 94 |
| uniform | uniform | Dave, DSL threshold 1.0 (fixed) + abstain | 10 | 0 | 0 +- 0 | nan (0) | 0 | 16.0 | 12.4 | 987 | - |
| uniform | uniform | W- anti_swiglu_gate | 10 | 20 | 14 +- 9 | nan (0) | 6 | 13.5 | 13.6 | 0 | 94 |
| uniform | uniform | W- anti_tanh_flat | 10 | 5 | 4 +- 6 | nan (0) | 6 | 16.0 | 21.9 | 0 | 94 |
| uniform | uniform | W- flat_linear | 10 | 25 | 26 +- 16 | 0.00 (2) | 6 | 9.9 | 13.3 | 0 | 94 |
| uniform | uniform | W- multi_slab_parallel | 10 | 25 | 37 +- 19 | 0.20 (5) | 6 | 11.2 | 12.8 | 0 | 94 |
| uniform | uniform | W- recursive_inverted | 10 | 25 | 20 +- 16 | 0.00 (1) | 6 | 13.5 | 14.7 | 0 | 94 |
| uniform | uniform | control: no memory | 10 | 0 | 0 +- 0 | nan (0) | 6 | 16.0 | 0.0 | 0 | - |
| uniform | uniform | control: random negatives | 10 | 45 | 82 +- 14 | 0.60 (10) | 6 | 3.4 | 12.4 | 0 | 94 |
| uniform | uniform | control: scrambled pattern | 10 | 5 | 8 +- 7 | 0.00 (4) | 6 | 16.0 | 47.0 | 0 | 94 |
| uniform | uniform | tuner + W- flat | 10 | 65 | 60 +- 12 | 0.83 (6) | 6 | 3.7 | 11.9 | 0 | 94 |
| uniform | uniform | tuner + W- flat + abstain | 10 | 0 | 0 +- 0 | nan (0) | 0 | 16.0 | 11.6 | 988 | 94 |

Earlier blocks on the uniform background, the five negative shapes and the sharper negative read (the counters were added after these ran):

| block | task | arm | n | 1-shot (p2,p3) | acq k2-7 +- sd | FRS (n) | ambient | exposures to acq | confident mistakes /1000 | abstentions /1000 | why-not precision (chance 94) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| D | uniform | Dave, DSL threshold 1.0 (fixed) | 10 | 45 | 82 +- 14 | 0.60 (10) | 6 | 3.4 | nan | nan | - |
| D | uniform | Dave, adaptive threshold θ (his intro; realised as mean + one sd) | 10 | 95 | 73 +- 19 | 0.44 (8) | 6 | 2.1 | nan | nan | - |
| D | uniform | Dave adaptive θ + W- flat | 10 | 50 | 48 +- 24 | 0.78 (9) | 6 | 8.6 | nan | nan | - |
| D | uniform | W- flat_linear | 10 | 25 | 26 +- 16 | 0.00 (2) | 6 | 9.9 | nan | nan | - |
| D | uniform | control: no memory | 10 | 0 | 0 +- 0 | nan (0) | 6 | 16.0 | nan | nan | - |
| D | uniform | control: random negatives | 10 | 45 | 82 +- 14 | 0.60 (10) | 6 | 3.4 | nan | nan | - |
| D | uniform | control: scrambled pattern | 10 | 5 | 8 +- 7 | 0.00 (4) | 6 | 16.0 | nan | nan | - |
| E | markov | Dave adaptive θ + W- flat | 50 | 89 | 89 +- 14 | 0.88 (50) | 29 | 2.8 | nan | nan | - |
| E | markov | W- anti_swiglu_gate | 10 | 35 | 26 +- 22 | 0.00 (2) | 43 | 13.8 | nan | nan | - |
| E | markov | W- anti_tanh_flat | 10 | 45 | 47 +- 15 | 1.00 (7) | 28 | 10.5 | nan | nan | - |
| E | markov | W- flat_linear | 10 | 35 | 32 +- 21 | 0.25 (4) | 43 | 14.9 | nan | nan | - |
| E | markov | W- multi_slab_parallel | 10 | 30 | 48 +- 12 | 0.64 (7) | 42 | 8.0 | nan | nan | - |
| E | markov | W- recursive_inverted | 10 | 35 | 48 +- 23 | 0.86 (7) | 41 | 9.3 | nan | nan | - |
| J | markov, beta_neg 36 | Dave adaptive θ + W- flat | 10 | 95 | 97 +- 8 | 0.80 (10) | 29 | 2.1 | nan | nan | - |
| J | markov, beta_neg 36 | W- flat_linear | 10 | 30 | 26 +- 23 | 0.00 (4) | 44 | 14.1 | nan | nan | - |
| J | markov, beta_neg 54 | Dave adaptive θ + W- flat | 10 | 100 | 96 +- 11 | 0.80 (10) | 28 | 2.0 | nan | nan | - |
| J | markov, beta_neg 54 | W- flat_linear | 10 | 25 | 22 +- 23 | 0.00 (4) | 44 | 15.0 | nan | nan | - |
| J | uniform, beta_neg 36 | Dave adaptive θ + W- flat | 10 | 65 | 65 +- 14 | 0.22 (9) | 6 | 3.1 | nan | nan | - |
| J | uniform, beta_neg 36 | W- flat_linear | 10 | 35 | 42 +- 15 | 0.20 (5) | 6 | 7.6 | nan | nan | - |
| J | uniform, beta_neg 54 | Dave adaptive θ + W- flat | 10 | 65 | 67 +- 11 | 0.21 (7) | 6 | 3.4 | nan | nan | - |
| J | uniform, beta_neg 54 | W- flat_linear | 10 | 30 | 54 +- 18 | 0.33 (9) | 6 | 5.6 | nan | nan | - |

Earlier fair-test blocks with the contrastive and gate arms (the counters were added after these ran):

| block | task | arm | n | 1-shot (p2,p3) | acq k2-7 +- sd | FRS (n) | ambient | exposures to acq | confident mistakes /1000 | abstentions /1000 | why-not precision (chance 94) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| K1 | cycle + confuser x3 | Dave, DSL threshold 1.0 (fixed) | 10 | 100 | 100 +- 0 | 1.00 (10) | 94 | 2.0 | nan | nan | - |
| K1 | cycle + confuser x3 | Dave, adaptive threshold θ (his intro; realised as mean + one sd) | 10 | 50 | 45 +- 16 | 0.33 (9) | 100 | 16.0 | nan | nan | - |
| K1 | cycle + confuser x3 | Dave adaptive θ + W- flat | 10 | 45 | 49 +- 3 | 0.40 (10) | 100 | 16.0 | nan | nan | - |
| K1 | cycle + confuser x3 | W- flat_linear | 10 | 50 | 50 +- 0 | 1.00 (10) | 99 | 16.0 | nan | nan | - |
| K1 | cycle + confuser x3 | control: no memory | 10 | 0 | 0 +- 0 | nan (0) | 6 | 16.0 | nan | nan | - |
| K1 | cycle + confuser x3 | control: random negatives | 10 | 100 | 100 +- 0 | 1.00 (10) | 93 | 2.0 | nan | nan | - |
| K1 | cycle + confuser x3 | control: scrambled pattern | 10 | 10 | 4 +- 6 | 0.00 (2) | 99 | 16.0 | nan | nan | - |
| K2 | cycle + confuser x3, beta_neg 54 | Dave, DSL threshold 1.0 (fixed) | 10 | 100 | 100 +- 0 | 1.00 (10) | 91 | 2.0 | nan | nan | - |
| K2 | cycle + confuser x3, beta_neg 54 | Dave, adaptive threshold θ (his intro; realised as mean + one sd) | 10 | 100 | 98 +- 4 | 0.95 (10) | 100 | 2.0 | nan | nan | - |
| K2 | cycle + confuser x3, beta_neg 54 | Dave adaptive θ + W- flat | 10 | 100 | 100 +- 0 | 0.95 (10) | 100 | 2.0 | nan | nan | - |
| K2 | cycle + confuser x3, beta_neg 54 | W- flat_linear | 10 | 100 | 100 +- 0 | 1.00 (10) | 99 | 2.0 | nan | nan | - |
| K2 | cycle + confuser x3, beta_neg 54 | control: no memory | 10 | 0 | 0 +- 0 | nan (0) | 6 | 16.0 | nan | nan | - |
| K2 | cycle + confuser x3, beta_neg 54 | control: random negatives | 10 | 100 | 100 +- 0 | 1.00 (10) | 91 | 2.0 | nan | nan | - |
| K2 | cycle + confuser x3, beta_neg 54 | control: scrambled pattern | 10 | 10 | 5 +- 6 | 0.50 (2) | 99 | 16.0 | nan | nan | - |
| K3 | markov + confuser x3, beta_neg 54 | Dave, DSL threshold 1.0 (fixed) | 10 | 75 | 68 +- 26 | 0.00 (9) | 44 | 5.2 | nan | nan | - |
| K3 | markov + confuser x3, beta_neg 54 | Dave, adaptive threshold θ (his intro; realised as mean + one sd) | 10 | 100 | 96 +- 7 | 0.95 (10) | 23 | 2.0 | nan | nan | - |
| K3 | markov + confuser x3, beta_neg 54 | Dave adaptive θ + W- flat | 10 | 100 | 94 +- 9 | 1.10 (10) | 23 | 2.0 | nan | nan | - |
| K3 | markov + confuser x3, beta_neg 54 | W- flat_linear | 10 | 65 | 63 +- 26 | 0.00 (8) | 43 | 5.4 | nan | nan | - |
| K3 | markov + confuser x3, beta_neg 54 | control: no memory | 10 | 0 | 0 +- 0 | nan (0) | 6 | 16.0 | nan | nan | - |
| K3 | markov + confuser x3, beta_neg 54 | control: random negatives | 10 | 75 | 68 +- 26 | 0.00 (9) | 44 | 5.2 | nan | nan | - |
| K3 | markov + confuser x3, beta_neg 54 | control: scrambled pattern | 10 | 0 | 5 +- 6 | 0.00 (1) | 23 | 16.0 | nan | nan | - |
| K4 | cycle + confuser x3, beta_neg 54 | Dave, DSL threshold 1.0 (fixed) | 10 | 100 | 99 +- 3 | 0.95 (10) | 91 | 2.0 | nan | nan | - |
| K4 | cycle + confuser x3, beta_neg 54 | Dave, adaptive threshold θ (his intro; realised as mean + one sd) | 10 | 60 | 55 +- 18 | 1.00 (10) | 100 | 12.0 | nan | nan | - |
| K4 | cycle + confuser x3, beta_neg 54 | Dave adaptive θ + W- flat | 10 | 75 | 95 +- 6 | 1.00 (10) | 99 | 2.6 | nan | nan | - |
| K4 | cycle + confuser x3, beta_neg 54 | W- flat_linear | 10 | 95 | 95 +- 16 | 0.95 (10) | 99 | 3.4 | nan | nan | - |
| K5 | cycle | Dave, DSL threshold 1.0 (fixed) | 10 | 100 | 100 +- 0 | 1.00 (10) | 100 | 2.0 | nan | nan | - |
| K5 | cycle | Dave, adaptive threshold θ (his intro; realised as mean + one sd) | 10 | 100 | 100 +- 0 | 0.95 (10) | 100 | 2.0 | nan | nan | - |
| K5 | cycle | Dave adaptive θ + W- flat | 10 | 100 | 100 +- 0 | 1.00 (10) | 100 | 2.0 | nan | nan | - |
| K5 | cycle | W- flat_linear | 10 | 100 | 100 +- 0 | 1.00 (10) | 99 | 2.0 | nan | nan | - |
| K6 | cycle + confuser x3 | Dave adaptive θ + W- flat | 10 | 100 | 88 +- 16 | 1.05 (10) | 100 | 2.0 | nan | nan | - |
| K6 | cycle + confuser x3 | W- flat_linear | 10 | 100 | 100 +- 0 | 1.00 (10) | 99 | 2.0 | nan | nan | - |
| K7 | cycle + confuser x3, beta_neg 54 | Dave adaptive θ + W- flat | 10 | 100 | 100 +- 0 | 0.95 (10) | 100 | 2.0 | nan | nan | - |
| K7 | cycle + confuser x3, beta_neg 54 | W- flat_linear | 10 | 100 | 100 +- 0 | 1.00 (10) | 99 | 2.0 | nan | nan | - |

## Few-shot view: how many showings until it holds

Exposures to acquisition: the first exposure, counted from 1, at which both pattern positions whose context carries the pattern were predicted right, within the 8 exposures of the acquisition phase; 16 means never within those 8. Means over 10 seeds, the same seeds for every arm, from the runs in the tables above. A learner at chance (1 in 16 per position) almost never reaches it, which is what the three controls show. One showing is the minimum: the first exposure can only be stored, the second is the first that can be predicted, so 2.0 is a true one-shot learner.

| background | Dave, DSL threshold 1.0 (fixed) | Dave, adaptive threshold θ (his intro; realised as mean + one sd) | open live tuner (Daniel) | W- on the fixed 1.0 | Dave adaptive θ + W- | tuner + W- | control: no memory | control: scrambled pattern | control: random negatives |
|---|---|---|---|---|---|---|---|---|---|
| Markov background (his intro) | 14.7 | 2.0 | 2.5 | 14.9 | 2.3 | 5.9 | 16.0 | 14.8 | 14.7 |
| uniform background (his generator) | 3.4 | 2.1 | 3.9 | 9.9 | 8.6 | 3.7 | 16.0 | 16.0 | 3.4 |
| deterministic cycle + confuser, same read for both memories | 2.0 | 16.0 | 16.0 | 16.0 | 16.0 | 16.0 | 16.0 | 16.0 | 2.0 |
| deterministic cycle + confuser, sharper negative read | 2.0 | 2.0 | 11.8 | 2.0 | 2.0 | 2.8 | 16.0 | 16.0 | 2.0 |
| Markov + confuser, sharper negative read | 5.2 | 2.0 | 2.0 | 5.4 | 2.0 | 2.1 | 16.0 | 16.0 | 5.2 |
| deterministic cycle + confuser, soft positive read (beta 8), sharper negative read | 2.0 | 12.0 | 14.6 | 3.4 | 2.6 | 9.6 | 16.0 | 16.0 | 2.0 |

Reading. On the Markov background Dave's DSL threshold 1.0 acquires the pattern in a quarter of the seeds at the second exposure and forgets it across a quiet stretch, because the fixed threshold writes on 43 percent of the steps and churns the memory; his adaptive threshold theta, realised as mean plus one standard deviation, takes acquisition to 100 percent and retention to 0.95 at the cost of the ordinary flow (ambient 24 against 45); Daniel's live tuner keeps most of the gain with the ordinary flow intact (ambient 41 against 24) and the fewest confident mistakes. On the uniform background every step is surprising, his fixed 1.0 writes everything and still reaches 82 percent, and the negative memory hurts through neighbour leakage (at a background context its best wrong alternative is the learned pattern symbol); a sharper negative read halves the harm. On a deterministic background his fixed 1.0 is perfect, with or without the confuser: a surprise gate stops writing a sequence once it predicts it, so an interferer never outweighs the target. His adaptive theta and the tuner lose there by writing duplicates of the confuser (fairK2: his adaptive theta 97.5, the live tuner 65 percent over exposures 2 to 7; fairK4, soft reads: 55 and 45), and that is exactly where the negative memory earns its place: on top of the tuner it brings fairK2 back to 98 percent (plus 33 points) and fairK4 to 74 (plus 29), on top of his adaptive theta fairK2 to 100 and fairK4 to 95 (plus 40), with the background at 99.6 to 99.8 percent against the fixed 1.0's 91 and with a tenth of the confident mistakes (fairK2: 87 per 1000 for the fixed 1.0, 8.5 for the tuner, 7.8 for tuner plus negative memory). The condition is a negative read sharper than the positive one (beta_neg 54): with the same read (fairK1) the negatives leak between the two look-alike contexts and nothing is gained (45 to 45). Where the negative memory does not add: on the Markov background on top of either adaptive rule (his theta or the tuner; fairK3: 93 to 89 and 96 to 94, within noise; markov: 96 to 95 and 80 to 68), under his fixed 1.0 on any background (it only raises the write rate), and on the uniform background where it hurts. So the measured statement is narrow and clear: the negative memory cancels the interference that an adaptive rule's extra writes create, when its own read is sharper, and it matches the fixed 1.0's perfect deterministic result with a far better background and far fewer confident mistakes; it does not beat his fixed 1.0 on acquisition. The few-shot view says the same in showings: on the deterministic cycle with the confuser and a sharper negative read, the tuner needs 11.8 showings and the tuner with the negative memory 2.8 (fairK2), and with soft positive reads his adaptive theta needs 12.0 and his theta with the negative memory 2.6 (fairK4); it does not show where his fixed 1.0 already learns in 2.0 on the deterministic streams, nor on the Markov background (his theta 2.0 against theta plus negative 2.3; tuner 2.5 against 5.9), nor on the uniform one (fixed 1.0 3.4, theta plus negative 8.6, tuner 3.9 against 3.7). Among the five negative shapes under the fixed 1.0, depth on the negative side and parallel slabs roughly double the flat one. The three controls sit where they must in every block. The named "why not" is at chance on these streams. The place where the formulation is built to pay most, a parametric model whose positive side writes interference at every gradient step, is the next stage, on text.

What Dave's served page shows today (98.0 to 99.5 percent acquisition, FRS 0.95 to 1.00) is produced in its evaluator.js from Math.random and the step count; it is not a result of his design and is not compared here.

## Files

harness.js (the WGSL and the runner, shared by the page and Deno), index.html (the page), run.js (the Deno runner and a static server), formulation.md and fewshot.md (rendered on the page), scripts/ (run-matrix.sh, run-fair.sh and run-compare.sh, which ran every block in a container on the GPU; compare.py, summarize.py and fewshot.py, which made the tables; verify-dave-parser.js, which runs the demo's own parser and compiler) and evidence/ (the raw JSON of every run and the summaries).

## Credits

Dave Raggett (W3C Cognitive AI) for the dual-memory demo, its task and its metrics. J. J. Hopfield (1982), Krotov and Hopfield (2016), Ramsauer et al. (2020) for the memory. Hopfield, Feinstein and Palmer (1983) for unlearning in Hopfield networks, the earlier form of a negative memory inside one network. C. K. Chow (1970) for the reject option. Daniel Campos Ramos for the W- contrastive formulation, the three-dispatch pattern, the 2x2 discipline and the live tuner's core.

## Licence

The W3C Document License, as Dave Raggett's w3c/cogai, on whose dual-memory work this folder builds: see [LICENSE.md](LICENSE.md).
