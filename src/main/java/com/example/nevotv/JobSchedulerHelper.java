package com.example.nevotv;

import android.app.job.JobInfo;
import android.app.job.JobScheduler;
import android.content.ComponentName;
import android.content.Context;

// This class schedule a job and sent it to the AppJobService.
// This will be called when there is a reboot and when the screen gets turned off than on
public class JobSchedulerHelper {

    private static final int JOB_ID = 1;

    public static void scheduleJob(Context context) {
        JobScheduler jobScheduler = (JobScheduler) context.getSystemService(Context.JOB_SCHEDULER_SERVICE);
        JobInfo.Builder builder = new JobInfo.Builder(JOB_ID,
                new ComponentName(context, AppJobService.class))
                .setRequiredNetworkType(JobInfo.NETWORK_TYPE_ANY)
                .setPersisted(true); // Persist the job across reboots

        jobScheduler.schedule(builder.build());
    }
}
