package com.jaider.gimnasio;

import android.content.Context;
import android.media.AudioManager;
import android.os.SystemClock;
import android.view.KeyEvent;

/**
 * Funciones nativas nuevas (v8.4.18) a las que la página llega por NativeStore.savePhoto(clave, valor):
 *  - "__media__"      : controla la música que esté sonando en el teléfono (Spotify, YouTube Music…)
 *                       valor: "toggle" | "next" | "prev" | "play" | "pause" | "active" (¿suena algo?)
 *  - "__widget_pin__" : con valor "q:<tipo>" pide a Android fijar un widget de acceso rápido.
 *  - "__pip__" (8.5.0): ventana flotante (picture-in-picture). Valores en Pip.java:
 *                       "supported" | "enter" | "enter:9:16" | "auto:1" | "auto:0" | "active".
 */
public final class Ext2 {
    private Ext2() { }

    public static boolean handles(String key, String value) {
        if ("__media__".equals(key) || "__pip__".equals(key)) return true;
        return "__widget_pin__".equals(key) && value != null && value.startsWith("q:");
    }

    public static boolean hook(Context ctx, String key, String value) {
        try {
            if ("__media__".equals(key)) return media(ctx, value);
            if ("__pip__".equals(key)) return Pip.handle(ctx, value);
            if ("__widget_pin__".equals(key)) return QuickWidget.requestPin(ctx, value.substring(2));
        } catch (Throwable ignored) { }
        return false;
    }

    static boolean media(Context ctx, String what) {
        AudioManager am = (AudioManager) ctx.getSystemService(Context.AUDIO_SERVICE);
        if (am == null) return false;
        if ("active".equals(what)) return am.isMusicActive();
        int code;
        if ("next".equals(what)) code = KeyEvent.KEYCODE_MEDIA_NEXT;
        else if ("prev".equals(what)) code = KeyEvent.KEYCODE_MEDIA_PREVIOUS;
        else if ("play".equals(what)) code = KeyEvent.KEYCODE_MEDIA_PLAY;
        else if ("pause".equals(what)) code = KeyEvent.KEYCODE_MEDIA_PAUSE;
        else code = KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE;
        long t = SystemClock.uptimeMillis();
        am.dispatchMediaKeyEvent(new KeyEvent(t, t, KeyEvent.ACTION_DOWN, code, 0));
        am.dispatchMediaKeyEvent(new KeyEvent(t, t, KeyEvent.ACTION_UP, code, 0));
        return true;
    }
}
