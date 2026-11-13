package ru.gusevmade.dacha;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
import android.view.ViewGroup;
import android.view.View;
import android.view.WindowInsets;
import android.os.Build;
import android.widget.FrameLayout;

public class MainActivity extends Activity {
    private WebView web;
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        // An inset-aware root keeps the WebView away from Android status/navigation bars.
        // Android 15 / target 35 can enforce edge-to-edge, so apply real system insets.
        FrameLayout root = new FrameLayout(this);
        root.setClipToPadding(false);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            getWindow().setDecorFitsSystemWindows(false);
            root.setOnApplyWindowInsetsListener((v, insets) -> {
                android.graphics.Insets safe = insets.getInsets(
                    WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                root.setPadding(safe.left, safe.top, safe.right, safe.bottom);
                return insets;
            });
        }
        web = new WebView(this);
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        web.setLayoutParams(new ViewGroup.LayoutParams(-1, -1));
        web.setWebViewClient(new WebViewClient());
        web.setWebChromeClient(new WebChromeClient());
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setMediaPlaybackRequiresUserGesture(true);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        root.addView(web);
        setContentView(root);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) root.requestApplyInsets();
        web.loadUrl("file:///android_asset/index.html");
    }
    @Override public void onBackPressed() {
        if (web == null) { super.onBackPressed(); return; }
        // A WebView game has no browser history for its internal scenes.
        // Keep Android Back consistent with the in-game navigation.
        web.evaluateJavascript(
            "(function(){try{" +
            "var modal=document.getElementById('modal');" +
            "if(modal&&!modal.hidden){" +
            "var sheet=document.getElementById('sheet');" +
            "if(sheet&&sheet.dataset.closable==='0')return 'handled';" +
            "if(typeof closeModal==='function')closeModal();" +
            "return 'handled';}" +
            "var game=document.getElementById('game');" +
            "if(game&&!game.hidden&&typeof goHome==='function'){goHome();return 'handled';}" +
            "return 'exit';}catch(e){return 'exit';}})()",
            result -> {
                if (!"\"handled\"".equals(result)) {
                    if (web != null && web.canGoBack()) web.goBack();
                    else MainActivity.super.onBackPressed();
                }
            }
        );
    }
    @Override protected void onPause() {
        if (web != null) web.onPause();
        super.onPause();
    }
    @Override protected void onResume() {
        super.onResume();
        if (web != null) web.onResume();
    }
    @Override protected void onDestroy() {
        if (web != null) {
            web.stopLoading();
            web.loadUrl("about:blank");
            web.destroy();
            web = null;
        }
        super.onDestroy();
    }
}
