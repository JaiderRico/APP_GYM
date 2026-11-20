package com.jaider.gimnasio;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.SharedPreferences;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;

import java.util.Locale;

/**
 * (8.6.19) Al terminar el descanso, lee en voz alta la siguiente serie (ejercicio, carga y objetivo de reps).
 * La página guarda el texto con NativeStore.savePhoto('__speak__', valor) (Ext2 lo enruta):
 *   "set:<texto>"  -> texto que se dirá cuando suene la alarma del descanso ("set:" vacío = nada)
 *   "test:<texto>" -> lo dice ya (botón Probar)
 *   "on:1|on:0"    -> activar / desactivar
 *   "ok"           -> ¿existe esta función?
 * Ganchos en smali (classes3, RestAlarm): onReceive llama hold(this) antes de deliver y release() después
 * (goAsync mantiene el teléfono despierto mientras habla); deliver llama due(ctx) cuando de verdad termina el descanso
 * (también cuando la página llama finishRest con la app abierta).
 * Usa audio de "guía" y pide foco transitorio con atenuación: la música baja mientras habla y sigue después.
 */
public final class Speak {
    private Speak() { }

    private static final String PREFS = "mp_speak";
    private static BroadcastReceiver.PendingResult sPending = null;
    private static boolean sStarted = false;
    private static TextToSpeech sTts = null;
    private static final Handler H = new Handler(Looper.getMainLooper());

    public static boolean handles(String key) { return "__speak__".equals(key); }

    public static boolean hook(Context ctx, String value) {
        String v = value == null ? "" : value;
        SharedPreferences p = ctx.getSharedPreferences(PREFS, 0);
        if ("ok".equals(v)) return true;
        if (v.startsWith("set:")) { p.edit().putString("text", v.substring(4)).apply(); return true; }
        if (v.startsWith("on:")) { p.edit().putBoolean("on", v.endsWith("1")).apply(); return true; }
        if (v.startsWith("test:")) { say(ctx.getApplicationContext(), v.substring(5), 0); return true; }
        return false;
    }

    /** Desde RestAlarm.onReceive, antes de deliver. */
    public static void hold(BroadcastReceiver r) {
        try { sStarted = false; sPending = r.goAsync(); } catch (Throwable t) { sPending = null; }
    }

    /** Desde RestAlarm.onReceive, después de deliver: si no habló, suelta el broadcast. */
    public static void release() {
        if (!sStarted) finishPending();
    }

    /** Desde RestAlarm.deliver, cuando el descanso terminó de verdad. */
    public static void due(Context ctx) {
        try {
            SharedPreferences p = ctx.getSharedPreferences(PREFS, 0);
            if (!p.getBoolean("on", true)) return;
            String text = p.getString("text", "");
            if (text == null || text.trim().length() == 0) return;
            p.edit().putString("text", "").apply(); // una sola vez por descanso
            sStarted = true;
            say(ctx.getApplicationContext(), text, 1600); // deja sonar primero la alarma
        } catch (Throwable ignored) { }
    }

    private static void finishPending() {
        BroadcastReceiver.PendingResult pr = sPending;
        sPending = null;
        if (pr != null) { try { pr.finish(); } catch (Throwable ignored) { } }
    }

    private static void say(final Context app, final String text, final long delay) {
        final AudioManager am = (AudioManager) app.getSystemService(Context.AUDIO_SERVICE);
        final AudioManager.OnAudioFocusChangeListener fl = new AudioManager.OnAudioFocusChangeListener() {
            @Override public void onAudioFocusChange(int focusChange) { }
        };
        final Runnable done = new Runnable() {
            @Override public void run() {
                try { if (am != null) am.abandonAudioFocus(fl); } catch (Throwable ignored) { }
                try { if (sTts != null) { sTts.shutdown(); sTts = null; } } catch (Throwable ignored) { }
                finishPending();
            }
        };
        H.postDelayed(done, 9000); // límite de goAsync (~10 s)
        H.post(new Runnable() {
            @Override public void run() {
                try { if (sTts != null) sTts.shutdown(); } catch (Throwable ignored) { }
                final long t0 = System.currentTimeMillis();
                sTts = new TextToSpeech(app, new TextToSpeech.OnInitListener() {
                    @Override public void onInit(int status) {
                        if (status != TextToSpeech.SUCCESS || sTts == null) { H.removeCallbacks(done); done.run(); return; }
                        final TextToSpeech t = sTts;
                        try {
                            int r = t.setLanguage(new Locale("es", "CO"));
                            if (r < 0) t.setLanguage(new Locale("es"));
                        } catch (Throwable ignored) { }
                        try {
                            t.setAudioAttributes(new AudioAttributes.Builder()
                                    .setUsage(AudioAttributes.USAGE_ASSISTANCE_NAVIGATION_GUIDANCE)
                                    .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build());
                        } catch (Throwable ignored) { }
                        t.setSpeechRate(0.95f);
                        t.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                            @Override public void onStart(String id) { }
                            @Override public void onDone(String id) { H.removeCallbacks(done); H.postDelayed(done, 300); }
                            @Override public void onError(String id) { H.removeCallbacks(done); H.post(done); }
                        });
                        long wait = Math.max(0, delay - (System.currentTimeMillis() - t0));
                        H.postDelayed(new Runnable() {
                            @Override public void run() {
                                try {
                                    if (am != null) am.requestAudioFocus(fl, AudioManager.STREAM_MUSIC,
                                            AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK);
                                } catch (Throwable ignored) { }
                                Bundle b = new Bundle();
                                try { t.speak(text, TextToSpeech.QUEUE_FLUSH, b, "mp_rest"); }
                                catch (Throwable e) { H.removeCallbacks(done); H.post(done); }
                            }
                        }, wait);
                    }
                });
            }
        });
    }
}
