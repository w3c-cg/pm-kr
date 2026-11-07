
### All arms, lavapipe (230 runs)

| block | task | beta | kind | lambda | decisor | neg write | evict | arm | n | 1-shot p1 | p2 | p3 | 1-shot (p2,p3) +- sd | acq k2-7 +- sd | FRS +- sd (n) | ambient | surprise | writes+ | writes- | steps/s |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| A-markov-b18-decay | markov | 18 | flat_linear | 1 | logratio | gated | decay | baseline | 10 | 10.0 | 30.0 | 20.0 | 25.0 +- 26.4 | 25.8 +- 21.0 | 0.00 +- 0.00 (5) | 44.5 | 1.40 | 3411 | 0 | 1244 |
| A-markov-b18-decay | markov | 18 | flat_linear | 1 | logratio | gated | decay | both | 10 | 20.0 | 90.0 | 90.0 | 90.0 +- 21.1 | 95.0 +- 8.1 | 0.80 +- 0.35 (10) | 28.3 | 2.35 | 493 | 348 | 1080 |
| A-markov-b18-decay | markov | 18 | flat_linear | 1 | logratio | gated | decay | contrastive | 10 | 10.0 | 40.0 | 30.0 | 35.0 +- 24.2 | 31.7 +- 21.1 | 0.25 +- 0.50 (4) | 43.0 | 1.86 | 6174 | 5025 | 697 |
| A-markov-b18-decay | markov | 18 | flat_linear | 1 | logratio | gated | decay | control | 10 | 70.0 | 100.0 | 100.0 | 100.0 +- 0.0 | 95.8 +- 10.6 | 0.95 +- 0.16 (10) | 23.7 | 2.49 | 428 | 0 | 1255 |
| A-markov-b18-decay | markov | 18 | flat_linear | 1 | logratio | gated | decay | ctrl-nomem | 10 | 0.0 | 0.0 | 0.0 | 0.0 +- 0.0 | 0.0 +- 0.0 | nan +- nan (0) | 6.4 | 2.77 | 0 | 0 | 1564 |
| A-markov-b18-decay | markov | 18 | flat_linear | 1 | logratio | gated | decay | ctrl-randomneg | 10 | 10.0 | 30.0 | 20.0 | 25.0 +- 26.4 | 25.8 +- 21.0 | 0.00 +- 0.00 (5) | 44.3 | 1.40 | 3412 | 0 | 560 |
| A-markov-b18-decay | markov | 18 | flat_linear | 1 | logratio | gated | decay | ctrl-scrambled | 10 | 0.0 | 0.0 | 0.0 | 0.0 +- 0.0 | 8.3 +- 5.6 | 0.00 +- 0.00 (4) | 27.5 | 2.35 | 487 | 333 | 1999 |
| B-markov-b18-fifo | markov | 18 | flat_linear | 1 | logratio | gated | fifo | baseline | 10 | 10.0 | 30.0 | 20.0 | 25.0 +- 26.4 | 25.8 +- 21.0 | 0.40 +- 0.55 (5) | 45.2 | 1.28 | 3248 | 0 | 1886 |
| B-markov-b18-fifo | markov | 18 | flat_linear | 1 | logratio | gated | fifo | both | 10 | 20.0 | 90.0 | 90.0 | 90.0 +- 21.1 | 95.0 +- 8.1 | 0.80 +- 0.35 (10) | 28.3 | 2.35 | 493 | 348 | 1581 |
| B-markov-b18-fifo | markov | 18 | flat_linear | 1 | logratio | gated | fifo | contrastive | 10 | 10.0 | 40.0 | 30.0 | 35.0 +- 24.2 | 35.8 +- 23.6 | 0.29 +- 0.49 (7) | 44.6 | 1.61 | 5768 | 4921 | 1403 |
| B-markov-b18-fifo | markov | 18 | flat_linear | 1 | logratio | gated | fifo | control | 10 | 70.0 | 100.0 | 100.0 | 100.0 +- 0.0 | 95.8 +- 10.6 | 0.95 +- 0.16 (10) | 23.7 | 2.49 | 428 | 0 | 3288 |
| C-markov-b8-decay | markov | 8 | flat_linear | 1 | logratio | gated | decay | baseline | 10 | 0.0 | 0.0 | 10.0 | 5.0 +- 15.8 | 9.2 +- 15.4 | 0.00 +- 0.00 (3) | 44.1 | 1.39 | 3739 | 0 | 2057 |
| C-markov-b8-decay | markov | 8 | flat_linear | 1 | logratio | gated | decay | both | 10 | 40.0 | 60.0 | 40.0 | 50.0 +- 40.8 | 60.0 +- 32.1 | 0.44 +- 0.42 (8) | 30.6 | 2.35 | 602 | 382 | 3144 |
| C-markov-b8-decay | markov | 8 | flat_linear | 1 | logratio | gated | decay | contrastive | 10 | 0.0 | 0.0 | 10.0 | 5.0 +- 15.8 | 5.0 +- 11.2 | 0.00 +- nan (1) | 44.0 | 1.47 | 4962 | 4030 | 2298 |
| C-markov-b8-decay | markov | 8 | flat_linear | 1 | logratio | gated | decay | control | 10 | 50.0 | 70.0 | 60.0 | 65.0 +- 41.2 | 64.2 +- 25.5 | 1.06 +- 0.63 (9) | 23.1 | 2.56 | 486 | 0 | 3897 |
| C-markov-b8-decay | markov | 8 | flat_linear | 1 | logratio | gated | decay | ctrl-randomneg | 10 | 0.0 | 0.0 | 10.0 | 5.0 +- 15.8 | 8.3 +- 13.6 | 0.00 +- 0.00 (3) | 44.1 | 1.39 | 3730 | 0 | 921 |
| D-uniform-b18-decay | uniform | 18 | flat_linear | 1 | logratio | gated | decay | baseline | 10 | 20.0 | 50.0 | 40.0 | 45.0 +- 43.8 | 82.5 +- 14.4 | 0.60 +- 0.66 (10) | 6.3 | 3.01 | 7993 | 0 | 2352 |
| D-uniform-b18-decay | uniform | 18 | flat_linear | 1 | logratio | gated | decay | both | 10 | 30.0 | 70.0 | 30.0 | 50.0 +- 40.8 | 48.3 +- 24.5 | 0.78 +- 0.67 (9) | 6.2 | 2.80 | 1076 | 626 | 1922 |
| D-uniform-b18-decay | uniform | 18 | flat_linear | 1 | logratio | gated | decay | contrastive | 10 | 10.0 | 40.0 | 10.0 | 25.0 +- 35.4 | 25.8 +- 16.4 | 0.00 +- 0.00 (2) | 6.4 | 3.03 | 7993 | 2819 | 1514 |
| D-uniform-b18-decay | uniform | 18 | flat_linear | 1 | logratio | gated | decay | control | 10 | 30.0 | 90.0 | 100.0 | 95.0 +- 15.8 | 73.3 +- 18.8 | 0.44 +- 0.73 (8) | 6.3 | 2.80 | 1088 | 0 | 4082 |
| D-uniform-b18-decay | uniform | 18 | flat_linear | 1 | logratio | gated | decay | ctrl-nomem | 10 | 0.0 | 0.0 | 0.0 | 0.0 +- 0.0 | 0.0 +- 0.0 | nan +- nan (0) | 6.2 | 2.77 | 0 | 0 | 2297 |
| D-uniform-b18-decay | uniform | 18 | flat_linear | 1 | logratio | gated | decay | ctrl-randomneg | 10 | 20.0 | 50.0 | 40.0 | 45.0 +- 43.8 | 82.5 +- 14.4 | 0.60 +- 0.66 (10) | 6.3 | 3.01 | 7993 | 0 | 468 |
| D-uniform-b18-decay | uniform | 18 | flat_linear | 1 | logratio | gated | decay | ctrl-scrambled | 10 | 0.0 | 10.0 | 0.0 | 5.0 +- 15.8 | 8.3 +- 6.8 | 0.00 +- 0.00 (4) | 6.3 | 2.80 | 1067 | 625 | 999 |

