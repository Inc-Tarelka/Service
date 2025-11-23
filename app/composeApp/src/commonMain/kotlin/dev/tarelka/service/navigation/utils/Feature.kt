package dev.tarelka.service.navigation.utils

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import dev.tarelka.service.navigation.components.DisabledFeature

@Composable
fun Feature(
    enabled: Boolean,
    modifier: Modifier = Modifier,
    feature: @Composable () -> Unit,
) {
    if (enabled) feature() else DisabledFeature(modifier)
}
