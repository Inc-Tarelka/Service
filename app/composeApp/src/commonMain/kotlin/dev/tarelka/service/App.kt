package dev.tarelka.service

import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import dev.tarelka.service.navigation.components.NavigationScaffold
import org.jetbrains.compose.ui.tooling.preview.Preview

@Composable
@Preview
fun App() {
    MaterialTheme {
        NavigationScaffold()
    }
}
