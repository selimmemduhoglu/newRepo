package com.example.nevotv;

import android.app.job.JobParameters;
import android.app.job.JobService;
import android.content.Intent;
import android.util.Log;

// This class is a helper class that calls the MainActivity.
// You can use this service to call any other activity.
// In general it will work in parallel with JobSchedulerHelper.
// JobSchedulerHelper is used in methods like
// BootReceiver and PowerStateReceiver that will call the MainActivity.
public class AppJobService extends JobService {

    private static final String TAG = "AppJobService";

    @Override
    public boolean onStartJob(JobParameters params) {
        Log.d(TAG, "Job started");

        // Start your MainActivity or perform other initialization
        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);

        // Return true if your job needs to continue running
        return false;
    }

    @Override
    public boolean onStopJob(JobParameters params) {
        Log.d(TAG, "Job stopped");
        return false;
        // Return true if you want the job to reschedule. In our case it shouldn't reschedule.
    }
}
