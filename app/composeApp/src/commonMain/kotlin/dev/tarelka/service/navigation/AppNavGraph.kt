package dev.tarelka.service.navigation

import kotlinx.serialization.Serializable

internal sealed interface AppNavGraph {

    @Serializable
    data object Feed : AppNavGraph

    @Serializable
    data object Search : AppNavGraph

    @Serializable
    data object Notifications : AppNavGraph {
//        sealed interface BattleRoutes {
//            @Serializable
//            data object Landing : BattleRoutes
//
//            @Serializable
//            data object Choose : BattleRoutes
//
//            companion object {
//                val routes = listOf(Landing, Choose)
//            }
//        }
    }

    @Serializable
    data object Profile : AppNavGraph

    companion object {
        val routes = listOf(Feed, Search, Notifications, Profile)
    }
}
