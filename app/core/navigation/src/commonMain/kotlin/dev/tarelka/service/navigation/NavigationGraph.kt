package dev.tarelka.service.navigation

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import dev.tarelka.service.feed.presentation.FeedScreen
import dev.tarelka.service.navigation.utils.Feature

@Composable
fun NavigationGraph(
    navController: NavHostController = rememberNavController(),
    innerPadding: PaddingValues
) {
    NavHost(
        navController = navController,
        startDestination = AppNavGraph.Feed,
    ) {

        composable<AppNavGraph.Feed> {
            FeedScreen(
                modifier = Modifier.padding(innerPadding)
            )
        }

        composable<AppNavGraph.Search> {
            Feature(
                enabled = false,
                modifier = Modifier
                    .padding(innerPadding)
            ) {
                Text("Поиск")
            }
        }

        composable<AppNavGraph.Notifications> {
            Feature(
                enabled = false,
                modifier = Modifier
                    .padding(innerPadding)
            ) {
                Text("Уведомляшки")
            }
        }

        composable<AppNavGraph.Profile> {
            Feature(
                enabled = false,
                modifier = Modifier
                    .padding(innerPadding)
            ) {
                Text("Профиль")
            }
        }
    }
}

