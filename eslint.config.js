import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
    { ignores: ['bundle.js', 'node_modules/', 'preview/'] },

    {
        files: ['src/**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.es2021,
            },
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
        },
        plugins: {
            react,
            'react-hooks': reactHooks,
        },
        settings: {
            react: { version: '19' },
        },
        rules: {
            ...js.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,

            // JSX — mark vars used in JSX as used
            'react/jsx-uses-react': 'warn',
            'react/jsx-uses-vars': 'warn',

            // Unused vars — ignore React import (needed for esbuild JSX) and _prefixed args
            'no-unused-vars': ['warn', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^React$',
            }],

            // Off — not useful for this project
            'no-console': 'off',
            'react/prop-types': 'off',
            'react/react-in-jsx-context': 'off',
        },
    },
];
