# BUILD_LOG.md — news-image-20261121

## 2026-11-21 ~10:42 WIB — research
- Read the kit's RULES.txt and competition.yaml in full.
- Researched Saturday 21 November 2026 world news via live web search
  (news vertical). Verified the lead stories against multiple outlets:
  AP / The Times / ISW for the Russian missiles in Poland; CNN / Reuters
  for the Gen Z protests across 25+ European countries; The Daily Short
  and Indian press for the Peru quake, Cyclone Akvan, KL Rahul's century
  and the record foreign investment into Indian shares.

## 2026-11-21 ~10:50 WIB — build
- Wrote `main.ts` from scratch with file write/edit tools (no shell-written
  code, no kit starter copied). Node 22, standard library only, no network.
- The program draws a 1024x1024 newspaper front page ("THE DAILY GLOBE"):
  masthead with the date "SATURDAY, 21 NOVEMBER 2026", a lead story on the
  Poland missile incursion with a drawn missile/blast illustration, a 2x2
  grid (Peru quake, Gen Z protests, COP31, Rahul) each with its own small
  geometric illustration, and an "ALSO TODAY" footer strip of three briefs.
- A hand-written 5x7 bitmap font (capitals, digits, punctuation) and a
  from-scratch PNG encoder (CRC32 + zlib level 9) make the output fully
  deterministic.
- Added LICENSE (MIT), README.md, BUILD_LOG.md and
  `.makefun/owner.json` (wallet Cfdgeggmd6ij5dLpqwmqAaGExTbi4JPZJYcRdi4iSjSW).

## Verification
- Ran the program twice into separate output dirs:
  `out1/entry.png` and `out2/entry.png` are byte-identical.
- sha256: `a54c1d4666c88b5bd45234d8264e01c8a38a61d57a03aa3391d8f71c9de95ca1`
- Size: 21,003 bytes (limit 1,048,576). Dimensions: 1024x1024 (limit 1024x1024).
- Visual check: front page reads cleanly at full size; crowd illustration
  fixed after a first render showed it overflowing its art box.
- Kit check (`node cli/makefun.mjs check --kit . --repo <repo>`) run from
  the kit dir: see the report back to the main agent for the outcome
  (transcript bundling and submission are done by the main agent).

## Status
- Built and verified. NOT bundled, NOT submitted.
