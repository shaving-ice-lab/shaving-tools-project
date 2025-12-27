package com.shavingtools.fpsmonitor.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.shavingtools.fpsmonitor.ui.screens.home.HomeScreen
import com.shavingtools.fpsmonitor.ui.screens.monitor.MonitorScreen
import com.shavingtools.fpsmonitor.ui.screens.history.HistoryScreen
import com.shavingtools.fpsmonitor.ui.screens.settings.SettingsScreen

sealed class Screen(val route: String) {
    object Home : Screen("home")
    object Monitor : Screen("monitor")
    object History : Screen("history")
    object Settings : Screen("settings")
}

@Composable
fun FpsMonitorNavHost(navController: NavHostController) {
    NavHost(
        navController = navController,
        startDestination = Screen.Home.route
    ) {
        composable(Screen.Home.route) {
            HomeScreen(
                onStartMonitor = { navController.navigate(Screen.Monitor.route) },
                onViewHistory = { navController.navigate(Screen.History.route) },
                onSettings = { navController.navigate(Screen.Settings.route) }
            )
        }
        composable(Screen.Monitor.route) {
            MonitorScreen(
                onBack = { navController.popBackStack() }
            )
        }
        composable(Screen.History.route) {
            HistoryScreen(
                onBack = { navController.popBackStack() }
            )
        }
        composable(Screen.Settings.route) {
            SettingsScreen(
                onBack = { navController.popBackStack() }
            )
        }
    }
}
