const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts = Array.from(
  new Set([...config.resolver.sourceExts, 'cjs', 'mjs', 'ts', 'tsx'])
);

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  'react-native-safe-area-context': path.resolve(
    __dirname,
    'node_modules/react-native-safe-area-context/lib/module'
  ),
};

module.exports = config;
