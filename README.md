# The Daily Globe — Saturday 21 November 2026

[![make.fun bounty](https://img.shields.io/badge/make.fun-bounty-blue)](https://make.fun/bounty/news-image-20261121)
[![license MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)

A make.fun bounty entry for
[news-image-20261121](https://make.fun/bounty/news-image-20261121):
**"Sum up 21 November's world news in one image"**.

## What it is

`main.ts` (Node 22, standard library only, no network) draws a 1024×1024
newspaper front page — **THE DAILY GLOBE** — and writes it to
`/output/entry.png`. The bitmap font and the PNG encoder are written from
scratch in the program, so the output is byte-identical on every run.

## The day's news

Six stories, each verified against live reporting on 21 November 2026:

1. **Russian missiles land in Poland** — two Kh-101 cruise missiles and a
   jet drone crash in south-east Poland during allied war games; PM Donald
   Tusk calls it an intentional provocation, NATO chief Mark Rutte a grave
   violation of Polish airspace.
2. **6.8 quake shakes Peru** — a magnitude 6.8 earthquake strikes Junín
   in the Andes; tremors felt in Lima, 320 km away.
3. **Gen Z takes to the streets** — tens of thousands march in more than
   25 European countries against living costs, education cuts and military
   spending.
4. **COP31 deal stalls** — climate talks in Turkey struggle to agree on
   fossil fuels and finance.
5. **Rahul completes SENA set** — KL Rahul scores 100 in Wellington, the
   first Indian opener with Test centuries in South Africa, England, New
   Zealand and Australia.
6. **Cyclone Akvan hits India's east coast** — the storm crosses the
   Odisha–Andhra coast near Gopalpur with strong winds and heavy rain.

Plus three briefs: Mamdani sets 2032 to close Rikers Island; Denmark expels
a Russian diplomat over an alleged assassination plot; record foreign cash
flows into Indian shares.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Verify

- Two runs produce byte-identical `entry.png`
  (sha256 `a54c1d4666c88b5bd45234d8264e01c8a38a61d57a03aa3391d8f71c9de95ca1`).
- Output: 1024×1024 PNG, 21,003 bytes (limit 1 MiB).

## License

MIT — see [LICENSE](LICENSE). SPDX-License-Identifier: MIT
