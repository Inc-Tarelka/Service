package dev.tarelka.service.feed.presentation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import dev.tarelka.service.feed.data.repository.FeedRepositoryImpl
import dev.tarelka.service.feed.domain.usecase.GetImagesUseCase
import dev.tarelka.service.network.api.CatApi

@Composable
fun FeedScreen(
    modifier: Modifier = Modifier
) {
    println("🚀 FeedScreen: Initializing...")
    
    // Dependency injection (в реальном проекте используйте DI фреймворк)
    val api = CatApi()
    val repository = FeedRepositoryImpl(api)
    val useCase = GetImagesUseCase(repository)
    
    println("🔧 FeedScreen: Dependencies created")
    
    val viewModel: FeedViewModel = viewModel { 
        println("🎯 FeedScreen: Creating ViewModel")
        FeedViewModel(useCase) 
    }
    
    val state by viewModel.state.collectAsState()
    
    LaunchedEffect(state) {
        println("📊 FeedScreen State: isLoading=${state.isLoading}, images=${state.images.size}, error=${state.error}")
    }
    
    FeedView(
        state = state,
        onEvent = viewModel::onEvent,
        modifier = modifier
    )
}

