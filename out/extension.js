"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const colorParser_1 = require("./colorParser");
const presets_1 = require("./presets");
const defaults_1 = require("./defaults");
let customizerPanel;
function activate(context) {
    // Auto-activate theme & icon theme on first install
    const alreadyActivated = context.globalState.get('lumex.activated');
    if (!alreadyActivated) {
        const cfg = vscode.workspace.getConfiguration();
        cfg.update('workbench.colorTheme', 'Lumex Dark', vscode.ConfigurationTarget.Global);
        cfg.update('workbench.iconTheme', 'lumex-icons', vscode.ConfigurationTarget.Global);
        context.globalState.update('lumex.activated', true);
    }
    // Status bar button
    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBar.text = '$(paintcan) Lumex';
    statusBar.command = 'lumex.openCustomizer';
    statusBar.tooltip = 'Open Lumex Theme & Icon Customizer';
    statusBar.show();
    context.subscriptions.push(statusBar);
    // Commands
    context.subscriptions.push(vscode.commands.registerCommand('lumex.openCustomizer', () => openCustomizerPanel(context)), vscode.commands.registerCommand('lumex.resetDefaults', () => resetToDefaults(context)));
}
function deactivate() { }
// ─────────────────────────────────────────────
// Webview Panel
// ─────────────────────────────────────────────
function openCustomizerPanel(context) {
    if (customizerPanel) {
        customizerPanel.reveal(vscode.ViewColumn.One);
        return;
    }
    customizerPanel = vscode.window.createWebviewPanel('lumexCustomizer', '🎨 Lumex Customizer', vscode.ViewColumn.One, {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
            vscode.Uri.joinPath(context.extensionUri, 'src', 'webview'),
            vscode.Uri.joinPath(context.extensionUri, 'src', 'icons'),
        ],
    });
    customizerPanel.webview.html = getWebviewHtml(context, customizerPanel.webview);
    // Send initial state once ready
    customizerPanel.webview.onDidReceiveMessage(async (msg) => {
        switch (msg.type) {
            case 'ready':
                sendState(context, customizerPanel.webview);
                break;
            case 'applyColor':
                await applyColor(context, msg.slot, msg.value);
                break;
            case 'applyPreset':
                await applyPreset(context, msg.presetName);
                break;
            case 'uploadIcon':
                await uploadIcon(context, msg.extension, msg.data, msg.fileName);
                break;
            case 'removeIcon':
                await removeIcon(context, msg.extension);
                break;
            case 'resetDefaults':
                await resetToDefaults(context);
                break;
        }
    }, undefined, context.subscriptions);
    customizerPanel.onDidDispose(() => { customizerPanel = undefined; }, undefined, context.subscriptions);
}
// ─────────────────────────────────────────────
// State
// ─────────────────────────────────────────────
function getCurrentPalette(context) {
    return context.globalState.get('lumex.palette') ?? defaults_1.DEFAULT_DARK_PALETTE;
}
function getCustomIcons(context) {
    return context.globalState.get('lumex.customIcons') ?? {};
}
function sendState(context, webview) {
    webview.postMessage({
        type: 'stateUpdate',
        palette: getCurrentPalette(context),
        customIcons: getCustomIcons(context),
        presets: presets_1.PRESETS,
        extensions: defaults_1.ICON_EXTENSIONS,
        filenames: defaults_1.SPECIAL_FILENAMES,
        folders: defaults_1.SPECIAL_FOLDERS,
    });
}
// ─────────────────────────────────────────────
// Color Application
// ─────────────────────────────────────────────
async function applyColor(context, slot, rawValue) {
    const hex = (0, colorParser_1.parseColor)(rawValue);
    if (!hex) {
        customizerPanel?.webview.postMessage({ type: 'colorError', slot, message: `"${rawValue}" is not a valid color` });
        return;
    }
    const palette = getCurrentPalette(context);
    palette[slot] = hex;
    await context.globalState.update('lumex.palette', palette);
    const overrides = buildColorOverrides(palette);
    await vscode.workspace.getConfiguration().update('workbench.colorCustomizations', overrides, vscode.ConfigurationTarget.Global);
    customizerPanel?.webview.postMessage({ type: 'colorApplied', slot, hex });
}
function buildColorOverrides(p) {
    return {
        'editor.background': p.background,
        'editor.foreground': p.foreground,
        'editorCursor.foreground': p.accent,
        'editor.lineHighlightBackground': p.surface,
        'editor.selectionBackground': p.accent + '44',
        'editor.selectionHighlightBackground': p.accent + '22',
        'editor.findMatchBackground': p.yellow + '44',
        'editor.findMatchHighlightBackground': p.yellow + '22',
        'editor.inactiveSelectionBackground': p.surface,
        'editorLineNumber.foreground': p.subtle,
        'editorLineNumber.activeForeground': p.muted,
        'editorGutter.background': p.background,
        'editorIndentGuide.background': p.border,
        'editorIndentGuide.activeBackground': p.subtle,
        'editorWhitespace.foreground': p.subtle,
        'editorRuler.foreground': p.border,
        'editorBracketMatch.background': p.accent + '33',
        'editorBracketMatch.border': p.accent,
        'editorOverviewRuler.border': p.border,
        'editorOverviewRuler.errorForeground': p.red,
        'editorOverviewRuler.warningForeground': p.yellow,
        'editorOverviewRuler.infoForeground': p.blue,
        'editorError.foreground': p.red,
        'editorWarning.foreground': p.yellow,
        'editorInfo.foreground': p.blue,
        'editorHint.foreground': p.green,
        'editorCodeLens.foreground': p.subtle,
        'editorLightBulb.foreground': p.yellow,
        // Activity bar
        'activityBar.background': p.background,
        'activityBar.foreground': p.foreground,
        'activityBar.inactiveForeground': p.subtle,
        'activityBar.border': p.border,
        'activityBarBadge.background': p.accent,
        'activityBarBadge.foreground': p.foreground,
        // Sidebar
        'sideBar.background': p.surface,
        'sideBar.foreground': p.foreground,
        'sideBar.border': p.border,
        'sideBarTitle.foreground': p.muted,
        'sideBarSectionHeader.background': p.surface,
        'sideBarSectionHeader.foreground': p.muted,
        'sideBarSectionHeader.border': p.border,
        // Tabs
        'editorGroupHeader.tabsBackground': p.background,
        'tab.activeBackground': p.background,
        'tab.activeForeground': p.foreground,
        'tab.inactiveBackground': p.surface,
        'tab.inactiveForeground': p.muted,
        'tab.border': p.border,
        'tab.activeBorder': p.accent,
        'tab.unfocusedActiveBorder': p.subtle,
        'tab.hoverBackground': p.elevated,
        // Status bar
        'statusBar.background': p.background,
        'statusBar.foreground': p.muted,
        'statusBar.border': p.border,
        'statusBar.noFolderBackground': p.background,
        'statusBar.debuggingBackground': p.red,
        'statusBarItem.hoverBackground': p.elevated,
        'statusBarItem.activeBackground': p.accent + '44',
        // Title bar
        'titleBar.activeBackground': p.background,
        'titleBar.activeForeground': p.foreground,
        'titleBar.inactiveBackground': p.background,
        'titleBar.inactiveForeground': p.muted,
        'titleBar.border': p.border,
        // Panel (terminal etc)
        'panel.background': p.background,
        'panel.border': p.border,
        'panelTitle.activeBorder': p.accent,
        'panelTitle.activeForeground': p.foreground,
        'panelTitle.inactiveForeground': p.muted,
        // Terminal
        'terminal.background': p.background,
        'terminal.foreground': p.foreground,
        'terminal.ansiBlack': p.subtle,
        'terminal.ansiRed': p.red,
        'terminal.ansiGreen': p.green,
        'terminal.ansiYellow': p.yellow,
        'terminal.ansiBlue': p.blue,
        'terminal.ansiMagenta': p.pink,
        'terminal.ansiCyan': p.accent2,
        'terminal.ansiWhite': p.foreground,
        'terminal.ansiBrightBlack': p.muted,
        'terminal.ansiBrightRed': p.red,
        'terminal.ansiBrightGreen': p.green,
        'terminal.ansiBrightYellow': p.yellow,
        'terminal.ansiBrightBlue': p.blue,
        'terminal.ansiBrightMagenta': p.pink,
        'terminal.ansiBrightCyan': p.accent2,
        'terminal.ansiBrightWhite': '#FFFFFF',
        'terminal.selectionBackground': p.accent + '44',
        'terminalCursor.foreground': p.accent,
        // Input / Dropdown
        'input.background': p.elevated,
        'input.foreground': p.foreground,
        'input.border': p.border,
        'input.placeholderForeground': p.subtle,
        'inputOption.activeBorder': p.accent,
        'inputOption.activeBackground': p.accent + '33',
        'inputValidation.errorBackground': p.red + '22',
        'inputValidation.errorBorder': p.red,
        'dropdown.background': p.elevated,
        'dropdown.foreground': p.foreground,
        'dropdown.border': p.border,
        // Lists
        'list.activeSelectionBackground': p.accent + '33',
        'list.activeSelectionForeground': p.foreground,
        'list.inactiveSelectionBackground': p.elevated,
        'list.hoverBackground': p.elevated,
        'list.focusBackground': p.accent + '22',
        'list.highlightForeground': p.accent,
        'list.errorForeground': p.red,
        'list.warningForeground': p.yellow,
        // Buttons
        'button.background': p.accent,
        'button.foreground': '#FFFFFF',
        'button.hoverBackground': p.accent + 'CC',
        'button.secondaryBackground': p.elevated,
        'button.secondaryForeground': p.foreground,
        // Badges
        'badge.background': p.accent,
        'badge.foreground': '#FFFFFF',
        'activityNotificationBadge.background': p.accent,
        // Scrollbar
        'scrollbar.shadow': p.background,
        'scrollbarSlider.background': p.subtle + '66',
        'scrollbarSlider.hoverBackground': p.subtle + 'AA',
        'scrollbarSlider.activeBackground': p.accent + '88',
        // Git decorations
        'gitDecoration.addedResourceForeground': p.green,
        'gitDecoration.modifiedResourceForeground': p.yellow,
        'gitDecoration.deletedResourceForeground': p.red,
        'gitDecoration.untrackedResourceForeground': p.accent2,
        'gitDecoration.conflictingResourceForeground': p.pink,
        'gitDecoration.ignoredResourceForeground': p.subtle,
        'gitDecoration.stageModifiedResourceForeground': p.yellow,
        'gitDecoration.stageDeletedResourceForeground': p.red,
        // Peek view
        'peekView.border': p.accent,
        'peekViewEditor.background': p.surface,
        'peekViewResult.background': p.elevated,
        'peekViewTitle.background': p.elevated,
        'peekViewTitleLabel.foreground': p.foreground,
        'peekViewTitleDescription.foreground': p.muted,
        'peekViewResult.selectionBackground': p.accent + '44',
        'peekViewResult.selectionForeground': p.foreground,
        'peekViewEditor.matchHighlightBackground': p.yellow + '44',
        // Diff editor
        'diffEditor.insertedTextBackground': p.green + '22',
        'diffEditor.removedTextBackground': p.red + '22',
        'diffEditor.insertedLineBackground': p.green + '11',
        'diffEditor.removedLineBackground': p.red + '11',
        'diffEditorGutter.insertedLineBackground': p.green + '22',
        'diffEditorGutter.removedLineBackground': p.red + '22',
        // Notifications
        'notifications.background': p.elevated,
        'notifications.foreground': p.foreground,
        'notifications.border': p.border,
        'notificationLink.foreground': p.accent,
        // Breadcrumb
        'breadcrumb.foreground': p.muted,
        'breadcrumb.focusForeground': p.foreground,
        'breadcrumb.activeSelectionForeground': p.accent,
        'breadcrumbPicker.background': p.elevated,
        // Menu
        'menu.background': p.elevated,
        'menu.foreground': p.foreground,
        'menu.selectionBackground': p.accent + '33',
        'menu.selectionForeground': p.foreground,
        'menu.separatorBackground': p.border,
        'menu.border': p.border,
        'menubar.selectionBackground': p.elevated,
        'menubar.selectionForeground': p.foreground,
        // Settings
        'settings.headerForeground': p.foreground,
        'settings.modifiedItemIndicator': p.accent,
        'settings.dropdownBackground': p.elevated,
        'settings.checkboxBackground': p.elevated,
        'settings.textInputBackground': p.elevated,
        'settings.numberInputBackground': p.elevated,
        // Welcome page
        'welcomePage.background': p.background,
        'walkThrough.embeddedEditorBackground': p.surface,
    };
}
// ─────────────────────────────────────────────
// Preset Application
// ─────────────────────────────────────────────
async function applyPreset(context, presetName) {
    const preset = presets_1.PRESETS.find((p) => p.name === presetName);
    if (!preset)
        return;
    await context.globalState.update('lumex.palette', preset.palette);
    const overrides = buildColorOverrides(preset.palette);
    await vscode.workspace.getConfiguration().update('workbench.colorCustomizations', overrides, vscode.ConfigurationTarget.Global);
    customizerPanel?.webview.postMessage({ type: 'presetApplied', palette: preset.palette, presetName });
}
// ─────────────────────────────────────────────
// Icon Management
// ─────────────────────────────────────────────
async function uploadIcon(context, extension, base64Data, fileName) {
    const customIcons = getCustomIcons(context);
    customIcons[extension] = base64Data;
    await context.globalState.update('lumex.customIcons', customIcons);
    await rebuildIconTheme(context);
    customizerPanel?.webview.postMessage({ type: 'iconUploaded', extension, data: base64Data });
}
async function removeIcon(context, extension) {
    const customIcons = getCustomIcons(context);
    delete customIcons[extension];
    await context.globalState.update('lumex.customIcons', customIcons);
    await rebuildIconTheme(context);
    customizerPanel?.webview.postMessage({ type: 'iconRemoved', extension });
}
async function rebuildIconTheme(context) {
    const customIcons = getCustomIcons(context);
    const storagePath = context.globalStorageUri.fsPath;
    if (!fs.existsSync(storagePath)) {
        fs.mkdirSync(storagePath, { recursive: true });
    }
    // Build icon definitions
    const iconDefs = {};
    const fileExts = {};
    const fileNames = {};
    const folderNames = {};
    const folderNamesExpanded = {};
    const extSrcRoot = path.join(context.extensionUri.fsPath, 'src', 'iconTheme');
    // Load base icon theme
    const baseThemePath = path.join(extSrcRoot, 'lumex-icons-base.json');
    let baseTheme = null;
    if (fs.existsSync(baseThemePath)) {
        try {
            baseTheme = JSON.parse(fs.readFileSync(baseThemePath, 'utf8'));
        }
        catch { }
    }
    if (baseTheme) {
        Object.assign(iconDefs, baseTheme.iconDefinitions);
        Object.assign(fileExts, baseTheme.fileExtensions);
        Object.assign(fileNames, baseTheme.fileNames);
        Object.assign(folderNames, baseTheme.folderNames);
        Object.assign(folderNamesExpanded, baseTheme.folderNamesExpanded);
    }
    // Override with custom images
    for (const [ext, b64] of Object.entries(customIcons)) {
        const mediaType = b64.startsWith('/9j/') ? 'image/jpeg' : 'image/png';
        const dataUri = `data:${mediaType};base64,${b64}`;
        // Write to storage path
        const imgPath = path.join(storagePath, `custom_${ext}.png`);
        fs.writeFileSync(imgPath, Buffer.from(b64, 'base64'));
        const defKey = `_custom_${ext}`;
        iconDefs[defKey] = { iconPath: imgPath };
        if (defaults_1.SPECIAL_FOLDERS.includes(ext)) {
            folderNames[ext] = defKey;
            folderNamesExpanded[ext] = defKey;
        }
        else {
            fileExts[ext] = defKey;
        }
    }
    const customTheme = {
        iconDefinitions: iconDefs,
        fileExtensions: fileExts,
        fileNames: fileNames,
        folderNames: folderNames,
        folderNamesExpanded: folderNamesExpanded,
        file: '_file',
        folder: '_folder',
        folderExpanded: '_folder_open',
    };
    const customThemePath = path.join(storagePath, 'lumex-icons-custom.json');
    fs.writeFileSync(customThemePath, JSON.stringify(customTheme, null, 2));
    await vscode.workspace.getConfiguration().update('workbench.iconTheme', customThemePath, vscode.ConfigurationTarget.Global);
}
// ─────────────────────────────────────────────
// Reset
// ─────────────────────────────────────────────
async function resetToDefaults(context) {
    const answer = await vscode.window.showWarningMessage('This will restore all theme colors and file icons to the original Lumex defaults. Continue?', { modal: true }, 'Yes, Reset');
    if (answer !== 'Yes, Reset')
        return;
    await context.globalState.update('lumex.palette', defaults_1.DEFAULT_DARK_PALETTE);
    await context.globalState.update('lumex.customIcons', {});
    const cfg = vscode.workspace.getConfiguration();
    await cfg.update('workbench.colorCustomizations', {}, vscode.ConfigurationTarget.Global);
    await cfg.update('workbench.colorTheme', 'Lumex Dark', vscode.ConfigurationTarget.Global);
    await cfg.update('workbench.iconTheme', 'lumex-icons', vscode.ConfigurationTarget.Global);
    vscode.window.showInformationMessage('✅ Lumex defaults restored. Reloading VS Code…');
    setTimeout(() => {
        vscode.commands.executeCommand('workbench.action.reloadWindow');
    }, 1500);
}
// ─────────────────────────────────────────────
// Webview HTML
// ─────────────────────────────────────────────
function getWebviewHtml(context, webview) {
    const nonce = getNonce();
    const cssUri = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'src', 'webview', 'style.css'));
    const jsUri = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'src', 'webview', 'main.js'));
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' ${webview.cspSource} https://cdnjs.cloudflare.com; script-src 'nonce-${nonce}' https://cdnjs.cloudflare.com; img-src ${webview.cspSource} data: blob:; font-src https://cdnjs.cloudflare.com;"/>
<link rel="stylesheet" href="${cssUri}"/>
<script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
<script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-javascript.min.js"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css"/>
<title>Lumex Customizer</title>
</head>
<body>
<div id="app">
  <!-- Sidebar -->
  <nav id="sidebar">
    <div class="sidebar-header">
      <span class="logo">✦ Lumex</span>
    </div>
    <ul class="nav-list">
      <li class="nav-item active" data-tab="theme">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/><path d="M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
        Theme Colors
      </li>
      <li class="nav-item" data-tab="icons">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></svg>
        File Icons
      </li>
      <li class="nav-item" data-tab="presets">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
        Presets
      </li>
      <li class="nav-item" data-tab="about">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        About
      </li>
    </ul>
    <div class="sidebar-footer">
      <button id="resetBtn" class="reset-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
        Restore Defaults
      </button>
    </div>
  </nav>

  <!-- Main Content -->
  <main id="main-content">

    <!-- THEME TAB -->
    <div id="tab-theme" class="tab-content active">
      <div class="tab-header">
        <h1>Theme Colors</h1>
        <p class="tab-desc">Customise every color slot. Accepts hex, rgb(), hsl(), CSS names, or Tailwind like <code>indigo-500</code></p>
      </div>
      <div class="theme-layout">
        <div class="color-grid" id="colorGrid">
          <!-- Populated by JS -->
        </div>
        <div class="preview-panel">
          <div class="preview-header">Live Preview</div>
          <div class="preview-code" id="previewCode">
            <pre><code class="language-javascript">// Lumex Dark Preview
