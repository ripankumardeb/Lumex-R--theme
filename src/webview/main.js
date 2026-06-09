// ═══════════════════════════════════════
//   Lumex Customizer — Webview Main JS
// ═══════════════════════════════════════
'use strict';

const vscode = acquireVsCodeApi();

// ─── State ───────────────────────────────
let state = {
  palette: {},
  customIcons: {},
  presets: [],
  extensions: [],
  filenames: [],
  folders: [],
};

const PALETTE_LABELS = {
  background:'Background', surface:'Surface', elevated:'Elevated',
  accent:'Accent (Violet)', accent2:'Accent 2 (Teal)', foreground:'Foreground',
  muted:'Muted Text', subtle:'Subtle Text', green:'Green', red:'Red',
  yellow:'Yellow', blue:'Blue', pink:'Pink', border:'Border',
};

// ─── Init ─────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setupNav();
  setupReset();
  setupIconSearch();
  vscode.postMessage({ type: 'ready' });
});

// ─── Message handler ──────────────────────
window.addEventListener('message', (event) => {
  const msg = event.data;
  switch (msg.type) {
    case 'stateUpdate':
      state = { ...state, ...msg };
      renderAll();
      break;
    case 'colorApplied':
      onColorApplied(msg.slot, msg.hex);
      showToast(`✓ ${PALETTE_LABELS[msg.slot] || msg.slot} → ${msg.hex}`, 'success');
      break;
    case 'colorError':
      onColorError(msg.slot, msg.message);
      showToast(`✗ ${msg.message}`, 'error');
      break;
    case 'presetApplied':
      state.palette = msg.palette;
      renderColorGrid();
      updatePreviewBg(msg.palette.background);
      markActivePreset(msg.presetName);
      showToast(`✓ Preset "${msg.presetName}" applied`, 'success');
      break;
    case 'iconUploaded':
      state.customIcons[msg.extension] = msg.data;
      refreshIconTile(msg.extension, msg.data);
      showToast(`✓ Icon for .${msg.extension} updated`, 'success');
      break;
    case 'iconRemoved':
      delete state.customIcons[msg.extension];
      refreshIconTile(msg.extension, null);
      showToast(`✓ Icon for .${msg.extension} reset to default`, 'info');
      break;
  }
});

// ─── Render All ──────────────────────────
function renderAll() {
  renderColorGrid();
  renderIconGrids();
  renderPresets();
  updatePreviewBg(state.palette.background);
  if (window.Prism) Prism.highlightAll();
}

// ─── Color Grid ──────────────────────────
function renderColorGrid() {
  const grid = document.getElementById('colorGrid');
  if (!grid) return;
  grid.innerHTML = '';

  Object.entries(PALETTE_LABELS).forEach(([slot, label]) => {
    const hex = state.palette[slot] || '#888888';
    const row = document.createElement('div');
    row.className = 'color-row';
    row.dataset.slot = slot;

    row.innerHTML = `
      <div class="swatch" id="swatch-${slot}" style="background:${hex}">
        <input type="color" value="${hex}" data-slot="${slot}" title="Pick color"/>
      </div>
      <div class="color-info">
        <span class="color-label">${label}</span>
        <input class="color-input" type="text" value="${hex}" data-slot="${slot}"
               placeholder="#RRGGBB or color name" spellcheck="false"/>
        <div class="color-error-tip" id="err-${slot}"></div>
      </div>`;

    grid.appendChild(row);

    // Color picker sync
    const picker = row.querySelector('input[type="color"]');
    const textIn = row.querySelector('.color-input');

    picker.addEventListener('input', (e) => {
      const val = e.target.value;
      textIn.value = val;
      textIn.classList.remove('error');
      updateSwatchColor(slot, val);
      sendApplyColor(slot, val);
    });

    textIn.addEventListener('blur', (e) => {
      const val = e.target.value.trim();
      if (val) sendApplyColor(slot, val);
    });

    textIn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.target.blur(); }
    });
  });
}

