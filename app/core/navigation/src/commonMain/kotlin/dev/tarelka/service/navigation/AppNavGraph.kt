package dev.tarelka.service.navigation

import kotlinx.serialization.Serializable

sealed interface AppNavGraph {

    @Serializable
    data object Feed : AppNavGraph

    @Serializable
    data object Search : AppNavGraph

    @Serializable
    data object Notifications : AppNavGraph

    @Serializable
    data object Profile : AppNavGraph

    companion object {
        val routes: List<AppNavGraph> = listOf(Feed, Search, Notifications, Profile)
    }
}

