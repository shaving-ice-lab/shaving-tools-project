package com.shavingtools.battery.ui.viewmodel

import android.content.Context
import android.widget.Toast
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.shavingtools.battery.data.repository.BatteryRepository
import com.shavingtools.battery.domain.export.DataExporter
import com.shavingtools.battery.domain.export.ReportGenerator
import com.shavingtools.battery.domain.model.TestReport
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import javax.inject.Inject

@HiltViewModel
class ReportViewModel @Inject constructor(
    private val repository: BatteryRepository,
    private val reportGenerator: ReportGenerator,
    private val dataExporter: DataExporter
) : ViewModel() {

    private val _report = MutableStateFlow<TestReport?>(null)
    val report: StateFlow<TestReport?> = _report.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    fun loadReport(sessionId: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null

            reportGenerator.generateReport(sessionId)
                .onSuccess { report ->
                    _report.value = report
                }
                .onFailure { e ->
                    _error.value = e.message ?: "生成报告失败"
                }

            _isLoading.value = false
        }
    }

    fun exportToPdf(context: Context) {
        val currentReport = _report.value ?: return

        viewModelScope.launch {
            try {
                val file = withContext(Dispatchers.IO) {
                    reportGenerator.exportToPdf(context, currentReport)
                }
                withContext(Dispatchers.Main) {
                    Toast.makeText(context, "PDF已保存: ${file.name}", Toast.LENGTH_SHORT).show()
                    dataExporter.shareFile(context, file, "application/pdf")
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(context, "导出失败: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    fun exportToJson(context: Context) {
        val currentReport = _report.value ?: return

        viewModelScope.launch {
            try {
                val json = dataExporter.exportReportToJson(currentReport)
                val fileName = dataExporter.generateFileName("battery_report", "json")
                val file = withContext(Dispatchers.IO) {
                    dataExporter.saveToFile(context, json, fileName)
                }
                withContext(Dispatchers.Main) {
                    Toast.makeText(context, "JSON已保存: ${file.name}", Toast.LENGTH_SHORT).show()
                    dataExporter.shareFile(context, file, "application/json")
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(context, "导出失败: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    fun exportToCsv(context: Context) {
        val currentReport = _report.value ?: return

        viewModelScope.launch {
            try {
                val csv = dataExporter.exportSessionToCsv(currentReport.session, currentReport.records)
                val fileName = dataExporter.generateFileName("battery_data", "csv")
                val file = withContext(Dispatchers.IO) {
                    dataExporter.saveToFile(context, csv, fileName)
                }
                withContext(Dispatchers.Main) {
                    Toast.makeText(context, "CSV已保存: ${file.name}", Toast.LENGTH_SHORT).show()
                    dataExporter.shareFile(context, file, "text/csv")
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(context, "导出失败: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    fun shareReport(context: Context) {
        val currentReport = _report.value ?: return

        viewModelScope.launch {
            val textReport = reportGenerator.generateTextReport(currentReport)
            dataExporter.shareText(
                context,
                textReport,
                "电池续航测试报告 - ${currentReport.scenario.name}"
            )
        }
    }
}
