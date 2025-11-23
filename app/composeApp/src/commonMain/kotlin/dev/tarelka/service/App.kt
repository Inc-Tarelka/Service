package dev.tarelka.service

import androidx.compose.runtime.Composable
import dev.tarelka.service.navigation.components.NavigationScaffold
import dev.tarelka.service.theme.TarelkaTheme
import org.jetbrains.compose.ui.tooling.preview.Preview

@Composable
@Preview
fun App() {
    TarelkaTheme {
        NavigationScaffold()
    }
}
