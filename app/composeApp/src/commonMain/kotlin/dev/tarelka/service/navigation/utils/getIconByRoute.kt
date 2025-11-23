package dev.tarelka.service.navigation.utils

import androidx.compose.runtime.Composable
import dev.tarelka.service.navigation.AppNavGraph
import org.jetbrains.compose.resources.DrawableResource
import tarelka.composeapp.generated.resources.Res
import tarelka.composeapp.generated.resources.ic_feed
import tarelka.composeapp.generated.resources.ic_notification
import tarelka.composeapp.generated.resources.ic_profile
import tarelka.composeapp.generated.resources.ic_search

@Composable
internal fun getIconByRoute(route: AppNavGraph): DrawableResource = when (route) {
    AppNavGraph.Feed                         -> Res.drawable.ic_feed
    AppNavGraph.Search                       -> Res.drawable.ic_search
    AppNavGraph.Notifications                -> Res.drawable.ic_notification
    AppNavGraph.Profile                      -> Res.drawable.ic_profile
}
