"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SPECIAL_FOLDERS = exports.SPECIAL_FILENAMES = exports.ICON_EXTENSIONS = exports.PALETTE_LABELS = exports.DEFAULT_LIGHT_PALETTE = exports.DEFAULT_DARK_PALETTE = void 0;
exports.DEFAULT_DARK_PALETTE = {
    background: '#0F1117',
    surface: '#161B22',
    elevated: '#1C2333',
    accent: '#7C6AF7',
    accent2: '#3ECFCF',
    foreground: '#E2E8F0',
    muted: '#94A3B8',
    subtle: '#475569',
    green: '#4ADE80',
    red: '#F87171',
    yellow: '#FBBF24',
    blue: '#60A5FA',
    pink: '#F472B6',
    border: '#2D3748',
};
exports.DEFAULT_LIGHT_PALETTE = {
    background: '#FFFFFF',
    surface: '#F8FAFC',
    elevated: '#F1F5F9',
    accent: '#6D5CEC',
    accent2: '#0EA5E9',
    foreground: '#1E293B',
    muted: '#64748B',
    subtle: '#CBD5E1',
    green: '#16A34A',
    red: '#DC2626',
    yellow: '#D97706',
    blue: '#2563EB',
    pink: '#DB2777',
    border: '#E2E8F0',
};
exports.PALETTE_LABELS = {
    background: 'Background',
    surface: 'Surface',
    elevated: 'Elevated',
    accent: 'Accent (Violet)',
    accent2: 'Accent 2 (Teal)',
    foreground: 'Foreground',
    muted: 'Muted Text',
    subtle: 'Subtle Text',
    green: 'Green',
    red: 'Red',
    yellow: 'Yellow',
    blue: 'Blue',
    pink: 'Pink',
    border: 'Border',
};
exports.ICON_EXTENSIONS = [
    'js', 'mjs', 'cjs', 'ts', 'jsx', 'tsx', 'py', 'pyw', 'rs', 'go', 'java', 'kt', 'kts',
    'swift', 'c', 'h', 'cpp', 'cc', 'cxx', 'hpp', 'cs', 'php', 'rb', 'dart', 'lua', 'r',
    'jl', 'scala', 'hs', 'ex', 'exs', 'clj', 'cljs', 'erl', 'fs', 'fsi', 'pl', 'zig',
    'nim', 'cr', 'd', 'ml', 'mli', 'html', 'htm', 'css', 'scss', 'less', 'sass', 'styl',
    'wasm', 'svelte', 'vue', 'astro', 'json', 'json5', 'jsonc', 'yaml', 'yml', 'toml',
    'xml', 'csv', 'tsv', 'env', 'ini', 'conf', 'cfg', 'sh', 'bash', 'zsh', 'fish', 'ps1',
    'bat', 'cmd', 'sql', 'db', 'sqlite', 'graphql', 'gql', 'prisma', 'md', 'mdx', 'rst',
    'txt', 'tex', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'pdf', 'mp4', 'mp3',
    'zip', 'tar', 'gz', 'rar', '7z', 'pem', 'crt', 'key',
];
exports.SPECIAL_FILENAMES = [
    'package.json', 'Dockerfile', 'docker-compose.yml', 'docker-compose.yaml',
    'Makefile', 'makefile', 'Vagrantfile', 'Procfile', 'Gemfile', 'Rakefile',
    'Gruntfile.js', 'gulpfile.js', 'webpack.config.js', 'vite.config.js',
    'vite.config.ts', 'rollup.config.js', 'CMakeLists.txt', 'Cargo.toml',
    'pyproject.toml', '.gitignore', '.env', '.env.local', '.eslintrc',
    '.eslintrc.json', '.prettierrc', 'tsconfig.json', 'jest.config.js',
    'babel.config.js', 'next.config.js', 'nuxt.config.ts',
];
exports.SPECIAL_FOLDERS = [
    'src', 'dist', 'build', 'out', 'node_modules', '.git', '.vscode', '.github',
    'public', 'assets', 'components', 'pages', 'hooks', 'utils', 'lib', 'bin',
    'scripts', 'tests', 'test', 'docs', 'coverage', 'api', 'config', 'styles',
    'types', 'store', 'services', 'middleware', 'controllers', 'models', 'views',
];
