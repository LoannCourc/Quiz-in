// https://docs.expo.dev/guides/customizing-metro/
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Metro ne lit que le dossier du projet : on lui ajoute shared/ (alias @shared dans tsconfig.json).
config.watchFolders = [...(config.watchFolders ?? []), path.resolve(__dirname, '../shared')];

module.exports = config;
