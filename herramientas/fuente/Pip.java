package com.jaider.gimnasio;

import android.app.Activity;
import android.content.Context;
import android.os.Build;
import android.util.Rational;

/**
 * Ventana flotante (picture-in-picture), v8.5.0. La página llega aquí con
 * NativeStore.savePhoto('__pip__', valor):
 *   "supported"      -> ¿el teléfono permite ventana flotante?
 *   "enter[:w:h]"    -> abre la app en ventana flotante (proporción opcional, por defecto 9:16)
 *   "auto:1|auto:0"  -> Android 12+: al salir con el botón de inicio entra sola en ventana flotante
 *   "active"         -> ¿está ahora en ventana flotante?
 * Se usa reflexión para no depender de la versión del SDK con que se compile (minSdk 26).
 * El manifiesto de MainActivity tiene supportsPictureInPicture, resizeableActivity y configChanges
 * (así la página no se recarga al entrar o salir de la ventana).
 */
final class Pip {
    private Pip() { }

    static boolean handle(Context ctx, String value) {
        String v = value == null ? "" : value;
        if ("supported".equals(v)) return supported(ctx);
        if (!(ctx instanceof Activity)) return false;
        final Activity a = (Activity) ctx;
        if ("active".equals(v)) return active(a);
        if (!supported(ctx)) return false;
        if (v.startsWith("auto:")) return auto(a, v.endsWith("1"));
        if (v.startsWith("enter")) {
            int w = 9, h = 16;
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

    private static Object params(int w, int h, Boolean autoEnter) throws Exception {
        Class<?> b = Class.forName("android.app.PictureInPictureParams$Builder");
        Object builder = b.getConstructor().newInstance();
        // Android exige una proporción entre 1:2.39 y 2.39:1
        float r = (float) w / (float) Math.max(1, h);
        if (r < 0.42f) { w = 42; h = 100; } else if (r > 2.39f) { w = 239; h = 100; }
        b.getMethod("setAspectRatio", Rational.class).invoke(builder, new Rational(w, h));
        if (autoEnter != null && Build.VERSION.SDK_INT >= 31) {
            try { b.getMethod("setAutoEnterEnabled", boolean.class).invoke(builder, autoEnter.booleanValue()); }
            catch (Throwable ignored) { }
            try { b.getMethod("setSeamlessResizeEnabled", boolean.class).invoke(builder, false); }
            catch (Throwable ignored) { }
        }
        return b.getMethod("build").invoke(builder);
    }

    static void enter(Activity a, int w, int h) {
        try {
            Class<?> pc = Class.forName("android.app.PictureInPictureParams");
            Activity.class.getMethod("enterPictureInPictureMode", pc).invoke(a, params(w, h, null));
        } catch (Throwable t) {
            try { Activity.class.getMethod("enterPictureInPictureMode").invoke(a); } catch (Throwable ignored) { }
        }
    }

    static boolean auto(final Activity a, final boolean on) {
        if (Build.VERSION.SDK_INT < 31) return false;
        a.runOnUiThread(new Runnable() {
            @Override public void run() {
                try {
                    Class<?> pc = Class.forName("android.app.PictureInPictureParams");
                    Activity.class.getMethod("setPictureInPictureParams", pc).invoke(a, params(9, 16, on));
                } catch (Throwable ignored) { }
            }
        });
        return true;
    }
}
