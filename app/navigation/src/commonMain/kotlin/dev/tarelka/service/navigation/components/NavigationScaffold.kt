package dev.tarelka.service.navigation.components

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Snackbar
import androidx.compose.material3.SnackbarDuration
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.navigation.NavDestination.Companion.hasRoute
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import dev.tarelka.service.navigation.AppNavGraph
import dev.tarelka.service.navigation.NavigationGraph
import dev.tarelka.service.navigation.utils.isBottomBarVisible
import kotlinx.coroutines.launch

@Composable
fun NavigationScaffold() {
    val navController = rememberNavController()

    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentDestination = navBackStackEntry?.destination

    val selected = AppNavGraph.routes.firstOrNull { route ->
        currentDestination?.hierarchy?.any { it.hasRoute(route::class) } == true
    }

    val isBottomBarVisible = isBottomBarVisible(currentDestination)

    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        snackbarHost = {
            SnackbarHost(hostState = snackbarHostState) { data ->
                Snackbar(
                    snackbarData = data,
                    containerColor = MaterialTheme.colorScheme.primary,
                    contentColor = MaterialTheme.colorScheme.onPrimary
                )
            }
        },
        bottomBar = {
            if (isBottomBarVisible) {
                AppBar(
                    routes = AppNavGraph.routes,
                    selected = selected,
                    onRouteClick = {
                        scope.launch {
                            val result = snackbarHostState.showSnackbar(
                                message = "Not Implemented",
                                actionLabel = "Hide",
                                duration = SnackbarDuration.Short
                            )
                        }

                        navController.navigate(it) {
                            popUpTo(navController.graph.startDestinationId) {
                                saveState = true
                            }
                            launchSingleTop = true
                            restoreState = true
                        }
                    },
                )
            }
        },
    ) { innerPadding ->
        NavigationGraph(
            innerPadding = innerPadding,
            navController = navController,
        )
    }
}

