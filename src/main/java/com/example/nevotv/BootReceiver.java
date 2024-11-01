package com.example.nevotv;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;
import android.widget.Toast;

public class BootReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) {
            // Log for debugging purposes
            Log.d("BootReceiver", "Device booted, scheduling job...");

            // Schedule the job using the utility class
            JobSchedulerHelper.scheduleJob(context);
            Toast.makeText(context, "App is starting", Toast.LENGTH_LONG).show();
        }
    }
}
