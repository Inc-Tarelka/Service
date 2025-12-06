package dev.tarelka.service.feed.utils

/**
 * iOS implementation - uses original URL (no CORS restrictions)
 */
actual fun getImageUrl(originalUrl: String): String = originalUrl

