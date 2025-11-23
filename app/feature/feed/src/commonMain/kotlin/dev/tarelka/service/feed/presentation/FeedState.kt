package dev.tarelka.service.feed.presentation

import dev.tarelka.service.network.model.CatImage

data class FeedState(
    val images: List<CatImage> = emptyList(),
    val isLoading: Boolean = false,
    val isRefreshing: Boolean = false,
    val error: String? = null
)

