package dev.tarelka.service.feed.utils

/**
 * Converts image URL for platform-specific loading.
 * On JS/Web platforms, returns URL through CORS proxy.
 * On native platforms, returns original URL.
 */
expect fun getImageUrl(originalUrl: String): String

