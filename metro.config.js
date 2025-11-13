const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const config = mergeConfig(defaultConfig, {
  transformer: {
    // Adiciona o transformer do react-native-svg
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    // Remove 'svg' da lista de assets para que seja tratado como componente
    assetExts: defaultConfig.resolver.assetExts.filter(ext => ext !== 'svg'),
    // Adiciona 'svg' à lista de extensões de código-fonte
    sourceExts: [...defaultConfig.resolver.sourceExts, 'svg'],
  },
});

module.exports = config;
