package dev.tarelka.service.navigation.components

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun DisabledFeature(modifier: Modifier) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .then(modifier),
    ) {
        Text("Yet Another Screen")
    }
}
