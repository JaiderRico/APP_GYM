package com.jaider.gimnasio;

import android.app.Activity;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Typeface;
import android.graphics.drawable.Icon;
import android.os.Build;
import android.util.Rational;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebView;

import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.List;

/**
 * Ventana flotante (picture-in-picture), v8.5.0. La página llega aquí con
 * NativeStore.savePhoto('__pip__', valor):
 *   "supported"      -> ¿el teléfono permite ventana flotante?
 *   "enter[:w:h]"    -> abre la app en ventana flotante (proporción opcional, por defecto 9:16)
 *   "auto:1|auto:0"  -> Android 12+: al salir con el botón de inicio entra sola en ventana flotante
 *   "auto:w:h:1|0"   -> (8.5.15) igual, con la forma elegida en Ajustes (9:16, 3:4, 1:1, 16:9)
 *   "active"         -> ¿está ahora en ventana flotante?
 *   "act:..."        -> (8.6.18) botones de la ventana (los que salen al tocarla). Hasta 3, separados por '|',
 *                       cada uno "id~texto grande~texto pequeño" (p. ej. "r8~8~reps", "i0~0~RIR").
 *                       "act:" vacío los quita. Al tocar uno se llama en la página v8618PipTap('id').
 *   "acts"           -> (8.6.18) ¿entiende "act:"? (y cuántos botones caben)
 * Android no deja tocar el contenido de la ventana flotante: por eso los botones son RemoteAction.
 * Se usa reflexión para no depender de la versión del SDK con que se compile (minSdk 26).
 * El manifiesto de MainActivity tiene supportsPictureInPicture, resizeableActivity y configChanges
 * (así la página no se recarga al entrar o salir de la ventana).
 */
final class Pip {
    private Pip() { }

    static final String ACTION = "com.jaider.gimnasio.PIP_ACT";
    // Estado que se reenvía cada vez que cambian los parámetros (si no, Android los pierde).
    private static int sW = 9, sH = 16;
    private static Boolean sAuto = null;
    private static String sActs = "";
    private static WeakReference<Activity> sAct = new WeakReference<Activity>(null);
    private static BroadcastReceiver sRecv = null;

    static boolean handle(Context ctx, String value) {
        String v = value == null ? "" : value;
        if ("supported".equals(v)) return supported(ctx);
        if (!(ctx instanceof Activity)) return false;
        final Activity a = (Activity) ctx;
        sAct = new WeakReference<Activity>(a);
        if ("active".equals(v)) return active(a);
        if (!supported(ctx)) return false;
        if ("acts".equals(v)) return true;
        if (v.startsWith("act:")) {
            sActs = v.substring(4);
            ensureReceiver(a);
            apply(a);
            return true;
        }
        if (v.startsWith("auto:")) {
            String[] p = v.split(":");
            int w = 9, h = 16;
            if (p.length == 4) {
                try { w = Integer.parseInt(p[1]); h = Integer.parseInt(p[2]); } catch (Throwable ignored) { }
            }
            return auto(a, v.endsWith("1"), w, h);
        }
        if (v.startsWith("enter")) {
            int w = sW, h = sH;
            String[] p = v.split(":");
            if (p.length == 3) {
                try { w = Integer.parseInt(p[1]); h = Integer.parseInt(p[2]); } catch (Throwable ignored) { }
            }
            final int fw = w, fh = h;
            a.runOnUiThread(new Runnable() {
                @Override public void run() { enter(a, fw, fh); }
            });
            return true;
        }
        return false;
    }

    static boolean supported(Context ctx) {
        if (Build.VERSION.SDK_INT < 26) return false;
        try { return ctx.getPackageManager().hasSystemFeature("android.software.picture_in_picture"); }
        catch (Throwable t) { return false; }
    }

    static boolean active(Activity a) {
        try { return (Boolean) Activity.class.getMethod("isInPictureInPictureMode").invoke(a); }
        catch (Throwable t) { return false; }
    }

    private static Object params(Context ctx, int w, int h) throws Exception {
        Class<?> b = Class.forName("android.app.PictureInPictureParams$Builder");
        Object builder = b.getConstructor().newInstance();
        // Android exige una proporción entre 1:2.39 y 2.39:1
        float r = (float) w / (float) Math.max(1, h);
        if (r < 0.42f) { w = 42; h = 100; } else if (r > 2.39f) { w = 239; h = 100; }
        b.getMethod("setAspectRatio", Rational.class).invoke(builder, new Rational(w, h));
        if (sAuto != null && Build.VERSION.SDK_INT >= 31) {
            try { b.getMethod("setAutoEnterEnabled", boolean.class).invoke(builder, sAuto.booleanValue()); }
            catch (Throwable ignored) { }
            try { b.getMethod("setSeamlessResizeEnabled", boolean.class).invoke(builder, false); }
            catch (Throwable ignored) { }
        }
        try { b.getMethod("setActions", List.class).invoke(builder, actions(ctx)); }
        catch (Throwable ignored) { }
        return b.getMethod("build").invoke(builder);
    }

