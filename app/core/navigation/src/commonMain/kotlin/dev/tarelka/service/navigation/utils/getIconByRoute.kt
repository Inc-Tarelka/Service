package dev.tarelka.service.navigation.utils

import androidx.compose.runtime.Composable
import dev.tarelka.service.navigation.AppNavGraph
import org.jetbrains.compose.resources.DrawableResource
import tarelka.core.navigation.generated.resources.Res
import tarelka.core.navigation.generated.resources.ic_feed
import tarelka.core.navigation.generated.resources.ic_notification
import tarelka.core.navigation.generated.resources.ic_profile
import tarelka.core.navigation.generated.resources.ic_search

@Composable
fun getIconByRoute(route: AppNavGraph): DrawableResource = when (route) {
    AppNavGraph.Feed -> Res.drawable.ic_feed
    AppNavGraph.Search -> Res.drawable.ic_search
    AppNavGraph.Notifications -> Res.drawable.ic_notification
    AppNavGraph.Profile -> Res.drawable.ic_profile
}

