package dev.tarelka.service.navigation.utils

import androidx.compose.runtime.Composable
import androidx.navigation.NavDestination

@Composable
fun isBottomBarVisible(
    currentDestination: NavDestination?,
): Boolean {
//    val notVisitedBattleRoutes = listOf(AppNavGraph.Battle.BattleRoutes.Choose)
//
//    val selectedBattleRoutes = AppNavGraph.Battle.BattleRoutes.routes.firstOrNull { route ->
//        currentDestination?.hierarchy?.any { it.hasRoute(route::class) } == true
//    }
//
//    return selectedBattleRoutes !in notVisitedBattleRoutes
    return true
}
