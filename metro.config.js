// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Redirect expo-file-system → expo-file-system/legacy ONLY for
// @missingcore/audio-metadata, which still uses the deprecated function API.
// getInfoAsync throws on expo-file-system in SDK 54+.
const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === "expo-file-system" &&
    context.originModulePath?.includes("@missingcore/audio-metadata")
  ) {
    return context.resolveRequest(context, "expo-file-system/legacy", platform);
  }

  return originalResolveRequest
    ? originalResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, {
  input: "./src/global.css",
});
