package com.shavingtools.fpsmonitor.di

import android.content.Context
import androidx.room.Room
import com.shavingtools.fpsmonitor.data.local.FpsDatabase
import com.shavingtools.fpsmonitor.data.local.dao.FrameRecordDao
import com.shavingtools.fpsmonitor.data.local.dao.TestSessionDao
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
    fun provideDatabase(@ApplicationContext context: Context): FpsDatabase {
        return Room.databaseBuilder(
            context,
            FpsDatabase::class.java,
            "fps_monitor.db"
        ).build()
    }

    @Provides
    fun provideFrameRecordDao(database: FpsDatabase): FrameRecordDao {
        return database.frameRecordDao()
    }

    @Provides
    fun provideTestSessionDao(database: FpsDatabase): TestSessionDao {
        return database.testSessionDao()
    }
}