function updateSwatchColor(slot, hex) {
  const sw = document.getElementById(`swatch-${slot}`);
  if (sw) sw.style.background = hex;
  const picker = sw?.querySelector('input[type="color"]');
  if (picker) picker.value = hex.slice(0,7);
}

function onColorApplied(slot, hex) {
  const row = document.querySelector(`.color-row[data-slot="${slot}"]`);
  if (!row) return;
  const textIn = row.querySelector('.color-input');
  const errTip = row.querySelector('.color-error-tip');
  textIn.value = hex;
  textIn.classList.remove('error');
  errTip.textContent = '';
  errTip.classList.remove('visible');
  updateSwatchColor(slot, hex);
  state.palette[slot] = hex;
  if (slot === 'background') updatePreviewBg(hex);
}

function onColorError(slot, msg) {
  const row = document.querySelector(`.color-row[data-slot="${slot}"]`);
  if (!row) return;
  const textIn = row.querySelector('.color-input');
  const errTip = row.querySelector('.color-error-tip');
  textIn.classList.add('error');
  errTip.textContent = msg;
  errTip.classList.add('visible');
}

function updatePreviewBg(hex) {
  const preview = document.querySelector('.preview-code');
  if (preview) preview.style.setProperty('--preview-bg', hex);
}

function sendApplyColor(slot, value) {
  vscode.postMessage({ type: 'applyColor', slot, value });
}

// ─── Icon Grids ──────────────────────────
function renderIconGrids() {
  buildGrid('extGrid',      state.extensions,  'ext');
  buildGrid('filenameGrid', state.filenames,   'file');
  buildGrid('folderGrid',   state.folders,     'folder');
}

function buildGrid(gridId, items, kind) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  grid.innerHTML = '';
  items.forEach(item => {
    grid.appendChild(buildIconTile(item, kind));
  });
}

function buildIconTile(item, kind) {
  const tile = document.createElement('div');
  tile.className = 'icon-tile';
  tile.dataset.ext = item;
  tile.dataset.kind = kind;

  const hasCustom = !!state.customIcons[item];
  if (hasCustom) tile.classList.add('has-custom');

  const iconSrc = hasCustom
    ? `data:image/png;base64,${state.customIcons[item]}`
    : buildDefaultIconSvgUrl(item, kind);

  tile.innerHTML = `
    ${hasCustom ? '<div class="tile-custom-badge"></div>' : ''}
    <img class="tile-img" src="${iconSrc}" alt="${item}" loading="lazy"/>
    <span class="tile-label">${kind === 'ext' ? '.' + item : item}</span>
    <div class="tile-actions">
      <label class="tile-btn upload" title="Upload PNG or JPG">
        ↑ Upload
        <input class="tile-upload-input" type="file" accept="image/png,image/jpeg"/>
      </label>
      ${hasCustom ? `<button class="tile-btn remove" data-ext="${item}">✕ Reset</button>` : ''}
    </div>`;

  // Upload handler
  const fileInput = tile.querySelector('.tile-upload-input');
  fileInput.addEventListener('change', (e) => handleIconUpload(e, item));

  // Remove handler
  const removeBtn = tile.querySelector('.tile-btn.remove');
  if (removeBtn) {
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      vscode.postMessage({ type: 'removeIcon', extension: item });
    });
  }

  return tile;
}

