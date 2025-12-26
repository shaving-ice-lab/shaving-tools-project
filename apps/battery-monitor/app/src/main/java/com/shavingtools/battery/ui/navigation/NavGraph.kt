package com.shavingtools.battery.ui.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.shavingtools.battery.ui.screens.DashboardScreen
import com.shavingtools.battery.ui.screens.HistoryScreen
import com.shavingtools.battery.ui.screens.ReportScreen
import com.shavingtools.battery.ui.screens.SettingsScreen
import com.shavingtools.battery.ui.screens.TestScreen

sealed class Screen(
    val route: String,
    val title: String,
    val icon: ImageVector? = null
) {
    data object Dashboard : Screen("dashboard", "监控", Icons.Default.Home)
    data object Test : Screen("test", "测试", Icons.Default.PlayArrow)
    data object History : Screen("history", "历史", Icons.Default.History)
    data object Settings : Screen("settings", "设置", Icons.Default.Settings)
    data object Report : Screen("report/{sessionId}", "报告")
}

val bottomNavItems = listOf(
    Screen.Dashboard,
    Screen.Test,
    Screen.History,
    Screen.Settings
)

@Composable
fun BatteryNavGraph() {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentDestination = navBackStackEntry?.destination

    Scaffold(
        bottomBar = {
            NavigationBar {
                bottomNavItems.forEach { screen ->
                    NavigationBarItem(
                        icon = { Icon(screen.icon, contentDescription = screen.title) },
                        label = { Text(screen.title) },
                        selected = currentDestination?.hierarchy?.any { it.route == screen.route } == true,
                        onClick = {
                            navController.navigate(screen.route) {
                                popUpTo(navController.graph.findStartDestination().id) {
                                    saveState = true
                                }
                                launchSingleTop = true
                                restoreState = true
                            }
                        }
                    )
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Dashboard.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Dashboard.route) {
                DashboardScreen()
            }
            composable(Screen.Test.route) {
                TestScreen()
            }
            composable(Screen.History.route) {
                HistoryScreen(
                    onNavigateToReport = { sessionId ->
                        navController.navigate("report/$sessionId")
                    }
                )
            }
            composable(Screen.Settings.route) {
                SettingsScreen()
            }
            composable(
                route = Screen.Report.route,
                arguments = listOf(navArgument("sessionId") { type = NavType.StringType })
            ) { backStackEntry ->
                val sessionId = backStackEntry.arguments?.getString("sessionId") ?: ""
                ReportScreen(
                    sessionId = sessionId,
                    onBack = { navController.popBackStack() }
                )
            }
        }
    }
}

fun navigateToReport(navController: androidx.navigation.NavController, sessionId: String) {
    navController.navigate("report/$sessionId")
}
