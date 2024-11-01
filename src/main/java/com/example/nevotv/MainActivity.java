package com.example.nevotv;

import android.content.Intent;
import android.content.IntentFilter;
import android.graphics.Color;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.view.KeyEvent;

import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    private WebView webView;
    private PowerStateReceiver powerStateReceiver;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);


        setContentView(R.layout.activity_main);

        // Webview configurations and actions
        WebView.setWebContentsDebuggingEnabled(true);

        webView = findViewById(R.id.webview);
        // Add JavaScript Interface
        webView.addJavascriptInterface(new WebAppInterface(this, webView), "Android");

        // Set the background color transparent to fill the dead zone
        webView.setBackgroundColor(Color.TRANSPARENT);

        // To get the screen dimensions dynamically to fit the TV
        webView.getSettings().setUseWideViewPort(true);  // Enable viewport meta tag
        webView.getSettings().setLoadWithOverviewMode(true);  // Ensure content scales properly

        // Getting the webview settings down
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null); //Ensure that hardware acceleration is enabled to improve rendering performance.
        webView.getSettings().setCacheMode(WebSettings.LOAD_DEFAULT);

        WebSettings webSettings = webView.getSettings();
        // Disable geolocation
        webSettings.setGeolocationEnabled(false);

        // Disable form data saving
        webSettings.setSaveFormData(false);

        // Load images asynchronously for better performance
        webSettings.setBlockNetworkImage(false);
        webSettings.setLoadsImagesAutomatically(true);


        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setAllowFileAccess(true);
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        webView.requestFocus();


        // Load the initial URL without query parameters

        webView.loadUrl("file:///android_asset/index.html?debug=true");


        // Initialize and register PowerStateReceiver
        powerStateReceiver = new PowerStateReceiver();
        IntentFilter filter = new IntentFilter();
        filter.addAction(Intent.ACTION_SCREEN_ON);
        filter.addAction(Intent.ACTION_SCREEN_OFF);
        registerReceiver(powerStateReceiver, filter);

        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

    }



// Use this method to send key to the navigation methods in the main.js
   public boolean dispatchKeyEvent(KeyEvent event) {
        Log.d("KeyEvent", "Key Down Event: KeyCode = " + event.getKeyCode());

        switch (event.getKeyCode()) {
            case KeyEvent.KEYCODE_DPAD_RIGHT:
                // Handle right button press
                Log.d("Directional", "Right button pressed");
                return true;

            case KeyEvent.KEYCODE_DPAD_LEFT:
                // Handle left button press
                Log.d("Directional", "Left button pressed");
                return true;

            case KeyEvent.KEYCODE_DPAD_UP:
                // Handle up button press
                Log.d("Directional", "Up button pressed");
                return true;

            case KeyEvent.KEYCODE_DPAD_DOWN:
                // Handle down button press
                Log.d("Directional", "Down button pressed");
                return true;

            case KeyEvent.KEYCODE_BACK:
                // Handle back button press
                Log.d("Back", "Back button pressed");
                return true;

            default:
                return super.dispatchKeyEvent(event);
        }
    }





    @Override
    protected void onResume() {
        super.onResume();

        // Register the power state receiver
        if (powerStateReceiver != null) {
            IntentFilter powerFilter = new IntentFilter();
            powerFilter.addAction(Intent.ACTION_SCREEN_ON);
            powerFilter.addAction(Intent.ACTION_SCREEN_OFF);
            registerReceiver(powerStateReceiver, powerFilter);
        }

    }
    @Override
    protected void onDestroy() {
        super.onDestroy();
        unregisterReceiver(powerStateReceiver);
        Log.d("MainActivity", "onDestroy: Attempted to schedule job and clean up resources");
    }

}

