# @jadex/snowpack-plugin-exclude

![MIT License](https://img.shields.io/github/license/jadex/snowpack-plugin-exclude)
[![NPM version](https://img.shields.io/npm/v/@jadex/snowpack-plugin-exclude)](https://www.npmjs.com/package/@jadex/snowpack-plugin-exclude)
[![NPM downloads](https://img.shields.io/npm/dt/@jadex/snowpack-plugin-exclude)](https://www.npmjs.com/package/@jadex/snowpack-plugin-exclude)
[![Node.js Package](https://github.com/jadex/snowpack-plugin-exclude/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/JadeX/snowpack-plugin-exclude/actions/workflows/npm-publish.yml)

This is a simple [Snowpack](https://www.snowpack.dev/tutorials/quick-start) plugin that complements `SnowpackUserConfig.exclude` ([docs](https://www.snowpack.dev/reference/configuration#exclude)), but instead of excluding files from the pipeline completely, it just prevents them from being included in the build folder.

This is useful when using [PostCSS import](https://github.com/postcss/postcss-import) or [TailwindCSS JIT](https://tailwindcss.com/docs/just-in-time-mode) where we watch for classes in source files.

## Installation

```bash
npm install @jadex/snowpack-plugin-exclude --save-dev
```
```js
/* snowpack.config.js */

module.exports = {
  plugins: [    
    [
      "@snowpack/plugin-postcss", /* Optional */
      "@jadex/snowpack-plugin-exclude",
      {
        paths: ["**/*.pcss"], // Set any desired extension
      },
    ],
  ]
};
```

## Example Usage - Snowpack & Blazor & TailwindCSS JIT
Goal here is that whenever we edit source `.pcss` or `.razor` files our final `.css` will be rebuilt without our source files appearing anywhere in the build.

For that we need to mount all folders with files we want Snowpack to work with and then exclude/"soft-exclude" as necessary:
```js
/* snowpack.config.js */

module.exports = {
  mount: {
    assets: "/", // Folder that holds our "wwwroot" contents like index.html, css/app.css etc
    pages: "/pages", // .cs, .razor, .pcss files
    shared: "/shared", // .cs, .razor, .pcss files
    "../../node_modules/@fontsource/poppins/files": { // Custom fonts
      url: "/css/files",
      static: true,
    },
  },
  exclude: ["**/*.cs"], // If .cs files don't contain any Tailwind classes for JIT to pick up, exclude them completely like this
  plugins: [
    "@snowpack/plugin-postcss",
    [
      "@jadex/snowpack-plugin-exclude",
      {
        // We don't want any of our source .razor or .pcss files in the final build folder
        paths: ["**/*.razor", "**/*.pcss"],
      },
    ],   
  ],
  buildOptions: {
    // wwwroot is standard folder for Blazor static assets
    out: "wwwroot",
  },
  optimize: {
    // Optionally make things tidy when publishing
    minify: true,
    bundle: false,
    treeshake: true,
    splitting: true,
    target: "es2020",
  },
};
```

```js
/* tailwind.config.js */

module.exports = {
  // Watch source files for Tailwind classes, snowpack will take care of rest, property may differ depending on version of TailwindCSS, see their docs
  content: ["./**/*.razor", "./**/*.pcss"],
  /* (...) */
}
```

```css
/* assets/app.css */

@import "tailwindcss/base.css";
@import "tailwindcss/components.css";
/* Here we can grab all our source pcss files with postcss-import-ext-glob plugin or import them one by one */
@import-glob "../../{Pages,Shared}/**/*.pcss";
@import "tailwindcss/utilities.css";
```

This will ensure whenever `.pcss`. or `.razor` files are saved, their corresponding `.css` files will be properly rebuilt.