function buildDefaultIconSvgUrl(item, kind) {
  // Return a data URI for a simple colored SVG placeholder
  const colors = {
    js:'#F7DF1E', ts:'#3178C6', py:'#3776AB', rs:'#CE422B', go:'#00ADD8',
    java:'#ED8B00', html:'#E34C26', css:'#264DE4', json:'#F7C948',
    md:'#083FA1', vue:'#41B883', svelte:'#FF3E00', jsx:'#61DAFB', tsx:'#2563EB',
  };
  const folderColors = {
    src:'#4ADE80', dist:'#F87171', node_modules:'#68A063', '.git':'#F05032',
    components:'#38BDF8', pages:'#34D399', hooks:'#FB7185', utils:'#FBBF24',
  };

  const isFolder = kind === 'folder';
  const bg = isFolder ? (folderColors[item] || '#3B82F6') : (colors[item] || '#475569');
  const label = item.length > 3 ? item.slice(0,3).toUpperCase() : item.toUpperCase();
  const tc = isLight(bg) ? '#111' : '#fff';

  let svg;
  if (isFolder) {
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M2 10 Q2 8 4 8 L14 8 L16 10 L28 10 Q30 10 30 12 L30 25 Q30 27 28 27 L4 27 Q2 27 2 25 Z" fill="${bg}"/><text x="16" y="21" dominant-baseline="central" text-anchor="middle" font-family="monospace" font-size="8" font-weight="700" fill="${tc}">${label}</text></svg>`;
  } else {
    const fs = label.length > 2 ? 9.5 : 12;
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect x="1" y="1" width="30" height="30" rx="5" fill="${bg}"/><text x="16" y="16" dominant-baseline="central" text-anchor="middle" font-family="monospace" font-size="${fs}" font-weight="700" fill="${tc}">${label}</text></svg>`;
  }

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function isLight(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return (r*0.299 + g*0.587 + b*0.114) > 170;
}

function refreshIconTile(ext, base64Data) {
  const tile = document.querySelector(`.icon-tile[data-ext="${ext}"]`);
  if (!tile) return;
  const kind = tile.dataset.kind;
  const parent = tile.parentNode;
  const newTile = buildIconTile(ext, kind);
  parent.replaceChild(newTile, tile);
}

function handleIconUpload(event, extension) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 512 * 1024) {
    showToast('✗ Image too large — max 512 KB', 'error');
    return;
  }

  if (!['image/png','image/jpeg'].includes(file.type)) {
    showToast('✗ Only PNG and JPG/JPEG images are supported', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const base64 = e.target.result.split(',')[1];
    vscode.postMessage({ type: 'uploadIcon', extension, data: base64, fileName: file.name });
  };
  reader.readAsDataURL(file);
}

// ─── Icon search ────────────────────────
function setupIconSearch() {
  const input = document.getElementById('iconSearch');
  if (!input) return;
  input.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    document.querySelectorAll('.icon-tile').forEach(tile => {
      const ext = tile.dataset.ext || '';
      tile.style.display = !q || ext.toLowerCase().includes(q) ? '' : 'none';
    });
  });
}

// ─── Presets ────────────────────────────
function renderPresets() {
  const grid = document.getElementById('presetsGrid');
  if (!grid) return;
  grid.innerHTML = '';

  state.presets.forEach(preset => {
    const card = document.createElement('div');
    card.className = 'preset-card';
    card.dataset.name = preset.name;

    const swatchHtml = preset.swatches.map(c =>
      `<div class="preset-swatch" style="background:${c}"></div>`
    ).join('');

    card.innerHTML = `
      <div class="preset-swatches">${swatchHtml}</div>
      <div class="preset-name">${preset.name}</div>
      <div class="preset-desc">${preset.description}</div>
      <button class="preset-apply-btn">Apply Preset</button>`;

    card.querySelector('.preset-apply-btn').addEventListener('click', () => {
      vscode.postMessage({ type: 'applyPreset', presetName: preset.name });
    });

    grid.appendChild(card);
  });
}

function markActivePreset(name) {
  document.querySelectorAll('.preset-card').forEach(c => {
    c.classList.toggle('active-preset', c.dataset.name === name);
  });
}

// ─── Navigation ─────────────────────────
function setupNav() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const tab = item.dataset.tab;

      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
      const target = document.getElementById(`tab-${tab}`);
      if (target) target.classList.add('active');

      if (tab === 'icons' && document.querySelectorAll('.icon-tile').length === 0) {
        renderIconGrids();
      }
    });
  });
}

// ─── Reset button ────────────────────────
function setupReset() {
  const btn = document.getElementById('resetBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    vscode.postMessage({ type: 'resetDefaults' });
  });
}

// ─── Toast ──────────────────────────────
let toastTimer = null;
function showToast(msg, type = 'info') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = `toast show ${type}`;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.classList.remove('show'); }, 2500);
}
