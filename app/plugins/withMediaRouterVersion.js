// Plugin de configuration Expo (appliqué par prebuild, sur EAS et en local) : fixe androidx.mediarouter à une
// version stable. La bibliothèque Cast de Google l'amène par dépendance ; sa version 23 demandait
// mediarouter 1.9.0-beta01 (compileSdk 37, Android Gradle Plugin 9.1), incompatible avec Expo SDK 57
// (compileSdk 36, AGP 8.12). La version Cast est fixée à 22.3.1 dans app.json
// (androidPlayServicesCastFrameworkVersion) ; ce plugin remplace en plus sa dépendance 1.8.0-beta01 par la
// 1.8.1 stable (minCompileSdk 34, AGP 8.1.1 au moins). À revoir à chaque montée d'Expo ou de la bibliothèque Cast.
const { withAppBuildGradle } = require('expo/config-plugins');

const MEDIAROUTER_VERSION = '1.8.1';
const MARKER = '// Quiz\'in : androidx.mediarouter fixé (plugins/withMediaRouterVersion.js)';

module.exports = function withMediaRouterVersion(config) {
  return withAppBuildGradle(config, (gradleConfig) => {
    if (!gradleConfig.modResults.contents.includes(MARKER)) {
      gradleConfig.modResults.contents += [
        '',
        MARKER,
        'configurations.all {',
        `    resolutionStrategy.force 'androidx.mediarouter:mediarouter:${MEDIAROUTER_VERSION}'`,
        '}',
        '',
      ].join('\n');
    }
    return gradleConfig;
  });
};
