package app.holymoly;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.widget.FrameLayout;

import java.io.ByteArrayInputStream;
import java.util.HashMap;
import java.util.Map;

/**
 * Shows the game in a WebView.
 *
 * The page is served from a made-up HTTPS address, https://appassets.androidplatform.net/index.html
 * (the host Android reserves for exactly this). Requests to it never reach the network: this class
 * answers them from the installed game file (see GameStore). Using one fixed address matters because the
 * game's save lives in the page's localStorage (key "holymoly1"), which belongs to the page's address.
 * Whether the bundled build or a downloaded update is served, the address and therefore the save stay the same.
 *
 * The page gets no bridge into Android (no addJavascriptInterface) and no network access at all: the game is
 * one self-contained file with its fonts and music embedded, and update downloads happen in Java (Updater).
 */
public class MainActivity extends Activity {
    static final String APP_HOST = "appassets.androidplatform.net";
    static final String GAME_URL = "https://" + APP_HOST + "/index.html";

    /** Limits what the page itself can load or run, as a second line of defence behind the update signature.
     *  No outside host is allowed anywhere, and connect-src 'none' means the page can't send or fetch anything. */
    static final String CONTENT_SECURITY_POLICY =
        "default-src 'self' 'unsafe-inline' data: blob:; "
        + "script-src 'self' 'unsafe-inline'; "
        + "style-src 'self' 'unsafe-inline'; "
        + "font-src data:; "
        + "img-src 'self' data: blob:; media-src data: blob:; "
        + "connect-src 'none'; worker-src 'none'; "
        + "frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'";

    private static final int BACKGROUND = Color.parseColor("#2a1830"); // the game's dark plum page colour

    private WebView web;

    /** Light status-bar and navigation icons, readable on the game's dark background. */
    @SuppressWarnings("deprecation")
    private void useLightSystemBarIcons() {
        if (Build.VERSION.SDK_INT >= 30) {
            WindowInsetsController controller = getWindow().getInsetsController();
            if (controller != null) {
                int light = WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS | WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS;
                controller.setSystemBarsAppearance(0, light); // clear the "light bars" flags: icons stay white
            }
        }
        if (Build.VERSION.SDK_INT < 35) {
            getWindow().setStatusBarColor(BACKGROUND);
            getWindow().setNavigationBarColor(BACKGROUND);
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        web = new WebView(this);
        web.setBackgroundColor(BACKGROUND);
        // Android 15+ draws apps edge to edge, under the status bar and the navigation buttons. The game sits in a
        // frame that is padded by exactly the space those bars (and any camera cut-out) take, so nothing is hidden.
        FrameLayout frame = new FrameLayout(this);
        frame.setBackgroundColor(BACKGROUND);
        frame.addView(web, new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        frame.setOnApplyWindowInsetsListener(new View.OnApplyWindowInsetsListener() {
            @Override public WindowInsets onApplyWindowInsets(View view, WindowInsets insets) {
                if (Build.VERSION.SDK_INT >= 30) {
                    android.graphics.Insets bars = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                    view.setPadding(bars.left, bars.top, bars.right, bars.bottom);
                } else {
                    view.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(),
                        insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
                }
                return insets;
            }
        });
        setContentView(frame);
        useLightSystemBarIcons();

        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);          // the game is JavaScript
        settings.setDomStorageEnabled(true);          // localStorage holds the save ("holymoly1")
        settings.setMediaPlaybackRequiresUserGesture(false); // music can start right after the first tap
        settings.setAllowFileAccess(false);           // the page cannot read files on the phone
        settings.setAllowContentAccess(false);
        settings.setGeolocationEnabled(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setTextZoom(100);                    // the canvas layout is designed for exact sizes
        settings.setSupportZoom(false);
        if (Build.VERSION.SDK_INT >= 26) settings.setSafeBrowsingEnabled(true);
        // No addJavascriptInterface: the page gets no bridge into Android at all.

        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new GameClient());
        web.loadUrl(GAME_URL);
        createdAt = android.os.SystemClock.elapsedRealtime();

        Updater.checkInBackground(this, onUpdate);
    }

    // Auto-update: a newer signed build found within the first 30 seconds (usually still on the title screen) loads
    // straight away; one found later loads the next time the player comes back to the app, so a game in progress is
    // never interrupted. Saves live in localStorage and survive the reload.
    private long createdAt = 0;
    private boolean pendingReload = false;
    private final Runnable onUpdate = new Runnable() {
        @Override public void run() {
            if (web == null) return;
            if (android.os.SystemClock.elapsedRealtime() - createdAt < 30000) reloadForUpdate();
            else pendingReload = true;
        }
    };
    private void reloadForUpdate() {
        pendingReload = false;
        if (web == null) return;
        web.clearCache(false);
        web.loadUrl(GAME_URL);
        android.widget.Toast.makeText(this, "Holy Moly! updated with new games", android.widget.Toast.LENGTH_SHORT).show();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (web != null) web.onResume();
        if (pendingReload) reloadForUpdate();
        Updater.checkInBackground(this, onUpdate); // at most every 10 minutes; see Updater.MIN_CHECK_INTERVAL_MS
    }

    @Override
    protected void onPause() {
        if (web != null) web.onPause(); // the page sees visibilitychange and pauses its music
        super.onPause();
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        moveTaskToBack(true); // keep the game where it was instead of closing it
    }

    @Override
    protected void onDestroy() {
        if (web != null) web.destroy();
        super.onDestroy();
    }

    private class GameClient extends WebViewClient {
        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            Uri url = request.getUrl();
            String host = url.getHost() == null ? "" : url.getHost();
            if ("https".equals(url.getScheme()) && APP_HOST.equals(host)) {
                String path = url.getPath() == null ? "/" : url.getPath();
                if (path.equals("/") || path.equals("/index.html")) {
                    try {
                        Map<String, String> headers = new HashMap<>();
                        headers.put("Content-Security-Policy", CONTENT_SECURITY_POLICY);
                        headers.put("Cache-Control", "no-store");
                        return new WebResourceResponse("text/html", "utf-8", 200, "OK", headers,
                            GameStore.openGame(MainActivity.this));
                    } catch (Exception e) {
                        return blocked(500);
                    }
                }
                return blocked(404);
            }
            if ("data".equals(url.getScheme()) || "blob".equals(url.getScheme())) return null;
            return blocked(403); // everything else, including every outside host, is refused
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            Uri url = request.getUrl();
            if (APP_HOST.equals(url.getHost())) return false;
            // Links to anywhere else open in the phone's browser, never inside the game window.
            if ("https".equals(url.getScheme())) {
                try { startActivity(new Intent(Intent.ACTION_VIEW, url)); } catch (Exception ignored) { }
            }
            return true;
        }
    }

    private static WebResourceResponse blocked(int status) {
        return new WebResourceResponse("text/plain", "utf-8", status, status == 404 ? "Not Found" : "Blocked",
            new HashMap<String, String>(), new ByteArrayInputStream(new byte[0]));
    }
}
