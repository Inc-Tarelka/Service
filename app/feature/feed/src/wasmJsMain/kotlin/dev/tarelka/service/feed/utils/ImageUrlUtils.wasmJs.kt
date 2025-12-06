package dev.tarelka.service.feed.utils

/**
 * WasmJS implementation - uses CORS proxy to bypass browser restrictions
 */
actual fun getImageUrl(originalUrl: String): String {
    // Use corsproxy.io to bypass CORS restrictions in browser
    return "https://corsproxy.io/?$originalUrl"
}

