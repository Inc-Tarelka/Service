package dev.tarelka.service.network

import io.ktor.client.*
import io.ktor.client.plugins.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.plugins.logging.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.json.Json

object KtorClient {
    private const val BASE_URL = "https://api.thecatapi.com"
    private const val API_KEY = "live_Z1ERXzBu5DjtK73hYSUSAffNgM2AVc519LfEPsnAIe7HjFJuwCr1pZXhQHbjDwjQ"
    
    val client = HttpClient {
        install(ContentNegotiation) {
            json(Json {
                prettyPrint = true
                isLenient = true
                ignoreUnknownKeys = true
            })
        }
        
        install(Logging) {
            logger = Logger.DEFAULT
            level = LogLevel.INFO
        }
        
        install(DefaultRequest) {
            url {
                protocol = URLProtocol.HTTPS
                host = "api.thecatapi.com"
                path("v1/")
            }
            headers.append("x-api-key", API_KEY)
        }
        
        install(HttpTimeout) {
            requestTimeoutMillis = 30_000
            connectTimeoutMillis = 30_000
            socketTimeoutMillis = 30_000
        }
    }
}

