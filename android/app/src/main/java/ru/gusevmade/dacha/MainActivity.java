package ru.gusevmade.dacha;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/** Оболочка: показывает игру из assets/index.html и даёт ей мост window.AndroidAds. */
public class MainActivity extends Activity {

    /**
     * false — рекламная сеть ещё не подключена: мост сразу «засчитывает» просмотр,
     * чтобы награды в игре работали. Когда подключим рекламу (Яндекс/VK) — поставить true
     * и показывать настоящие ролики в AdsBridge.
     */
    static final boolean ADS_ENABLED = false;

    private WebView web;

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        web = new WebView(this);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(true);
        s.setAllowFileAccessFromFileURLs(false);
        s.setAllowUniversalAccessFromFileURLs(false);

        web.setWebViewClient(new WebViewClient());
        web.addJavascriptInterface(new AdsBridge(), "AndroidAds");
        web.loadUrl("file:///android_asset/index.html");
    }

    private void toJs(final String js) {
        runOnUiThread(() -> web.evaluateJavascript(js, null));
    }

    /** Мост для игры: см. PLATFORM в index.html (showRewarded / showInterstitial). */
    class AdsBridge {
        @JavascriptInterface
        public void showRewarded() {
            // TODO(монетизация): при ADS_ENABLED показать ролик за награду и вернуть true только после просмотра.
            toJs("window.onNativeAd('rewarded', true)");
        }

        @JavascriptInterface
        public void showInterstitial() {
            // TODO(монетизация): при ADS_ENABLED показать рекламу между уровнями.
            toJs("window.onNativeAd('interstitial', true)");
        }
    }

    @Override
    protected void onPause() { super.onPause(); web.onPause(); }

    @Override
    protected void onResume() { super.onResume(); web.onResume(); hideBars(); }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideBars();
    }

    @SuppressWarnings("deprecation")
    private void hideBars() {
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
    }

    @Override
    public void onBackPressed() {
        // Не закрываем игру случайно по «Назад»; выход — кнопкой Home.
        web.evaluateJavascript("(function(){var m=document.getElementById('modal');if(m&&!m.hidden){closeModal();return 1}return 0})()",
                v -> { if ("0".equals(v)) moveTaskToBack(true); });
    }
}
