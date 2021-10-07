const path = require("path");
const micromatch = require("micromatch");

module.exports = (_snowpackConfig, pluginOptions) => {
  return {
    name: "@jadex/snowpack-plugin-exclude",
    resolve: {
      input: [...parseExtensions(pluginOptions.paths)],
      output: [...parseExtensions(pluginOptions.paths)],
    },
    async load({ filePath }) {
      let relativePath = path.relative(process.cwd(), filePath);
      if (!micromatch.isMatch(relativePath, pluginOptions.paths)) {
        return;
      }
      return "";
    },
  };
};

function parseExtensions(paths) {
  let extensions = [];
  paths.forEach((filePath) => {
    extensions.push(path.extname(filePath));
  });

  return new Set(extensions);
}
