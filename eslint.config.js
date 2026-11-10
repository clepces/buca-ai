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
            "no-unused-vars": "off",
            "no-console": "off",
            "no-undef": "off"
        }
    }
];
