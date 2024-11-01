package com.example.nevotv;

import android.content.Context;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

// For future use add the methods in the Webview App to implement
public class WebAppInterface {
    private Context mContext;
    WebView mWebView;

    WebAppInterface(Context context, WebView webView) {
        mContext = context;
        mWebView = webView;
    }
    // For future use
    @JavascriptInterface
    public void volumeUp() {
        // Handle volume up action if needed in WebView
    }
    // For future use
    @JavascriptInterface
    public void volumeDown() {
        // Handle volume down action if needed in WebView
    }

    // For future use
    @JavascriptInterface
    public void handleKeyEvent(String keyName) {
        // Call the JavaScript function to handle the key event
        mWebView.post(() -> mWebView.evaluateJavascript("vm.handleKeydown({ keyCode: '" + keyName + "' });", null));
    }
}
