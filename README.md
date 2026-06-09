# ✦ Lumex — Theme & Icon Customizer

> A gorgeous dark/light theme with 160+ file icons, fully customisable via the built-in visual editor. Change any color with hex, CSS names, Tailwind tokens, or rgb/hsl. Replace any icon with your own PNG or JPG. Reset everything in one click.

---

## Features

| Feature | Detail |
|---------|--------|
| 🎨 **Lumex Dark & Light** | Full editor + UI theme covering every VS Code token |
| 📁 **160+ File Icons** | SVG icons for every popular language, format, and folder |
| 🖌️ **Color Customizer** | 14-slot palette; accepts hex, CSS names, Tailwind, rgb/hsl |
| 🖼️ **Custom Icons** | Upload PNG or JPG to replace any file type icon |
| 🎭 **6 Preset Themes** | Lumex Dark, Lumex Light, Midnight Ocean, Sakura, Nord Drift, Cyberpunk Neo |
| ↺ **One-Click Reset** | Restore all defaults and reload VS Code instantly |

---

## Quick Start

1. Install the extension (`Extensions → Install from VSIX → lumex-theme-1.0.0.vsix`)
2. The **Lumex Dark** theme and **Lumex Icons** activate automatically
3. Click **⚙ Lumex** in the status bar (bottom right) to open the Customizer
4. Or run `Ctrl+Shift+P → Lumex: Open Theme & Icon Customizer`

---

## Color Customizer

Open the **Theme Colors** tab. For each of the 14 palette slots you can enter:

```
#7C6AF7          ← hex (with or without #)
rgb(124,106,247) ← RGB
hsl(248,90%,69%) ← HSL
violet           ← CSS named color (all 148 supported)
indigo-500       ← Tailwind v3 token
```

Click the colored swatch to use the native color picker. Changes apply **instantly** to the editor.

---

## Icon Customizer

Open the **File Icons** tab. For any file extension, filename, or folder:

- **Upload Image** — Choose a PNG or JPG (max 512 KB). The image replaces the default SVG icon.  
- **Reset** — Removes the custom image and restores the original Lumex icon.

Custom icons persist across VS Code restarts.

---

## Preset Themes

| Preset | Description |
|--------|-------------|
| **Lumex Dark** | Default electric dark (violet + teal) |
| **Lumex Light** | Clean airy light variant |
| **Midnight Ocean** | Deep blues + aqua neon |
| **Sakura** | Soft pinks + warm cream |
| **Nord Drift** | Arctic cool grays + frost |
| **Cyberpunk Neo** | Neon on pitch black |

---

## Restore Defaults

Click **↺ Restore Defaults** (red button in sidebar) → Confirm → VS Code reloads with the original Lumex Dark theme and all default icons.

Or run: `Ctrl+Shift+P → Lumex: Reset All to Defaults`

---

### Requirements
- Node.js ≥ 18
- VS Code ≥ 1.85
- `@vscode/vsce` (installed as dev dependency)

---

## License

MIT © Lumex Theme Contributors