### 2x2 (differences from the baseline, in points of accuracy; FRS as a ratio)

| block | task | beta | kind | lambda | decisor | neg write | evict | metric | baseline | control | contrastive | both | sum of singles | synergy |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| A-markov-b18-decay | markov | 18 | flat_linear | 1 | logratio | gated | decay | oneShot23 | 25.0 | 75.0 | 10.0 | 65.0 | 85.0 | -20.0 |
| A-markov-b18-decay | markov | 18 | flat_linear | 1 | logratio | gated | decay | acq27 | 25.8 | 70.0 | 5.8 | 69.2 | 75.8 | -6.7 |
| A-markov-b18-decay | markov | 18 | flat_linear | 1 | logratio | gated | decay | frs | 0.00 | 0.95 | 0.25 | 0.80 | 1.20 | -0.40 |
| B-markov-b18-fifo | markov | 18 | flat_linear | 1 | logratio | gated | fifo | oneShot23 | 25.0 | 75.0 | 10.0 | 65.0 | 85.0 | -20.0 |
| B-markov-b18-fifo | markov | 18 | flat_linear | 1 | logratio | gated | fifo | acq27 | 25.8 | 70.0 | 10.0 | 69.2 | 80.0 | -10.8 |
| B-markov-b18-fifo | markov | 18 | flat_linear | 1 | logratio | gated | fifo | frs | 0.40 | 0.55 | -0.11 | 0.40 | 0.44 | -0.04 |
| C-markov-b8-decay | markov | 8 | flat_linear | 1 | logratio | gated | decay | oneShot23 | 5.0 | 60.0 | 0.0 | 45.0 | 60.0 | -15.0 |
| C-markov-b8-decay | markov | 8 | flat_linear | 1 | logratio | gated | decay | acq27 | 9.2 | 55.0 | -4.2 | 50.8 | 50.8 | -0.0 |
| C-markov-b8-decay | markov | 8 | flat_linear | 1 | logratio | gated | decay | frs | 0.00 | 1.06 | 0.00 | 0.44 | 1.06 | -0.62 |
| D-uniform-b18-decay | uniform | 18 | flat_linear | 1 | logratio | gated | decay | oneShot23 | 45.0 | 50.0 | -20.0 | 5.0 | 30.0 | -25.0 |
| D-uniform-b18-decay | uniform | 18 | flat_linear | 1 | logratio | gated | decay | acq27 | 82.5 | -9.2 | -56.7 | -34.2 | -65.8 | 31.7 |
| D-uniform-b18-decay | uniform | 18 | flat_linear | 1 | logratio | gated | decay | frs | 0.60 | -0.16 | -0.60 | 0.18 | -0.76 | 0.94 |

