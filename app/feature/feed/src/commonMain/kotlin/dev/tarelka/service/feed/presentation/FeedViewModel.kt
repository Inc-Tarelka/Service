package dev.tarelka.service.feed.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dev.tarelka.service.feed.domain.usecase.GetImagesUseCase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class FeedViewModel(
    private val getImagesUseCase: GetImagesUseCase
) : ViewModel() {
    
    private val _state = MutableStateFlow(FeedState())
    val state: StateFlow<FeedState> = _state.asStateFlow()
    
    init {
        onEvent(FeedEvent.LoadImages)
    }
    
    fun onEvent(event: FeedEvent) {
        when (event) {
            is FeedEvent.LoadImages -> loadImages()
            is FeedEvent.RefreshImages -> refreshImages()
            is FeedEvent.LoadMore -> loadMore()
        }
    }
    
    private fun loadImages() {
        viewModelScope.launch {
            println("📱 FeedViewModel: Loading images...")
            _state.update { it.copy(isLoading = true, error = null) }
            
            getImagesUseCase(limit = 10)
                .onSuccess { images ->
                    println("✅ FeedViewModel: Successfully loaded ${images.size} images")
                    _state.update { 
                        it.copy(
                            images = images,
                            isLoading = false,
                            error = null
                        )
                    }
                }
                .onFailure { error ->
                    println("❌ FeedViewModel: Error loading images: ${error.message}")
                    error.printStackTrace()
                    _state.update { 
                        it.copy(
                            isLoading = false,
                            error = error.message ?: "Unknown error"
                        )
                    }
                }
        }
    }
    
    private fun refreshImages() {
        viewModelScope.launch {
            println("🔄 FeedViewModel: Refreshing images...")
            _state.update { it.copy(isRefreshing = true, error = null) }
            
            getImagesUseCase(limit = 10)
                .onSuccess { images ->
                    println("✅ FeedViewModel: Successfully refreshed ${images.size} images")
                    _state.update { 
                        it.copy(
                            images = images,
                            isRefreshing = false,
                            error = null
                        )
                    }
                }
                .onFailure { error ->
                    println("❌ FeedViewModel: Error refreshing images: ${error.message}")
                    _state.update { 
                        it.copy(
                            isRefreshing = false,
                            error = error.message ?: "Unknown error"
                        )
                    }
                }
        }
    }
    
    private fun loadMore() {
        viewModelScope.launch {
            if (_state.value.isLoading) {
                println("⏸️ FeedViewModel: Already loading, skipping loadMore")
                return@launch
            }
            
            println("➕ FeedViewModel: Loading more images...")
            _state.update { it.copy(isLoading = true, error = null) }
            
            getImagesUseCase(limit = 10)
                .onSuccess { newImages ->
                    println("✅ FeedViewModel: Successfully loaded ${newImages.size} more images")
                    _state.update { 
                        it.copy(
                            images = it.images + newImages,
                            isLoading = false,
                            error = null
                        )
                    }
                }
                .onFailure { error ->
                    println("❌ FeedViewModel: Error loading more images: ${error.message}")
                    _state.update { 
                        it.copy(
                            isLoading = false,
                            error = error.message ?: "Unknown error"
                        )
                    }
                }
        }
    }
}

