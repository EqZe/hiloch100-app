
const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function withMaterial3Expressive(config) {
  return withAppBuildGradle(config, (config) => {
    const buildGradle = config.modResults.contents;

    const materialDep = `implementation("com.google.android.material:material:1.4.0-alpha02")`;

    if (!buildGradle.includes('com.google.android.material:material:1.4.0-alpha02')) {
      config.modResults.contents = buildGradle.replace(
        /dependencies\s*\{/,
        `dependencies {\n    ${materialDep}`
      );
    }

    return config;
  });
};
