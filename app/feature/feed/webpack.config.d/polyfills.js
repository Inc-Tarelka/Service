/*
 * Webpack configuration to disable Node.js polyfills
 * Required for Coil with Ktor on browser platform
 */
config.resolve = config.resolve || {};
config.resolve.fallback = config.resolve.fallback || {};
config.resolve.fallback.os = false;
config.resolve.fallback.path = false;

