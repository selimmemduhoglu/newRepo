package com.example.nevotv;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Handler;
import android.os.Looper;
import android.os.PowerManager;
import android.util.Log;
import android.widget.Toast;

public class PowerStateReceiver extends BroadcastReceiver {
    private static final String TAG = "PowerStateReceiver";
    private static final int DELAY_MILLIS = 20; // 5 seconds delay if the welcome screen of the TV is on
    // If the welcome screen is not on use your own delay
    private PowerManager.WakeLock wakeLock;

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent.getAction() == null) {
            return;
        }

        switch (intent.getAction()) {
            case Intent.ACTION_SCREEN_OFF:
                Log.d(TAG, "onReceive: SCREEN OFF");
                acquireWakeLock(context);
                break;

            case Intent.ACTION_SCREEN_ON:
                Log.d(TAG, "onReceive: SCREEN ON");
                handleScreenOn(context);
                break;

            default:
                Log.d(TAG, "onReceive: Unhandled action");
                break;
        }
    }

    private void handleScreenOn(Context context) {
        // Send broadcast to finish the old MainActivity
        Intent finishIntent = new Intent("ACTION_FINISH_ACTIVITY");
        context.sendBroadcast(finishIntent);

        // Delay starting the new MainActivity
        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            // Start a new instance of MainActivity
            Intent activityIntent = new Intent(context, MainActivity.class);
            activityIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            context.startActivity(activityIntent);

            JobSchedulerHelper.scheduleJob(context);

            Toast.makeText(context, "App is starting", Toast.LENGTH_LONG).show();

            // Release the WakeLock after the activity starts
            releaseWakeLock();
        }, DELAY_MILLIS);
    }

    private void acquireWakeLock(Context context) {
        // Acquires a WakeLock to keep the CPU running even if the screen is off.
        if (wakeLock == null) {
            PowerManager powerManager = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
            if (powerManager != null) {
                wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "motionDetection:keepAwake");
            }
        }
        if (wakeLock != null && !wakeLock.isHeld()) {
            wakeLock.acquire();
            Log.d(TAG, "WakeLock acquired");
        }
    }

    private void releaseWakeLock() {
        // Releases the WakeLock to allow the device to enter its normal power state.
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
            Log.d(TAG, "WakeLock released");
            wakeLock = null; // Clean up reference
        }
    }

}
