module.exports = (api) => {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      // NOTE: This must be listed last
      "react-native-reanimated/plugin",
    ],
  };
};
