package com.socanalyzer.app.di

import android.content.Context
import com.socanalyzer.app.data.collector.SocDataCollector
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
    fun provideSocDataCollector(
        @ApplicationContext context: Context
    ): SocDataCollector {
        return SocDataCollector(context)
    }
}
