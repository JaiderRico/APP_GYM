package com.jaider.gimnasio;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.SharedPreferences;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Notificaciones aunque la app esté cerrada.
 * La app registra un recordatorio con id "poll_*" y un objeto "poll" {url, body}.
 * Cada vez que la alarma suena, se consulta el Apps Script (acción pending_notifications)
 * y se muestra una notificación por cada novedad que no se haya mostrado antes.
 */
public class MsgPoll implements Runnable {
    static final String PREFS = "mp_poll_v1";

    private final Context ctx;
    private final JSONObject poll;
    private final BroadcastReceiver.PendingResult pending;

    private MsgPoll(Context ctx, JSONObject poll, BroadcastReceiver.PendingResult pending) {
        this.ctx = ctx;
        this.poll = poll;
        this.pending = pending;
    }

    /** Devuelve true si el recordatorio era de consulta (y ya se encargó de él). */
    public static boolean handle(BroadcastReceiver receiver, Context ctx, String rid) {
        if (rid == null || !rid.startsWith("poll_")) return false;
        JSONObject poll = null;
        try {
            JSONArray all = Reminders.load(ctx);
            for (int i = 0; i < all.length(); i++) {
                JSONObject r = all.optJSONObject(i);
                if (r == null || !rid.equals(r.optString("id"))) continue;
                poll = r.optJSONObject("poll");
                long now = System.currentTimeMillis();
                if (r.optLong("repeat", 0) > 0) r.put("at", Reminders.nextAt(r, now + 60000L));
                break;
            }
            Reminders.store(ctx, all);
            Reminders.scheduleAll(ctx, false);
        } catch (Throwable ignored) { }
        if (poll == null) return true;
        BroadcastReceiver.PendingResult pr = null;
        try { pr = receiver.goAsync(); } catch (Throwable ignored) { }
        new Thread(new MsgPoll(ctx.getApplicationContext(), poll, pr)).start();
        return true;
    }

    @Override
    public void run() {
        try {
            String url = poll.optString("url", "");
            String body = poll.optString("body", "");
            if (url.length() == 0 || body.length() == 0) return;
            JSONObject res = new JSONObject(post(url, body));
            if (!res.optBoolean("ok")) return;
            JSONArray items = res.optJSONArray("items");
            if (items == null) return;

            SharedPreferences sp = ctx.getSharedPreferences(PREFS, 0);
            JSONArray seen;
            try { seen = new JSONArray(sp.getString("seen", "[]")); } catch (Throwable t) { seen = new JSONArray(); }
            boolean changed = false;
            for (int i = 0; i < items.length(); i++) {
                JSONObject it = items.optJSONObject(i);
                if (it == null) continue;
                String id = it.optString("id", "");
                if (id.length() == 0 || contains(seen, id)) continue;
                Reminders.notify(ctx, Reminders.code("n:" + id),
                        it.optString("title", "Mi Progreso"), it.optString("text", ""),
                        it.optString("action", "go:home"), it.optString("button", ""));
                seen.put(id);
                changed = true;
            }
            if (changed) {
                JSONArray trimmed = new JSONArray();
                int from = Math.max(0, seen.length() - 300);
                for (int i = from; i < seen.length(); i++) trimmed.put(seen.optString(i));
                sp.edit().putString("seen", trimmed.toString()).commit();
            }
        } catch (Throwable ignored) {
        } finally {
            if (pending != null) try { pending.finish(); } catch (Throwable ignored) { }
        }
    }

    private static boolean contains(JSONArray a, String id) {
        for (int i = 0; i < a.length(); i++) if (id.equals(a.optString(i))) return true;
        return false;
    }

    private static String post(String url, String body) throws Exception {
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        c.setInstanceFollowRedirects(true);
        c.setConnectTimeout(15000);
        c.setReadTimeout(20000);
        c.setRequestMethod("POST");
        c.setDoOutput(true);
        c.setRequestProperty("Content-Type", "text/plain;charset=utf-8");
        OutputStream os = c.getOutputStream();
        os.write(body.getBytes("UTF-8"));
        os.close();
        int code = c.getResponseCode();
        // Apps Script responde con 302 a googleusercontent: seguirlo con GET si hace falta.
        if (code == 301 || code == 302 || code == 303 || code == 307 || code == 308) {
            String loc = c.getHeaderField("Location");
            c.disconnect();
            if (loc == null) throw new Exception("redirect sin destino");
            c = (HttpURLConnection) new URL(loc).openConnection();
            c.setConnectTimeout(15000);
            c.setReadTimeout(20000);
            code = c.getResponseCode();
        }
        InputStream in = code >= 400 ? c.getErrorStream() : c.getInputStream();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        byte[] buf = new byte[8192];
        int n;
        while (in != null && (n = in.read(buf)) > 0) out.write(buf, 0, n);
        if (in != null) in.close();
        c.disconnect();
        return out.toString("UTF-8");
    }
}