const greet = (name) => {
  const msg = \`Hello, \${name}!\`;
  return msg;
};

class ApiClient {
  #token = null;
  
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.retry = 3;
  }

  async fetch(endpoint) {
    try {
      const res = await fetch(
        this.baseUrl + endpoint
      );
      return await res.json();
    } catch (err) {
      console.error(err);
      return null;
    }
  }
}

export { ApiClient, greet };
</code></pre>
          </div>
        </div>
      </div>
    </div>

    <!-- ICONS TAB -->
    <div id="tab-icons" class="tab-content">
      <div class="tab-header">
        <h1>File Icons</h1>
        <p class="tab-desc">Upload a PNG or JPG to replace any file icon. Max 512 KB per image.</p>
      </div>
      <div class="search-bar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input type="text" id="iconSearch" placeholder="Search extensions, filenames, or folders…"/>
      </div>
      <div class="icon-sections">
        <div class="icon-section">
          <h3>File Extensions</h3>
          <div class="icon-grid" id="extGrid"></div>
        </div>
        <div class="icon-section">
          <h3>Special Filenames</h3>
          <div class="icon-grid" id="filenameGrid"></div>
        </div>
        <div class="icon-section">
          <h3>Folder Names</h3>
          <div class="icon-grid" id="folderGrid"></div>
        </div>
      </div>
    </div>

    <!-- PRESETS TAB -->
    <div id="tab-presets" class="tab-content">
      <div class="tab-header">
        <h1>Preset Themes</h1>
        <p class="tab-desc">One-click full palette replacements. Apply a preset, then fine-tune individual colors.</p>
      </div>
      <div class="presets-grid" id="presetsGrid">
        <!-- Populated by JS -->
      </div>
    </div>

    <!-- ABOUT TAB -->
    <div id="tab-about" class="tab-content">
      <div class="tab-header">
        <h1>About Lumex</h1>
      </div>
      <div class="about-card">
        <div class="about-logo">✦</div>
        <h2>Lumex Theme & Icon Customizer</h2>
        <p class="about-version">Version 1.0.0</p>
        <p>Lumex brings a beautiful dark/light theme and a comprehensive file icon set to VS Code, with a live customizer so every color and icon can be made your own.</p>
        <div class="about-features">
          <div class="feature-item"><span>🎨</span><div><strong>14 color slots</strong><br/>Background, accents, syntax, UI — all editable</div></div>
          <div class="feature-item"><span>📁</span><div><strong>80+ file icons</strong><br/>Every popular language, format, and folder</div></div>
          <div class="feature-item"><span>🖼️</span><div><strong>Custom PNG/JPG icons</strong><br/>Upload your own image for any file type</div></div>
          <div class="feature-item"><span>🎭</span><div><strong>6 preset themes</strong><br/>Switch full palettes in one click</div></div>
          <div class="feature-item"><span>↺</span><div><strong>One-click reset</strong><br/>Instantly restore all Lumex defaults</div></div>
        </div>
        <div class="about-colors">
          <span style="background:#7C6AF7"></span>
          <span style="background:#3ECFCF"></span>
          <span style="background:#4ADE80"></span>
          <span style="background:#F87171"></span>
          <span style="background:#FBBF24"></span>
          <span style="background:#F472B6"></span>
        </div>
      </div>
    </div>

  </main>
</div>

<!-- Toast -->
<div id="toast" class="toast"></div>

<script nonce="${nonce}" src="${jsUri}"></script>
</body>
</html>`;
}
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}
