package dev.tarelka.service.feed.domain.repository

import dev.tarelka.service.network.model.CatImage

interface FeedRepository {
    suspend fun getImages(limit: Int = 10): Result<List<CatImage>>
}

