# Neko Ball

[日本語](README.md) ／ Play: https://techgymjp.github.io/cat/?lang=en ／ How to play: https://techgymjp.github.io/cat/howto-en.html

A 3D forward-scrolling game (Three.js) where a cat curled up into a ball rolls endlessly through a house.

## How to play
- The rooms change as you go: Entrance Hall → Hallway → Living Room (Japanese) → Veranda → Tatami Room → Bedroom → Kids’ Room → Study → Secret Hobby Room → Kitchen → Home Bar → Karaoke Room → Billiard Room → Table Tennis Room → Brick Fireplace Room → Drawing Room → Music Room → Indoor Garden → Attic → Aquarium Room (room 20), then lap 2 starts from the Hallway.
- Each room ends with a wall and a **cat flap**. Steer to line up with it and roll through as a ball. Miss it, or hit it while jumping, and you bonk the wall.
- On the floor the cat is a ball. You have one life: bump into anything solid and the game is over.
- Tap / click / Space to jump. The cat stretches out and turns back into a cat.
- **Sparkling ✨ items** (potted plants, goldfish bowls, dishes, vases, piggy banks, fans, robot vacuums, laundry, and more) can be smashed by touching them, as a ball or as a cat.
- **Furniture** (tables, chests, chairs, counters…) can't be smashed, but you can jump on top and walk along it.
- Some furniture spans the whole room (the entrance step, a sideways bed, kitchen and bar counters…). Jump over it. It is never placed right before a cat flap.
- The first three cat flaps are wider.
- Room surprises
  - Hallway: a vacuum cleaner charges at you. On the first lap it comes straight; from lap 2 it follows you left and right. Jump over it.
  - Japanese living room: a big tabby cat sleeps on a cushion. Roll past it as a ball and it wakes with a hiss and puffs up.
  - Kitchen: a wet floor makes the ball slide sideways out of control.
  - Drawing room: a big dog sleeps by the fireplace. Jump over it and it barks.
  - A blocking piece of furniture and a surprise never share the same section.

| Action | Computer | Phone |
| --- | --- | --- |
| Move | ← → / A D, or drag with the mouse | Drag left or right |
| Jump | Space / ↑ / Click | Tap |

Score = distance traveled + points for smashed items (20 each; smash the next one within 2.5 seconds for a combo, ×2 up to ×5).

The room you reach (room number and lap) is recorded, and your farthest room is shown on the title screen.

The game picks Japanese or English from your browser language. Switch with the button on the title screen, or add `?lang=en` / `?lang=ja` to the URL.

## Android app
Built with Capacitor 8 (package name `jp.techgym.cat`). All game files are bundled, so it plays offline.
- Test APK (test ads, debug signing): built by GitHub Actions on every push to the default branch and published to the `android-latest` release —
  https://github.com/techgymjp/cat/releases/tag/android-latest (QR code: `docs/apk-qr.png`)
- A signed AAB for Google Play is produced when the four `ANDROID_*` secrets are set.

## License
Copyright TECH GYM K.K. All rights reserved. See `LICENSE` (three.js is MIT-licensed).

## Running locally
The game uses ES modules, so serve it over HTTP (Three.js loads from a CDN).
```
python3 -m http.server 8000
```

## Skill simulation
Bots of different skill levels play the real game; the script reports rooms reached, scores and what ended each run.
```
python3 -m http.server 8123 &
node tools/simulate.js 25 240   # 25 runs per level, up to 240 s each
```
Requires Playwright (the `playwright` npm package and Chromium).

## Files
- `index.html` — title screen and HUD
- `js/game.js` — game loop, controls, collisions
- `js/scenes.js` — room definitions, building rooms and cat flaps
- `js/furniture.js` / `js/furniture2.js` — furniture, small items and lights (1 unit ≈ 30 cm)
- `js/gimmicks.js` — room surprises
- `js/cat.js` — the cats (orange tabby and brown tabby)
- `js/bgm.js` — music (Offenbach’s “Galop Infernal”)
- `js/textures.js` — generated floor and wall textures
- `js/i18n.js` — Japanese and English text
- `howto.html` / `howto-en.html` — how-to-play pages
- `tools/simulate.js` — skill simulation
