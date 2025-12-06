package dev.tarelka.service.feed.presentation.components

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import coil3.ImageLoader
import coil3.compose.AsyncImage
import coil3.compose.LocalPlatformContext
import coil3.network.ktor3.KtorNetworkFetcherFactory
import coil3.request.ImageRequest
import coil3.request.crossfade
import dev.tarelka.service.network.model.CatImage
import dev.tarelka.service.feed.utils.getImageUrl
import io.ktor.client.HttpClient

@Composable
fun CatImageItem(
    image: CatImage,
    modifier: Modifier = Modifier
) {
    val context = LocalPlatformContext.current
    val imageLoader = remember {
        ImageLoader.Builder(context)
            .components {
                add(KtorNetworkFetcherFactory(HttpClient()))
            }
            .crossfade(true)
            .build()
    }
    
    // Get platform-specific URL (with CORS proxy for web)
    val imageUrl = remember(image.url) { getImageUrl(image.url) }
    
    Card(
        modifier = modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxWidth()
        ) {
            val imageRequest = remember(imageUrl) {
                ImageRequest.Builder(context)
                    .data(imageUrl)
                    .crossfade(true)
                    .build()
            }
            
            AsyncImage(
                model = imageRequest,
                contentDescription = "Cat image ${image.id}",
                imageLoader = imageLoader,
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(image.width.toFloat() / image.height.toFloat())
                    .clip(RoundedCornerShape(8.dp)),
                contentScale = ContentScale.Crop,
                onLoading = { 
                    println("🖼️ Loading image: $imageUrl")
                },
                onSuccess = { 
                    println("✅ Image loaded: ${image.url}")
                },
                onError = { error ->
                    println("❌ Error loading image: ${image.url}, error: ${error.result.throwable}")
                }
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = "ID: ${image.id}",
                style = MaterialTheme.typography.bodySmall,
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
            )
        }
    }
}

