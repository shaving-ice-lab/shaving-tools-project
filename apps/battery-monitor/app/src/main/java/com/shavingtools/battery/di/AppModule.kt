package com.shavingtools.battery.di

import android.content.Context
import com.shavingtools.battery.data.repository.BatteryRepository
import com.shavingtools.battery.domain.analyzer.BatteryAnalyzer
import com.shavingtools.battery.domain.export.DataExporter
import com.shavingtools.battery.domain.export.ReportGenerator
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideBatteryAnalyzer(): BatteryAnalyzer {
        return BatteryAnalyzer()
    }

    @Provides
    @Singleton
    fun provideDataExporter(): DataExporter {
        return DataExporter()
    }

    @Provides
    @Singleton
    fun provideReportGenerator(
        repository: BatteryRepository,
        analyzer: BatteryAnalyzer
    ): ReportGenerator {
        return ReportGenerator(repository, analyzer)
    }
}
