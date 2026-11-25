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
 * (8.6.20) Cuando habla, el aviso del fin del descanso sale sin sonido (channelId): solo vibración y voz.
 * Usa audio de "guía" y pide foco transitorio con atenuación: la música baja mientras habla y sigue después.
 * (8.6.29) El foco se pide con AudioFocusRequest (API 26+) y ~0,45 s antes de hablar, para que la música sí baje.
 */
public final class Speak {
    private Speak() { }

    private static final String PREFS = "mp_speak";
    private static BroadcastReceiver.PendingResult sPending = null;
    private static boolean sStarted = false;
    private static TextToSpeech sTts = null;
    private static boolean sVoice = false; // (8.6.20) el aviso de este descanso va sin sonido: solo la voz
    static final String LOUD = "rest_finished_loud_v711", QUIET = "rest_voice_v8620";
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
            sVoice = true;
            say(ctx.getApplicationContext(), text, 250); // 8.6.20: sin alarma, la voz arranca de una
        } catch (Throwable ignored) { }
    }

    /**
     * (8.6.20) Desde RestAlarm.deliver, en vez del texto fijo del canal: si la voz va a hablar, el aviso sale por un
     * canal sin sonido (solo vibra), para que la alarma no tape la voz.
     */
    public static String channelId(Context ctx) {
        if (!sVoice) return LOUD;
        sVoice = false;
        try {
            // NotificationChannel es API 26: por reflexión (se compila contra android-23).
            Object nm = ctx.getSystemService(Context.NOTIFICATION_SERVICE);
            Class<?> nmc = nm.getClass();
            Class<?> chc = Class.forName("android.app.NotificationChannel");
            if (nmc.getMethod("getNotificationChannel", String.class).invoke(nm, QUIET) == null) {
                Object ch = chc.getConstructor(String.class, CharSequence.class, int.class)
                        .newInstance(QUIET, "Fin del descanso (con voz)", 4); // IMPORTANCE_HIGH
                chc.getMethod("setSound", android.net.Uri.class, AudioAttributes.class).invoke(ch, null, null);
                chc.getMethod("enableVibration", boolean.class).invoke(ch, true);
                chc.getMethod("setVibrationPattern", long[].class).invoke(ch, (Object) new long[]{0, 250, 120, 250});
                chc.getMethod("setDescription", String.class).invoke(ch, "Aviso sin sonido cuando la app dice la siguiente serie en voz alta");
                nmc.getMethod("createNotificationChannel", chc).invoke(nm, ch);
            }
            return QUIET;
        } catch (Throwable t) { return LOUD; }
    }

    private static void finishPending() {
        BroadcastReceiver.PendingResult pr = sPending;
        sPending = null;
        if (pr != null) { try { pr.finish(); } catch (Throwable ignored) { } }
    }

    /** (8.6.20) Si la voz falla (sin motor o sin español), suena la alarma de siempre para no quedar en silencio. */
    private static void fallbackAlarm(Context app) {
        try {
            android.net.Uri u = android.net.Uri.parse("android.resource://" + app.getPackageName() + "/raw/rest_alarm");
            final android.media.MediaPlayer mp = new android.media.MediaPlayer();
            mp.setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build());
            mp.setDataSource(app, u);
            mp.setOnCompletionListener(new android.media.MediaPlayer.OnCompletionListener() {
                @Override public void onCompletion(android.media.MediaPlayer m) { try { m.release(); } catch (Throwable ignored) { } }
            });
            mp.prepare();
            mp.start();
        } catch (Throwable ignored) { }
    }

    /** (8.6.29) Tiempo entre pedir que baje la música y empezar a hablar (la atenuación tarda unos ms). */
    private static final long DUCK_LEAD_MS = 450;
    private static Object sFocusReq = null; // AudioFocusRequest (API 26+), guardado para soltarlo después

    /**
     * (8.6.29) Pide foco "transitorio con atenuación" con la API moderna (AudioFocusRequest, API 26+) y los mismos
     * atributos de la voz (guía de navegación / habla), como hacen las apps de mapas: así Android y las apps de música
     * (Spotify, YouTube Music…) bajan el volumen mientras habla. La API vieja (por STREAM_MUSIC) la ignoran varias apps.
     * Se usa por reflexión porque se compila contra android-23. Si falla, usa la forma vieja.
     */
    private static void requestDuck(AudioManager am, AudioManager.OnAudioFocusChangeListener fl) {
        if (am == null) return;
        sFocusReq = null;
        if (android.os.Build.VERSION.SDK_INT >= 26) {
            try {
                AudioAttributes aa = new AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ASSISTANCE_NAVIGATION_GUIDANCE)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build();
                Class<?> bc = Class.forName("android.media.AudioFocusRequest$Builder");
                Object b = bc.getConstructor(int.class).newInstance(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK);
                bc.getMethod("setAudioAttributes", AudioAttributes.class).invoke(b, aa);
                bc.getMethod("setOnAudioFocusChangeListener", AudioManager.OnAudioFocusChangeListener.class, Handler.class).invoke(b, fl, H);
                Object req = bc.getMethod("build").invoke(b);
                Class<?> rc = Class.forName("android.media.AudioFocusRequest");
                am.getClass().getMethod("requestAudioFocus", rc).invoke(am, req);
                sFocusReq = req;
                return;
            } catch (Throwable ignored) { sFocusReq = null; }
        }
        try { am.requestAudioFocus(fl, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK); }
        catch (Throwable ignored) { }
    }

    private static void abandonFocus(AudioManager am, AudioManager.OnAudioFocusChangeListener fl) {
        if (am == null) return;
        Object req = sFocusReq;
        sFocusReq = null;
        if (req != null) {
            try {
                Class<?> rc = Class.forName("android.media.AudioFocusRequest");
                am.getClass().getMethod("abandonAudioFocusRequest", rc).invoke(am, req);
                return;
            } catch (Throwable ignored) { }
        }
        try { am.abandonAudioFocus(fl); } catch (Throwable ignored) { }
    }

    private static void say(final Context app, final String text, final long delay) {
        final AudioManager am = (AudioManager) app.getSystemService(Context.AUDIO_SERVICE);
        final AudioManager.OnAudioFocusChangeListener fl = new AudioManager.OnAudioFocusChangeListener() {
            @Override public void onAudioFocusChange(int focusChange) { }
        };
        final Runnable done = new Runnable() {
            @Override public void run() {
                abandonFocus(am, fl);
                try { if (sTts != null) { sTts.shutdown(); sTts = null; } } catch (Throwable ignored) { }
                finishPending();
            }
        };
        // 8.6.21: antes 9 s y se cortaba el final (el RIR) cuando el motor de voz tardaba en arrancar. La alarma del
        // descanso es un broadcast de fondo (goAsync aguanta ~60 s); se suelta antes, apenas termina de hablar (onDone).
        H.postDelayed(done, 30000);
        H.post(new Runnable() {
            @Override public void run() {
                try { if (sTts != null) sTts.shutdown(); } catch (Throwable ignored) { }
                final long t0 = System.currentTimeMillis();
                sTts = new TextToSpeech(app, new TextToSpeech.OnInitListener() {
                    @Override public void onInit(int status) {
                        if (status != TextToSpeech.SUCCESS || sTts == null) { fallbackAlarm(app); H.removeCallbacks(done); H.postDelayed(done, 4000); return; }
                        final TextToSpeech t = sTts;
                        try {
                            int r = t.setLanguage(new Locale("es", "CO"));
                            if (r < 0) r = t.setLanguage(new Locale("es"));
                            if (r < 0) { fallbackAlarm(app); H.removeCallbacks(done); H.postDelayed(done, 4000); return; }
                        } catch (Throwable ignored) { }
                        try {
                            t.setAudioAttributes(new AudioAttributes.Builder()
                                    .setUsage(AudioAttributes.USAGE_ASSISTANCE_NAVIGATION_GUIDANCE)
                                    .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build());
                        } catch (Throwable ignored) { }
                        t.setSpeechRate(1.0f);
                        t.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                            @Override public void onStart(String id) { }
                            @Override public void onDone(String id) { H.removeCallbacks(done); H.postDelayed(done, 600); }
                            @Override public void onError(String id) { fallbackAlarm(app); H.removeCallbacks(done); H.postDelayed(done, 4000); }
                        });
                        long wait = Math.max(0, delay - (System.currentTimeMillis() - t0));
                        H.postDelayed(new Runnable() {
                            @Override public void run() {
                                // 8.6.29: pide que la música baje y espera un momento a que alcance a bajar antes de hablar.
                                requestDuck(am, fl);
                                H.postDelayed(new Runnable() {
                                    @Override public void run() {
                                        Bundle b = new Bundle();
                                        try { t.speak(text, TextToSpeech.QUEUE_FLUSH, b, "mp_rest"); }
                                        catch (Throwable e) { H.removeCallbacks(done); H.post(done); }
                                    }
                                }, DUCK_LEAD_MS);
                            }
                        }, wait);
                    }
                });
            }
        });
    }
}