### All arms, nvidia (510 runs)

| block | task | beta | kind | lambda | decisor | neg write | evict | arm | n | 1-shot p1 | p2 | p3 | 1-shot (p2,p3) +- sd | acq k2-7 +- sd | FRS +- sd (n) | ambient | surprise | writes+ | writes- | steps/s |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| A-markov-b18-decay | markov | 18 | flat_linear | 1 | logratio | gated | decay | baseline | 10 | 10.0 | 30.0 | 20.0 | 25.0 +- 26.4 | 25.8 +- 21.0 | 0.00 +- 0.00 (5) | 44.5 | 1.40 | 3411 | 0 | 9335 |
| A-markov-b18-decay | markov | 18 | flat_linear | 1 | logratio | gated | decay | both | 10 | 20.0 | 90.0 | 90.0 | 90.0 +- 21.1 | 95.0 +- 8.1 | 0.80 +- 0.35 (10) | 28.3 | 2.35 | 493 | 348 | 4322 |
| A-markov-b18-decay | markov | 18 | flat_linear | 1 | logratio | gated | decay | contrastive | 10 | 10.0 | 40.0 | 30.0 | 35.0 +- 24.2 | 31.7 +- 21.1 | 0.25 +- 0.50 (4) | 43.0 | 1.86 | 6168 | 5024 | 3495 |
| A-markov-b18-decay | markov | 18 | flat_linear | 1 | logratio | gated | decay | control | 10 | 70.0 | 100.0 | 100.0 | 100.0 +- 0.0 | 95.8 +- 10.6 | 0.95 +- 0.16 (10) | 23.7 | 2.49 | 428 | 0 | 10312 |
| A-markov-b18-decay | markov | 18 | flat_linear | 1 | logratio | gated | decay | ctrl-nomem | 10 | 0.0 | 0.0 | 0.0 | 0.0 +- 0.0 | 0.0 +- 0.0 | nan +- nan (0) | 6.4 | 2.77 | 0 | 0 | 23470 |
| A-markov-b18-decay | markov | 18 | flat_linear | 1 | logratio | gated | decay | ctrl-randomneg | 10 | 10.0 | 30.0 | 20.0 | 25.0 +- 26.4 | 25.8 +- 21.0 | 0.00 +- 0.00 (5) | 44.3 | 1.40 | 3410 | 0 | 3394 |
| A-markov-b18-decay | markov | 18 | flat_linear | 1 | logratio | gated | decay | ctrl-scrambled | 10 | 0.0 | 0.0 | 0.0 | 0.0 +- 0.0 | 8.3 +- 5.6 | 0.00 +- 0.00 (4) | 27.2 | 2.36 | 483 | 328 | 4326 |
| B-markov-b18-fifo | markov | 18 | flat_linear | 1 | logratio | gated | fifo | baseline | 10 | 10.0 | 30.0 | 20.0 | 25.0 +- 26.4 | 25.8 +- 21.0 | 0.40 +- 0.55 (5) | 45.2 | 1.28 | 3248 | 0 | 6055 |
| B-markov-b18-fifo | markov | 18 | flat_linear | 1 | logratio | gated | fifo | both | 10 | 20.0 | 90.0 | 90.0 | 90.0 +- 21.1 | 95.0 +- 8.1 | 0.80 +- 0.35 (10) | 28.3 | 2.35 | 493 | 348 | 5595 |
| B-markov-b18-fifo | markov | 18 | flat_linear | 1 | logratio | gated | fifo | contrastive | 10 | 10.0 | 40.0 | 30.0 | 35.0 +- 24.2 | 35.8 +- 23.6 | 0.29 +- 0.49 (7) | 44.6 | 1.61 | 5768 | 4921 | 2617 |
| B-markov-b18-fifo | markov | 18 | flat_linear | 1 | logratio | gated | fifo | control | 10 | 70.0 | 100.0 | 100.0 | 100.0 +- 0.0 | 95.8 +- 10.6 | 0.95 +- 0.16 (10) | 23.7 | 2.49 | 428 | 0 | 12036 |
| C-markov-b8-decay | markov | 8 | flat_linear | 1 | logratio | gated | decay | baseline | 10 | 0.0 | 0.0 | 10.0 | 5.0 +- 15.8 | 9.2 +- 15.4 | 0.00 +- 0.00 (3) | 44.1 | 1.39 | 3746 | 0 | 9428 |
| C-markov-b8-decay | markov | 8 | flat_linear | 1 | logratio | gated | decay | both | 10 | 40.0 | 60.0 | 40.0 | 50.0 +- 40.8 | 60.0 +- 32.1 | 0.44 +- 0.42 (8) | 30.6 | 2.35 | 602 | 382 | 4930 |
| C-markov-b8-decay | markov | 8 | flat_linear | 1 | logratio | gated | decay | contrastive | 10 | 0.0 | 0.0 | 10.0 | 5.0 +- 15.8 | 5.0 +- 11.2 | 0.00 +- nan (1) | 44.0 | 1.47 | 4962 | 4030 | 4128 |
| C-markov-b8-decay | markov | 8 | flat_linear | 1 | logratio | gated | decay | control | 10 | 50.0 | 70.0 | 60.0 | 65.0 +- 41.2 | 64.2 +- 25.5 | 1.06 +- 0.63 (9) | 23.1 | 2.56 | 486 | 0 | 10464 |
| C-markov-b8-decay | markov | 8 | flat_linear | 1 | logratio | gated | decay | ctrl-randomneg | 10 | 0.0 | 0.0 | 10.0 | 5.0 +- 15.8 | 8.3 +- 13.6 | 0.00 +- 0.00 (3) | 44.0 | 1.39 | 3724 | 0 | 3505 |
| D-uniform-b18-decay | uniform | 18 | flat_linear | 1 | logratio | gated | decay | baseline | 10 | 20.0 | 50.0 | 40.0 | 45.0 +- 43.8 | 82.5 +- 14.4 | 0.60 +- 0.66 (10) | 6.3 | 3.01 | 7993 | 0 | 9350 |
| D-uniform-b18-decay | uniform | 18 | flat_linear | 1 | logratio | gated | decay | both | 10 | 30.0 | 70.0 | 30.0 | 50.0 +- 40.8 | 48.3 +- 24.5 | 0.78 +- 0.67 (9) | 6.2 | 2.80 | 1076 | 626 | 3912 |
| D-uniform-b18-decay | uniform | 18 | flat_linear | 1 | logratio | gated | decay | contrastive | 10 | 10.0 | 40.0 | 10.0 | 25.0 +- 35.4 | 25.8 +- 16.4 | 0.00 +- 0.00 (2) | 6.4 | 3.03 | 7993 | 2819 | 3009 |
| D-uniform-b18-decay | uniform | 18 | flat_linear | 1 | logratio | gated | decay | control | 10 | 30.0 | 90.0 | 100.0 | 95.0 +- 15.8 | 73.3 +- 18.8 | 0.44 +- 0.73 (8) | 6.3 | 2.80 | 1088 | 0 | 9910 |
| D-uniform-b18-decay | uniform | 18 | flat_linear | 1 | logratio | gated | decay | ctrl-nomem | 10 | 0.0 | 0.0 | 0.0 | 0.0 +- 0.0 | 0.0 +- 0.0 | nan +- nan (0) | 6.2 | 2.77 | 0 | 0 | 22559 |
| D-uniform-b18-decay | uniform | 18 | flat_linear | 1 | logratio | gated | decay | ctrl-randomneg | 10 | 20.0 | 50.0 | 40.0 | 45.0 +- 43.8 | 82.5 +- 14.4 | 0.60 +- 0.66 (10) | 6.3 | 3.01 | 7993 | 0 | 3482 |
| D-uniform-b18-decay | uniform | 18 | flat_linear | 1 | logratio | gated | decay | ctrl-scrambled | 10 | 0.0 | 10.0 | 0.0 | 5.0 +- 15.8 | 8.3 +- 6.8 | 0.00 +- 0.00 (4) | 6.4 | 2.80 | 1066 | 623 | 3918 |
| E-kinds-markov-b18 | markov | 18 | anti_swiglu_gate | 1 | logratio | gated | decay | both | 10 | 40.0 | 100.0 | 90.0 | 95.0 +- 15.8 | 93.3 +- 8.6 | 0.70 +- 0.42 (10) | 27.1 | 2.38 | 474 | 334 | 2030 |
| E-kinds-markov-b18 | markov | 18 | anti_swiglu_gate | 1 | logratio | gated | decay | contrastive | 10 | 10.0 | 40.0 | 30.0 | 35.0 +- 24.2 | 25.8 +- 21.7 | 0.00 +- 0.00 (2) | 42.9 | 1.73 | 6076 | 5148 | 1509 |
| E-kinds-markov-b18 | markov | 18 | anti_tanh_flat | 1 | logratio | gated | decay | both | 10 | 20.0 | 90.0 | 80.0 | 85.0 +- 24.2 | 82.5 +- 16.9 | 0.75 +- 0.75 (10) | 29.6 | 2.23 | 563 | 406 | 1987 |
| E-kinds-markov-b18 | markov | 18 | anti_tanh_flat | 1 | logratio | gated | decay | contrastive | 10 | 0.0 | 60.0 | 30.0 | 45.0 +- 15.8 | 46.7 +- 14.8 | 1.00 +- 0.58 (7) | 28.4 | 2.53 | 7472 | 6357 | 1418 |
| E-kinds-markov-b18 | markov | 18 | flat_linear | 1 | logratio | gated | decay | both | 10 | 20.0 | 90.0 | 90.0 | 90.0 +- 21.1 | 95.0 +- 8.1 | 0.80 +- 0.35 (10) | 28.3 | 2.35 | 493 | 348 | 4456 |
| E-kinds-markov-b18 | markov | 18 | flat_linear | 1 | logratio | gated | decay | contrastive | 10 | 10.0 | 40.0 | 30.0 | 35.0 +- 24.2 | 31.7 +- 21.1 | 0.25 +- 0.50 (4) | 43.0 | 1.86 | 6168 | 5024 | 3556 |
| E-kinds-markov-b18 | markov | 18 | multi_slab_parallel | 1 | logratio | gated | decay | both | 10 | 30.0 | 90.0 | 90.0 | 90.0 +- 21.1 | 85.0 +- 18.8 | 0.95 +- 0.50 (10) | 30.1 | 2.21 | 553 | 1467 | 1528 |
| E-kinds-markov-b18 | markov | 18 | multi_slab_parallel | 1 | logratio | gated | decay | contrastive | 10 | 0.0 | 40.0 | 20.0 | 30.0 +- 25.8 | 48.3 +- 11.7 | 0.64 +- 0.48 (7) | 41.6 | 2.25 | 7580 | 15897 | 1073 |
| E-kinds-markov-b18 | markov | 18 | recursive_inverted | 1 | logratio | gated | decay | both | 10 | 30.0 | 90.0 | 80.0 | 85.0 +- 24.2 | 89.2 +- 11.8 | 1.20 +- 0.59 (10) | 28.3 | 2.33 | 498 | 337 | 1046 |
| E-kinds-markov-b18 | markov | 18 | recursive_inverted | 1 | logratio | gated | decay | contrastive | 10 | 10.0 | 40.0 | 30.0 | 35.0 +- 24.2 | 47.5 +- 22.6 | 0.86 +- 0.69 (7) | 41.1 | 2.14 | 7024 | 5779 | 993 |
| F-decisors-markov-b18 | markov | 18 | flat_linear | 1 | diff | gated | decay | both | 10 | 0.0 | 50.0 | 50.0 | 50.0 +- 40.8 | 25.0 +- 28.1 | 0.80 +- 0.84 (5) | 40.5 | 2.96 | 2226 | 2062 | 3876 |
| F-decisors-markov-b18 | markov | 18 | flat_linear | 1 | diff | gated | decay | contrastive | 10 | 0.0 | 40.0 | 30.0 | 35.0 +- 24.2 | 52.5 +- 14.7 | 0.50 +- 0.55 (6) | 32.1 | 3.90 | 6076 | 5076 | 3473 |
| F-decisors-markov-b18 | markov | 18 | flat_linear | 1 | mass | gated | decay | both | 10 | 10.0 | 60.0 | 80.0 | 70.0 +- 35.0 | 69.2 +- 30.9 | 0.61 +- 0.49 (9) | 37.8 | 2.34 | 518 | 365 | 4403 |
| F-decisors-markov-b18 | markov | 18 | flat_linear | 1 | mass | gated | decay | contrastive | 10 | 0.0 | 40.0 | 30.0 | 35.0 +- 24.2 | 23.3 +- 23.5 | 0.00 +- 0.00 (4) | 43.8 | 1.46 | 3486 | 2594 | 3728 |
| G-lambda-markov-b18 | markov | 18 | flat_linear | 0.5 | logratio | gated | decay | both | 10 | 50.0 | 90.0 | 100.0 | 95.0 +- 15.8 | 95.0 +- 8.1 | 1.00 +- 0.47 (10) | 26.8 | 2.45 | 451 | 314 | 4366 |
| G-lambda-markov-b18 | markov | 18 | flat_linear | 0.5 | logratio | gated | decay | contrastive | 10 | 10.0 | 40.0 | 20.0 | 30.0 +- 25.8 | 25.8 +- 22.7 | 0.00 +- 0.00 (5) | 43.7 | 1.50 | 4711 | 3752 | 3654 |
| G-lambda-markov-b18 | markov | 18 | flat_linear | 2 | logratio | gated | decay | both | 10 | 10.0 | 100.0 | 80.0 | 90.0 +- 21.1 | 82.5 +- 19.0 | 0.45 +- 0.50 (10) | 31.4 | 2.16 | 616 | 454 | 4242 |
| G-lambda-markov-b18 | markov | 18 | flat_linear | 2 | logratio | gated | decay | contrastive | 10 | 0.0 | 40.0 | 30.0 | 35.0 +- 24.2 | 67.5 +- 12.1 | 0.75 +- 0.46 (8) | 22.4 | 3.22 | 7230 | 5683 | 3349 |
| H-negwrite-always-markov-b18 | markov | 18 | flat_linear | 1 | logratio | always | decay | both | 10 | 20.0 | 100.0 | 100.0 | 100.0 +- 0.0 | 88.3 +- 14.8 | 0.75 +- 0.35 (10) | 23.0 | 2.45 | 552 | 2453 | 3480 |
| H-negwrite-always-markov-b18 | markov | 18 | flat_linear | 1 | logratio | always | decay | contrastive | 10 | 10.0 | 40.0 | 30.0 | 35.0 +- 24.2 | 28.3 +- 16.3 | 0.33 +- 0.58 (3) | 42.4 | 1.98 | 6772 | 6021 | 3294 |
| J-betaneg-markov-uniform-b18 | markov | 18 | flat_linear | 1 | logratio | gated-bn36 | decay | both | 10 | 50.0 | 100.0 | 90.0 | 95.0 +- 15.8 | 96.7 +- 8.1 | 0.80 +- 0.35 (10) | 28.8 | 2.34 | 491 | 343 | 1980 |
| J-betaneg-markov-uniform-b18 | markov | 18 | flat_linear | 1 | logratio | gated-bn36 | decay | contrastive | 10 | 10.0 | 40.0 | 20.0 | 30.0 +- 25.8 | 25.8 +- 23.1 | 0.00 +- 0.00 (4) | 43.6 | 1.52 | 4828 | 3838 | 1620 |
| J-betaneg-markov-uniform-b18 | markov | 18 | flat_linear | 1 | logratio | gated-bn54 | decay | both | 10 | 60.0 | 100.0 | 100.0 | 100.0 +- 0.0 | 95.8 +- 10.6 | 0.80 +- 0.35 (10) | 28.1 | 2.35 | 483 | 340 | 2034 |
| J-betaneg-markov-uniform-b18 | markov | 18 | flat_linear | 1 | logratio | gated-bn54 | decay | contrastive | 10 | 10.0 | 30.0 | 20.0 | 25.0 +- 26.4 | 21.7 +- 23.0 | 0.00 +- 0.00 (4) | 43.8 | 1.45 | 4529 | 3571 | 1712 |
| J-betaneg-markov-uniform-b18 | uniform | 18 | flat_linear | 1 | logratio | gated-bn36 | decay | both | 10 | 40.0 | 70.0 | 60.0 | 65.0 +- 41.2 | 65.0 +- 14.1 | 0.22 +- 0.67 (9) | 6.3 | 2.80 | 1056 | 612 | 1752 |
| J-betaneg-markov-uniform-b18 | uniform | 18 | flat_linear | 1 | logratio | gated-bn36 | decay | contrastive | 10 | 10.0 | 50.0 | 20.0 | 35.0 +- 33.7 | 41.7 +- 15.2 | 0.20 +- 0.45 (5) | 6.4 | 2.99 | 7993 | 2556 | 1356 |
| J-betaneg-markov-uniform-b18 | uniform | 18 | flat_linear | 1 | logratio | gated-bn54 | decay | both | 10 | 30.0 | 70.0 | 60.0 | 65.0 +- 41.2 | 66.7 +- 11.1 | 0.21 +- 0.39 (7) | 6.2 | 2.79 | 1047 | 614 | 1663 |
| J-betaneg-markov-uniform-b18 | uniform | 18 | flat_linear | 1 | logratio | gated-bn54 | decay | contrastive | 10 | 10.0 | 40.0 | 20.0 | 30.0 +- 35.0 | 54.2 +- 18.1 | 0.33 +- 0.50 (9) | 6.4 | 2.99 | 7992 | 2369 | 1334 |

