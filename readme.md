Program counter points to instruction (3 memory addresses).
i.e., First operand address is 3 * PC.

PC could point to memory address directly. What would the advantage be?

Notes:
- Took about 30 min to generate pTau17
- Takes about 10s to generate step_13_32 proof (in js)
- MultiStep steps=2 md=13 (8k+ slots) ss=128 | proof took 21s
    - md=13 seems to take 10-12s per step
- 256949 constrains (just under 2**18) for step md=32, ss=128

valueSize vs subleq #constrains
- 32: 37
- 64: 69
- 128: 133
- 5 + valueSize

Jan 13

- MiMCSponge(2, 220, 1) has 1320 constrains
- Merkle tree checker levels=32 has 42336 constrains, 1323
- Merkle tree checker levels=34 has 44982 constrains, 1323
- So for current step (6 long merkle proofs per cycle) n constrains =
6 * 1323 * md + some change


If doing 2 long merkle proofs per cycle would be:
2 * 1323 * md + some change
for md = 32, constrains a bit over 84672 (2**16.36...)
for md = 24, constrains a bit over 63504 (2**15.95...) # might just not fit when adding change
for md = 16, constrains a bit over 42336 (2**15.36...)

If doing 4 long merkle proofs per cycle would be:
4 * 1323 * md + some change
for md = 32, constrains a bit over 169344 (2**17.36...)
for md = 24, constrains a bit over 127008 (2**16.95...) # might just not fit when adding change
for md = 16, constrains a bit over 84672 (2**16.36...)
