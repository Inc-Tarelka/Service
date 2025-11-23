package dev.tarelka.service.navigation.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import dev.tarelka.service.navigation.AppNavGraph
import dev.tarelka.service.navigation.utils.getIconByRoute
import org.jetbrains.compose.resources.painterResource
import org.jetbrains.compose.ui.tooling.preview.Preview

@Composable
internal fun AppBar(
    routes: List<AppNavGraph>,
    selected: AppNavGraph?,
    onRouteClick: (AppNavGraph) -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(MaterialTheme.colorScheme.surface)
            .navigationBarsPadding(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(2.dp)
    ) {

        HorizontalDivider(
            modifier = Modifier.fillMaxWidth(0.99f),
            color = MaterialTheme.colorScheme.outlineVariant
        )

        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            routes.forEach { route ->
                IconButton(
                    modifier = Modifier
                        .weight(0.2f)
                        .clip(RoundedCornerShape(8.dp))
                        .then(
                            if (selected == route) {
                                Modifier.background(MaterialTheme.colorScheme.secondary)
                            } else {
                                Modifier
                            }
                        ),
                    onClick = { onRouteClick(route) },
                ) {
                    Icon(
                        painter = painterResource(getIconByRoute(route)),
                        contentDescription = null,
                        tint = if (selected == route) {
                            MaterialTheme.colorScheme.onSecondary
                        } else {
                            MaterialTheme.colorScheme.inverseSurface
                        }
                    )
                }
            }
        }
    }
}

@Preview
@Composable
internal fun AppBarPreview() {
    AppBar(
        routes = AppNavGraph.routes,
        selected = AppNavGraph.Profile,
        onRouteClick = {},
    )
}
