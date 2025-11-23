package dev.tarelka.service.feed.presentation

sealed interface FeedEvent {
    data object LoadImages : FeedEvent
    data object RefreshImages : FeedEvent
    data object LoadMore : FeedEvent
}

