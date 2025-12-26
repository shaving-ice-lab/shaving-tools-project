package com.shavingtools.battery.di

import android.content.Context
import androidx.room.Room
import com.shavingtools.battery.data.local.BatteryDatabase
import com.shavingtools.battery.data.local.dao.BatteryRecordDao
import com.shavingtools.battery.data.local.dao.TestSessionDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideBatteryDatabase(
        @ApplicationContext context: Context
    ): BatteryDatabase {
        return Room.databaseBuilder(
            context,
            BatteryDatabase::class.java,
            BatteryDatabase.DATABASE_NAME
        ).build()
    }

    @Provides
    @Singleton
    fun provideBatteryRecordDao(database: BatteryDatabase): BatteryRecordDao {
        return database.batteryRecordDao()
    }

    @Provides
    @Singleton
    fun provideTestSessionDao(database: BatteryDatabase): TestSessionDao {
        return database.testSessionDao()
    }
}
