package dev.tarelka.service.feed.presentation

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import dev.tarelka.service.feed.presentation.components.ErrorView
import dev.tarelka.service.feed.presentation.components.ImageList

@Composable
fun FeedView(
    state: FeedState,
    onEvent: (FeedEvent) -> Unit,
    modifier: Modifier = Modifier
) {
    val listState = rememberLazyListState()
    
    // Detect when user scrolls to bottom
    LaunchedEffect(listState) {
        snapshotFlow { listState.layoutInfo.visibleItemsInfo.lastOrNull()?.index }
            .collect { lastVisibleIndex ->
                if (lastVisibleIndex != null && 
                    lastVisibleIndex >= state.images.size - 2 && 
                    !state.isLoading) {
                    onEvent(FeedEvent.LoadMore)
                }
            }
    }
    
    Box(
        modifier = modifier
            .fillMaxSize()
            .statusBarsPadding()
    ) {
            when {
                state.isLoading && state.images.isEmpty() -> {
                    LoadingView()
                }
                state.error != null && state.images.isEmpty() -> {
                    ErrorView(
                        message = state.error,
                        onRetry = { onEvent(FeedEvent.LoadImages) }
                    )
                }
                state.images.isNotEmpty() -> {
                    ImageList(
                        images = state.images,
                        listState = listState,
                        isRefreshing = state.isRefreshing,
                        onRefresh = { onEvent(FeedEvent.RefreshImages) },
                        isLoadingMore = state.isLoading
                    )
                }
                else -> {
                    // Empty state
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("No images to display")
                    }
            }
        }
    }
}

@Composable
private fun LoadingView() {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        CircularProgressIndicator()
    }
}

