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

