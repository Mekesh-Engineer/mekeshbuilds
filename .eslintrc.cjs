/** @type {import('eslint').Linter.Config} */
module.exports = {
    root: true,
    env: { browser: true, es2022: true },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react-hooks/recommended',
        'plugin:import/recommended',
        'plugin:import/typescript',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint', 'import', 'react-hooks'],
    settings: {
        'import/resolver': {
            typescript: {
                alwaysTryTypes: true,
                project: './tsconfig.json',
            },
        },
    },
    rules: {
        // ── Layer separation enforcement ──────────────────────────────
        'import/no-restricted-paths': [
            'error',
            {
                zones: [
                    // Services must not import from React-aware layers
                    { target: './src/services', from: './src/hooks', message: 'Services must not import from hooks.' },
                    { target: './src/services', from: './src/store', message: 'Services must not import from store.' },
                    { target: './src/services', from: './src/components', message: 'Services must not import from components.' },
                    { target: './src/services', from: './src/pages', message: 'Services must not import from pages.' },

                    // Forms must not import from runtime layers
                    { target: './src/forms', from: './src/hooks', message: 'Form schemas must not import from hooks.' },
                    { target: './src/forms', from: './src/store', message: 'Form schemas must not import from store.' },
                    { target: './src/forms', from: './src/services', message: 'Form schemas must not import from services.' },

                    // Utils must not import from any React-aware layer
                    { target: './src/utils', from: './src/hooks', message: 'Utils must not import from hooks.' },
                    { target: './src/utils', from: './src/store', message: 'Utils must not import from store.' },
                    { target: './src/utils', from: './src/services', message: 'Utils must not import from services.' },
                    { target: './src/utils', from: './src/components', message: 'Utils must not import from components.' },
                    { target: './src/utils', from: './src/pages', message: 'Utils must not import from pages.' },

                    // Pages must not directly call supabase client
                    { target: './src/pages', from: './src/lib', message: 'Pages must not directly import supabaseClient — use a service hook.' },
                ],
            },
        ],

        // ── Prevent relative path chains ─────────────────────────────
        'no-restricted-imports': [
            'error',
            {
                patterns: ['../../*', '../../../*'],
            },
        ],

        // ── Enforce @/ alias for all cross-directory imports ─────────
        'import/no-relative-parent-imports': 'error',
    },
};
