# Last Light

[Play on Dewdrop](https://alpha.dewdrop.world/play/last-light)

An original Three.js survival game built with the Dewdrop SDK. Two adult survivors hold an overgrown town at dawn against escalating infected waves. Control Rowan while Mara follows and fires automatically. Both must survive.

## Play

- WASD or arrow keys: move
- Mouse: aim; hold left mouse button: fire
- R: reload (12-round magazine, unlimited reserve)
- Space: evade (2.5-second cooldown)
- E: spend a medkit to restore 45 health to both survivors
- P: pause

Waves advance every 30 seconds. Fungal brutes arrive from wave 2. Every eight kills drops a medical supply box. Walk over it to collect it. The run ends when either survivor dies, and the best kill count is saved locally.

## Development

Requires Node.js 24+ per Dewdrop docs. This project also built successfully with the locally installed Node 22.21.0.

```sh
npm install
npm run dev
npx dewctl login
npx dewctl dev --watch
npx dewctl publish
```

`npm run dev` displays the geometry and verifies gameplay. Dewdrop's AI renderer uses the scene style prompt, background description, and mesh descriptions to render the cinematic surfaces. Lights and fog are useful only for local preview; the hosted look is authored through base mesh colors and descriptions.

Documentation: https://alpha.dewdrop.world/docs

## Blender character pipeline

`tools/build_characters.py` runs in Blender 4.5 and generates `rowan.glb`, `mara.glb`, and `brute.glb` under `public/models`. The editable scene is saved to `assets/last-light-characters.blend`. Each mesh carries a Dewdrop description via glTF extras; base colors use linear values converted from the authored sRGB palette. Three.js loads these with GLTFLoader and animates named arm and leg pivots.

The latest version supports both WASD and all four arrow keys. A brute appears in the first wave, with additional brutes from wave 2. The town includes 650 instanced grass blades, dense thickets, and nine damaged cars.

## Combat update

Normal infected bite for 23 health; brutes bite for 38. Each attack has a 0.55-second lunge with the bite applied halfway through, allowing an evade. A red blood vignette flashes on a successful bite and stays faintly visible below 30 player health. Rifle rounds travel at 55 world units per second and use swept segment collision to avoid skipping enemies between frames. Cars block rounds. Muzzle flash, brass ejection, recoil, hit droplets and enemy flinches show each shot's result.

The Blender source now generates continuous fitted garment geometry, remeshed faces, fuller hair coverage and 90 corrugated fungal plates on the brute. These are procedural models rather than scanned or production-sculpted characters.

Bullets target the visible zombie body under the cursor, show hit markers and impact wounds, and cause a falling death animation. Normal infected require two 22-damage rifle hits; brutes require seven. Cars use tighter bounding boxes for bullet obstruction. Run `node tests/combat.test.js` to check swept collision behavior.
