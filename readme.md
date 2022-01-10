Program counter points to instruction (3 memory addresses).
i.e., First operand address is 3 * PC.

PC could point to memory address directly. What would the advantage be?

Notes:
- Took about 30 min to generate pTau17
- Takes about 10s to generate step_13_32 proof (in js)
- MultiStep steps=2 md=13 (8k+ slots) ss=128 | proof took 21s
    - md=13 seems to take 10-12s per step

valueSize vs subleq #constrains
- 32: 37
- 64: 69
- 128: 133
- 5 + valueSize