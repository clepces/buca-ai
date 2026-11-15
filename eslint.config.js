import js from "@eslint/js";
import globals from "globals";

export default [
    {
        ignores: ['dist/**/*', 'node_modules/**/*']
    },
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            parserOptions: {
                ecmaFeatures: {
                    jsx: false
                }
            },
            globals: {
                ...globals.browser,
                Header: "readonly",
                Dock: "readonly",
                Footer: "readonly"
            }
        },
        rules: {
            "indent": "off",
            "quotes": "off",
            "semi": "off",
            "no-unused-vars": ["warn", { 
                "argsIgnorePattern": "^_",
                "varsIgnorePattern": "^_",
                "caughtErrorsIgnorePattern": "^_"
            }],
            "no-console": "off",
            "no-undef": "error"
        }
    }
];
