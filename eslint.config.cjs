// eslint.config.cjs
const { FlatCompat } = require('@eslint/eslintrc');
const js                        = require('@eslint/js');
const tsParser                  = require('@typescript-eslint/parser');
const tsPlugin                  = require('@typescript-eslint/eslint-plugin');
const reactPlugin               = require('eslint-plugin-react');
const reactHooksPlugin          = require('eslint-plugin-react-hooks');
const importPlugin              = require('eslint-plugin-import');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  resolvePluginsRelativeTo: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  // bring in legacy shareables
  ...compat.extends(
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended'
  ),

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./tsconfig.json'],
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        React: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react:                    reactPlugin,
      'react-hooks':            reactHooksPlugin,
      import:                   importPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
          alwaysTryTypes: true
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx']
        }
      }
    },    
    rules: {
      // allow TSX syntax without Node plugin errors
      'node/no-unsupported-features/es-syntax': 'off',

      // React/JSX rules
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',

      // TS rules
      '@typescript-eslint/no-explicit-any': 'off',

      // import resolution
      'import/no-unresolved': ['error', { ignore: ['^@/'] }],

      // Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    }
  }
];