    static void enter(Activity a, int w, int h) {
        sW = w; sH = h;
        try {
            Class<?> pc = Class.forName("android.app.PictureInPictureParams");
            Activity.class.getMethod("enterPictureInPictureMode", pc).invoke(a, params(a, w, h));
        } catch (Throwable t) {
            try { Activity.class.getMethod("enterPictureInPictureMode").invoke(a); } catch (Throwable ignored) { }
        }
    }

    static boolean auto(final Activity a, final boolean on, final int w, final int h) {
        sW = w; sH = h;
        if (Build.VERSION.SDK_INT < 31) { apply(a); return false; }
        sAuto = Boolean.valueOf(on);
        apply(a);
        return true;
    }

    /** Reenvía forma, auto-entrar y botones (vale tanto dentro como fuera de la ventana). */
    static void apply(final Activity a) {
        a.runOnUiThread(new Runnable() {
            @Override public void run() {
                try {
                    Class<?> pc = Class.forName("android.app.PictureInPictureParams");
                    Activity.class.getMethod("setPictureInPictureParams", pc).invoke(a, params(a, sW, sH));
                } catch (Throwable ignored) { }
            }
        });
    }

    private static List<Object> actions(Context ctx) {
        List<Object> out = new ArrayList<Object>();
        if (sActs == null || sActs.length() == 0) return out;
        int max = 3;
        try {
            Object n = Activity.class.getMethod("getMaxNumPictureInPictureActions").invoke(ctx);
            if (n instanceof Integer && ((Integer) n).intValue() > 0) max = ((Integer) n).intValue();
        } catch (Throwable ignored) { }
        String[] items = sActs.split("\\|");
        Context app = ctx.getApplicationContext();
        for (int i = 0; i < items.length && out.size() < max; i++) {
            String[] p = items[i].split("~", -1);
            if (p.length < 2 || p[0].length() == 0) continue;
            String id = p[0], big = p[1], small = p.length > 2 ? p[2] : "";
            try {
                Intent in = new Intent(ACTION).setPackage(app.getPackageName()).putExtra("v", id);
                int flags = PendingIntent.FLAG_UPDATE_CURRENT | 0x04000000; // FLAG_IMMUTABLE
                PendingIntent pi = PendingIntent.getBroadcast(app, 7180 + i, in, flags);
                Icon icon = Icon.createWithBitmap(drawIcon(big, small));
                String title = (big + " " + small).trim();
                Class<?> ra = Class.forName("android.app.RemoteAction");
                Object action = ra.getConstructor(Icon.class, CharSequence.class, CharSequence.class, PendingIntent.class)
                        .newInstance(icon, title, title, pi);
                out.add(action);
            } catch (Throwable ignored) { }
        }
        return out;
    }

    /** Ícono con el número grande y una palabra pequeña encima (el sistema solo muestra íconos). */
    private static Bitmap drawIcon(String big, String small) {
        int s = 144;
        Bitmap bmp = Bitmap.createBitmap(s, s, Bitmap.Config.ARGB_8888);
        Canvas c = new Canvas(bmp);
        Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
        p.setColor(Color.WHITE);
        p.setTextAlign(Paint.Align.CENTER);
        p.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.BOLD));
        boolean hasSmall = small != null && small.length() > 0;
        float bigSize = big.length() <= 2 ? (hasSmall ? 92f : 108f) : (big.length() == 3 ? 70f : 52f);
        if (hasSmall) {
            p.setTextSize(36f);
            c.drawText(small, s / 2f, 38f, p);
        }
        p.setTextSize(bigSize);
        Paint.FontMetrics fm = p.getFontMetrics();
        float top = hasSmall ? 46f : 0f;
        float cy = top + (s - top) / 2f - (fm.ascent + fm.descent) / 2f;
        c.drawText(big, s / 2f, cy, p);
        return bmp;
    }

    private static void ensureReceiver(Activity a) {
        if (sRecv != null) return;
        sRecv = new BroadcastReceiver() {
            @Override public void onReceive(Context context, Intent intent) {
                String id = intent == null ? null : intent.getStringExtra("v");
                if (id == null || !id.matches("[A-Za-z0-9_]{1,16}")) return;
                Activity act = sAct.get();
                if (act == null) return;
                WebView wv = findWebView(act.getWindow().getDecorView());
                if (wv == null) return;
                try { wv.evaluateJavascript("window.v8618PipTap&&v8618PipTap('" + id + "')", null); }
                catch (Throwable ignored) { }
            }
        };
        Context app = a.getApplicationContext();
        IntentFilter f = new IntentFilter(ACTION);
        try {
            if (Build.VERSION.SDK_INT >= 33) {
                Context.class.getMethod("registerReceiver", BroadcastReceiver.class, IntentFilter.class, int.class)
                        .invoke(app, sRecv, f, 4); // RECEIVER_NOT_EXPORTED
            } else {
                app.registerReceiver(sRecv, f);
            }
        } catch (Throwable t) {
            sRecv = null;
        }
    }

    private static WebView findWebView(View v) {
        if (v instanceof WebView) return (WebView) v;
        if (v instanceof ViewGroup) {
            ViewGroup g = (ViewGroup) v;
            for (int i = 0; i < g.getChildCount(); i++) {
                WebView w = findWebView(g.getChildAt(i));
                if (w != null) return w;
            }
        }
        return null;
    }
}
