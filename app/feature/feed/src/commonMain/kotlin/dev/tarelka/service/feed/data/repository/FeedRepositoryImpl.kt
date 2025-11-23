package dev.tarelka.service.feed.data.repository

import dev.tarelka.service.feed.domain.repository.FeedRepository
import dev.tarelka.service.network.api.CatApi
import dev.tarelka.service.network.model.CatImage

class FeedRepositoryImpl(
    private val api: CatApi
) : FeedRepository {
    override suspend fun getImages(limit: Int): Result<List<CatImage>> {
        return try {
            println("🗄️ FeedRepository: Fetching $limit images from API...")
            val images = api.getImages(limit)
            
            if (images.isEmpty()) {
                println("⚠️ FeedRepository: API returned empty list")
            } else {
                println("✅ FeedRepository: Got ${images.size} images from API")
            }
            
            Result.success(images)
        } catch (e: Exception) {
            println("❌ FeedRepository Error: ${e.message}")
            e.printStackTrace()
            Result.failure(e)
        }
    }
}

