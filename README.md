# The Copper Ladle

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/bamphd/copper-ladle/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/bamphd/copper-ladle/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

A rush-hour kitchen game. You are the only chef in The Copper Ladle, a small
copper-and-timber kitchen, and the tickets keep coming. Grab ingredients from
the pantry, chop them on the board, cook patties on the stove before they burn,
build each dish on the plate exactly as the ticket asks, and ring the bell at
the serve window before the ticket's patience runs out. Serve fast and the
combo grows; let a ticket expire and the combo dies with it. The last thirty
seconds of every shift are rush hour: tickets arrive faster, patience runs
shorter, and every serve pays double.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. Move with WASD or the arrow keys (or click
anywhere to walk there), press E to pick up, chop, cook, plate and serve (hold
E to chop), Q to throw something away, P to pause, M to mute. Everything is
drawn and sounded by the game itself — no files are fetched from the network,
and the sounds are synthesized live with WebAudio.

## How it is built

Plain HTML and canvas, vanilla JavaScript in one file per job: `config.js`
holds the numbers, `orders.js` runs the ticket board, `kitchen.js` runs the
chef and the stations, `render.js` draws it all, `audio.js` synthesizes the
sizzle and the bell, `input.js` reads keys and clicks, `shots.js` stages the
screenshot scenes, and `main.js` runs the loop.

---

<sub>Entered on [make.fun](https://make.fun/?ref=7billions&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
