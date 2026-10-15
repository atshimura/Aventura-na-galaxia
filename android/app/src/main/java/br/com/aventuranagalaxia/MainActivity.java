package br.com.aventuranagalaxia;

import android.app.Activity;
import android.annotation.SuppressLint;
import android.content.res.AssetManager;
import android.os.Bundle;
import android.net.Uri;
import android.view.View;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.io.IOException;
import java.io.InputStream;

/** Interface nativa mínima: jogo local, origem HTTPS virtual, sem acesso à rede. */
public final class MainActivity extends Activity {
    private WebView webView;
    private static final String ORIGIN = "appassets.androidplatform.net";

    @SuppressLint("SetJavaScriptEnabled")
    @Override public void onCreate(Bundle bundle) {
        super.onCreate(bundle);
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_FULLSCREEN |
                View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
        webView = new WebView(this);
        webView.setBackgroundColor(0xff081027);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        webView.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (!"https".equals(uri.getScheme()) || !ORIGIN.equals(uri.getHost())) {
                    return new WebResourceResponse("text/plain", "UTF-8", 403, "Proibido", null,
                            new java.io.ByteArrayInputStream(new byte[0]));
                }
                String path = uri.getPath();
                if (path == null || path.equals("/")) path = "/index.html";
                if (path.contains("..")) return null;
                String name = path.substring(1);
                String mime = name.endsWith(".html") ? "text/html" :
                              name.endsWith(".css") ? "text/css" :
                              name.endsWith(".mjs") || name.endsWith(".js") ? "text/javascript" :
                              "application/octet-stream";
                try {
                    InputStream data = getAssets().open(name, AssetManager.ACCESS_STREAMING);
                    return new WebResourceResponse(mime, "UTF-8", data);
                } catch (IOException ex) {
                    return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found", null,
                            new java.io.ByteArrayInputStream(new byte[0]));
                }
            }
        });
        setContentView(webView);
        webView.loadUrl("https://" + ORIGIN + "/index.html");
    }

    @Override public void onBackPressed() {
        if (webView != null) webView.evaluateJavascript(
            "document.dispatchEvent(new KeyboardEvent('keydown', {key:'Escape'}));", null);
        else super.onBackPressed();
    }
    @Override public void onDestroy() {
        if (webView != null) {webView.destroy();webView=null;}
        super.onDestroy();
    }
}
