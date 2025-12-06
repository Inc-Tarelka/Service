/*
 * Webpack configuration to disable Node.js polyfills
 * Required for Coil with Ktor on browser platform
 */
config.resolve = config.resolve || {};
config.resolve.fallback = config.resolve.fallback || {};
config.resolve.fallback.os = false;
config.resolve.fallback.path = false;

/*
 * Proxy configuration to bypass CORS for image loading
 */
config.devServer = config.devServer || {};
config.devServer.proxy = config.devServer.proxy || [];
config.devServer.proxy.push({
    context: ['/catapi-images'],
    target: 'https://cdn2.thecatapi.com',
    changeOrigin: true,
    pathRewrite: { '^/catapi-images': '/images' },
    secure: true
});

