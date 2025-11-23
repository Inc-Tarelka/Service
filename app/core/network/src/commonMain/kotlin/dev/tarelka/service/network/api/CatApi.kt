package dev.tarelka.service.network.api

import dev.tarelka.service.network.KtorClient
import dev.tarelka.service.network.model.CatImage
import io.ktor.client.call.*
import io.ktor.client.request.*
import io.ktor.client.statement.*

class CatApi {
    private val client = KtorClient.client
    
    suspend fun getImages(limit: Int = 10): List<CatImage> {
        return try {
            println("🐱 CatApi: Requesting $limit images from Cat API...")
            
            val response: HttpResponse = client.get("images/search") {
                parameter("limit", limit)
            }
            
            println("🐱 CatApi: Request URL: ${response.request.url}")
            println("🐱 CatApi: Response status: ${response.status}")
            
            val images: List<CatImage> = response.body()
            println("🐱 CatApi: Successfully loaded ${images.size} images")
            
            images.forEach { image ->
                println("🐱 Image: id=${image.id}, url=${image.url}")
            }
            
            images
        } catch (e: Exception) {
            println("❌ CatApi Error: ${e.message}")
            println("❌ CatApi Error stacktrace: ${e.stackTraceToString()}")
            emptyList()
        }
    }
}

