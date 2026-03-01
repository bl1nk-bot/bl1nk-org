import tsParser from "@typescript-eslint/parser";

export default [
{
  files: [
    "**/next.config.ts",
    "**/postcss.config.ts",
    "**/tailwind.config.ts"
  ],
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      project: true,
      tsconfigRootDir: import.meta.dirname
    }
  }
},