### 2x2 (differences from the baseline, in points of accuracy; FRS as a ratio)

| block | task | beta | kind | lambda | decisor | neg write | evict | metric | baseline | control | contrastive | both | sum of singles | synergy |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| A-markov-b18-decay | markov | 18 | flat_linear | 1 | logratio | gated | decay | oneShot23 | 25.0 | 75.0 | 10.0 | 65.0 | 85.0 | -20.0 |
| A-markov-b18-decay | markov | 18 | flat_linear | 1 | logratio | gated | decay | acq27 | 25.8 | 70.0 | 5.8 | 69.2 | 75.8 | -6.7 |
| A-markov-b18-decay | markov | 18 | flat_linear | 1 | logratio | gated | decay | frs | 0.00 | 0.95 | 0.25 | 0.80 | 1.20 | -0.40 |
| B-markov-b18-fifo | markov | 18 | flat_linear | 1 | logratio | gated | fifo | oneShot23 | 25.0 | 75.0 | 10.0 | 65.0 | 85.0 | -20.0 |
| B-markov-b18-fifo | markov | 18 | flat_linear | 1 | logratio | gated | fifo | acq27 | 25.8 | 70.0 | 10.0 | 69.2 | 80.0 | -10.8 |
| B-markov-b18-fifo | markov | 18 | flat_linear | 1 | logratio | gated | fifo | frs | 0.40 | 0.55 | -0.11 | 0.40 | 0.44 | -0.04 |
| C-markov-b8-decay | markov | 8 | flat_linear | 1 | logratio | gated | decay | oneShot23 | 5.0 | 60.0 | 0.0 | 45.0 | 60.0 | -15.0 |
| C-markov-b8-decay | markov | 8 | flat_linear | 1 | logratio | gated | decay | acq27 | 9.2 | 55.0 | -4.2 | 50.8 | 50.8 | -0.0 |
| C-markov-b8-decay | markov | 8 | flat_linear | 1 | logratio | gated | decay | frs | 0.00 | 1.06 | 0.00 | 0.44 | 1.06 | -0.62 |
| D-uniform-b18-decay | uniform | 18 | flat_linear | 1 | logratio | gated | decay | oneShot23 | 45.0 | 50.0 | -20.0 | 5.0 | 30.0 | -25.0 |
| D-uniform-b18-decay | uniform | 18 | flat_linear | 1 | logratio | gated | decay | acq27 | 82.5 | -9.2 | -56.7 | -34.2 | -65.8 | 31.7 |
| D-uniform-b18-decay | uniform | 18 | flat_linear | 1 | logratio | gated | decay | frs | 0.60 | -0.16 | -0.60 | 0.18 | -0.76 | 0.94 |

### Cross-adapter check: lavapipe against nvidia, same seed, same arm

- runs in common: 230
- identical acquisition curves (every exposure, every position): 227 of 230
- identical write counts: 215 of 230
- mean absolute difference, acq k2-7: 0.0 points; ambient accuracy: 0.0 points; largest acq difference: 0.0
- mean steps/s: lavapipe 1848, nvidia 7546
