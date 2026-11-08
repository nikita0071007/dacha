package ru.gusevmade.dacha;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
import android.view.ViewGroup;

public class MainActivity extends Activity {
    private WebView web;
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        web = new WebView(this);
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
        setContentView(web);
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
    @Override protected void onDestroy() {
        if (web != null) { web.destroy(); web = null; }
        super.onDestroy();
    }
}
