const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable new architecture to avoid TurboModule issues
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;