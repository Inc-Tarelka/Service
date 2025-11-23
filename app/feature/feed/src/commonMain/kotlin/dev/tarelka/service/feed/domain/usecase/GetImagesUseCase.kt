package dev.tarelka.service.feed.domain.usecase

import dev.tarelka.service.feed.domain.repository.FeedRepository
import dev.tarelka.service.network.model.CatImage

class GetImagesUseCase(
    private val repository: FeedRepository
) {
    suspend operator fun invoke(limit: Int = 10): Result<List<CatImage>> {
        println("💼 GetImagesUseCase: Requesting $limit images...")
        val result = repository.getImages(limit)
        
        result.fold(
            onSuccess = { images ->
                println("✅ GetImagesUseCase: Successfully got ${images.size} images")
            },
            onFailure = { error ->
                println("❌ GetImagesUseCase Error: ${error.message}")
            }
        )
        
        return result
    }
}

