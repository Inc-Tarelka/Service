package dev.tarelka.service.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val TarelkaLightColorScheme = lightColorScheme(
    primary = TarelkaLightPrimary,
    onPrimary = TarelkaLightOnPrimary,
    primaryContainer = TarelkaLightPrimaryContainer,
    onPrimaryContainer = TarelkaLightOnPrimaryContainer,
    secondary = TarelkaLightSecondary,
    onSecondary = TarelkaLightOnSecondary,
    secondaryContainer = TarelkaLightSecondaryContainer,
    onSecondaryContainer = TarelkaLightOnSecondaryContainer,
    tertiary = TarelkaLightTertiary,
    onTertiary = TarelkaLightOnTertiary,
    tertiaryContainer = TarelkaLightTertiaryContainer,
    onTertiaryContainer = TarelkaLightOnTertiaryContainer,
    error = TarelkaLightError,
    onError = TarelkaLightOnError,
    errorContainer = TarelkaLightErrorContainer,
    onErrorContainer = TarelkaLightOnErrorContainer,
    background = TarelkaLightBackground,
    onBackground = TarelkaLightOnBackground,
    surface = TarelkaLightSurface,
    onSurface = TarelkaLightOnSurface,
    surfaceVariant = TarelkaLightSurfaceVariant,
    onSurfaceVariant = TarelkaLightOnSurfaceVariant,
    outline = TarelkaLightOutline,
    outlineVariant = TarelkaLightOutlineVariant,
    inverseSurface = TarelkaLightInverseSurface,
    inverseOnSurface = TarelkaLightInverseOnSurface,
    inversePrimary = TarelkaLightInversePrimary,
)

private val TarelkaDarkColorScheme = darkColorScheme(
    primary = TarelkaDarkPrimary,
    onPrimary = TarelkaDarkOnPrimary,
    primaryContainer = TarelkaDarkPrimaryContainer,
    onPrimaryContainer = TarelkaDarkOnPrimaryContainer,
    secondary = TarelkaDarkSecondary,
    onSecondary = TarelkaDarkOnSecondary,
    secondaryContainer = TarelkaDarkSecondaryContainer,
    onSecondaryContainer = TarelkaDarkOnSecondaryContainer,
    tertiary = TarelkaDarkTertiary,
    onTertiary = TarelkaDarkOnTertiary,
    tertiaryContainer = TarelkaDarkTertiaryContainer,
    onTertiaryContainer = TarelkaDarkOnTertiaryContainer,
    error = TarelkaDarkError,
    onError = TarelkaDarkOnError,
    errorContainer = TarelkaDarkErrorContainer,
    onErrorContainer = TarelkaDarkOnErrorContainer,
    background = TarelkaDarkBackground,
    onBackground = TarelkaDarkOnBackground,
    surface = TarelkaDarkSurface,
    onSurface = TarelkaDarkOnSurface,
    surfaceVariant = TarelkaDarkSurfaceVariant,
    onSurfaceVariant = TarelkaDarkOnSurfaceVariant,
    outline = TarelkaDarkOutline,
    outlineVariant = TarelkaDarkOutlineVariant,
    inverseSurface = TarelkaDarkInverseSurface,
    inverseOnSurface = TarelkaDarkInverseOnSurface,
    inversePrimary = TarelkaDarkInversePrimary,
)

@Composable
fun TarelkaTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) {
        TarelkaDarkColorScheme
    } else {
        TarelkaLightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}

