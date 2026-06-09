# How to Install LumexTheme

## Option A — Install the pre-built .vsix (Fastest)

1. Open VS Code
2. Press `Ctrl+Shift+P` → type "Install from VSIX"
3. Select `lumex-theme-1.0.0.vsix` from this folder
4. Click **Install** and reload VS Code
5. Done! ✦ Lumex Dark theme and Lumex Icons activate automatically.
6. Click **⚙ Lumex** in the status bar to open the Customizer.

## Option B — Build from source

```bash
# Prerequisites: Node.js ≥ 18
cd lumex-theme-source/

npm install           # Install dev dependencies
npm run compile       # Compile TypeScript → out/
npm run package       # Create lumex-theme-1.0.0.vsix
```

Then follow Option A to install the generated .vsix.

## Activating theme & icons manually

If they didn't auto-activate, run these in VS Code:
- `Ctrl+Shift+P` → "Preferences: Color Theme" → select **Lumex Dark** or **Lumex Light**
- `Ctrl+Shift+P` → "Preferences: File Icon Theme" → select **Lumex Icons**

## Open the Customizer

- Click **⚙ Lumex** in the status bar (bottom right)
- Or `Ctrl+Shift+P` → **Lumex: Open Theme & Icon Customizer**
