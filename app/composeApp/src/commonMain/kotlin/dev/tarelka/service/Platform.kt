package dev.tarelka.service

interface Platform {
    val name: String
}

expect fun getPlatform(): Platform