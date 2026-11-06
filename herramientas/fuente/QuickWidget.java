package com.jaider.gimnasio;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.app.PendingIntent;
import android.content.ComponentName;
import android.content.Context;
import android.os.Bundle;
import android.util.TypedValue;
import android.view.View;
import android.widget.RemoteViews;
import org.json.JSONObject;

/**
 * Widgets de un solo acceso rápido (v8.4.18). Cada subclase es un widget distinto que la persona
 * elige en la lista de widgets del teléfono. Se pueden cambiar de tamaño: con poco espacio solo se
 * ve el ícono; con más espacio aparecen el nombre y una línea corta de estado.
 */
public abstract class QuickWidget extends AppWidgetProvider {

    /** Tipos disponibles (el orden define el requestCode de cada PendingIntent). */
    static final String[] KINDS = {"entrenar", "comida", "creatina", "peso", "fotos", "historial", "ciclo"};

    abstract String kind();

    static Class<?> classFor(String kind) {
        if ("entrenar".equals(kind)) return QwEntrenar.class;
        if ("comida".equals(kind)) return QwComida.class;
        if ("creatina".equals(kind)) return QwCreatina.class;
        if ("peso".equals(kind)) return QwPeso.class;
        if ("fotos".equals(kind)) return QwFotos.class;
        if ("historial".equals(kind)) return QwHistorial.class;
        if ("ciclo".equals(kind)) return QwCiclo.class;
        return null;
    }

    static int index(String kind) {
        for (int i = 0; i < KINDS.length; i++) if (KINDS[i].equals(kind)) return i;
        return 0;
    }

    @Override
    public void onUpdate(Context ctx, AppWidgetManager m, int[] ids) {
        for (int id : ids) render(ctx, m, kind(), id);
    }

    @Override
    public void onAppWidgetOptionsChanged(Context ctx, AppWidgetManager m, int id, Bundle opts) {
        render(ctx, m, kind(), id);
    }

    /** Lo llama GymWidget.updateAll cada vez que la app sincroniza datos. */
    public static void updateAll(Context ctx) {
        if (ctx == null) return;
        try {
            Context app = ctx.getApplicationContext();
            if (app != null) ctx = app;
            AppWidgetManager m = AppWidgetManager.getInstance(ctx);
            for (String k : KINDS) {
                Class<?> c = classFor(k);
                if (c == null) continue;
                int[] ids;
                try { ids = m.getAppWidgetIds(new ComponentName(ctx, c)); } catch (Throwable t) { continue; }
                if (ids == null) continue;
                for (int id : ids) render(ctx, m, k, id);
            }
        } catch (Throwable ignored) { }
    }

    public static boolean requestPin(Context ctx, String kind) {
        try {
            Class<?> c = classFor(kind);
            if (c == null) return false;
            updateAll(ctx);
            AppWidgetManager m = AppWidgetManager.getInstance(ctx);
            ComponentName cn = new ComponentName(ctx, c);
            Boolean ok = (Boolean) AppWidgetManager.class
                    .getMethod("isRequestPinAppWidgetSupported").invoke(m);
            if (ok == null || !ok) return false;
            Object r = AppWidgetManager.class
                    .getMethod("requestPinAppWidget", ComponentName.class, Bundle.class, PendingIntent.class)
                    .invoke(m, cn, null, null);
            return r instanceof Boolean && (Boolean) r;
        } catch (Throwable t) {
            return false;
        }
    }

    static void render(Context ctx, AppWidgetManager m, String kind, int widgetId) {
        try {
            int layout = GymWidget.rid(ctx, "layout", "widget_quick");
            if (layout == 0) return;
            String pkg = ctx.getPackageName();
            RemoteViews v = new RemoteViews(pkg, layout);
            int root = GymWidget.rid(ctx, "id", "wq_root");
            int icon = GymWidget.rid(ctx, "id", "wq_icon");
            int label = GymWidget.rid(ctx, "id", "wq_label");
            int sub = GymWidget.rid(ctx, "id", "wq_sub");

            JSONObject j = null;
            try { j = GymWidget.load(ctx); } catch (Throwable ignored) { }
            if (j == null) j = new JSONObject();
            boolean hoy = false;
            try { hoy = GymWidget.today().equals(j.optString("date")); } catch (Throwable ignored) { }

            String ic = "▶", name = "Entrenar", status = "", action = "train:review";
            PendingIntent pi = null;
            int code = 9300 + index(kind) * 97 + (widgetId % 97);
            if ("entrenar".equals(kind)) {
                String mode = hoy ? j.optString("mode", "idle") : "idle";
                if ("workout".equals(mode) || "rest".equals(mode)) {
                    action = "train:resume";
                    name = "Continuar";
                    status = "rest".equals(mode) ? "⏱ En descanso" : "Sesión en curso";
                } else {
                    status = todayTitle(j);
                }
            } else if ("comida".equals(kind)) {
                ic = "🍽"; name = "Comida"; action = "food:new";
                if (hoy) {
                    String ms = j.optString("mealsShort", "");
                    java.util.regex.Matcher mt = java.util.regex.Pattern.compile("(\\d+)/(\\d+)").matcher(ms);
                    if (mt.find()) status = mt.group(1) + "/" + mt.group(2) + " hoy";
                }
            } else if ("creatina".equals(kind)) {
                ic = "💊"; name = "Creatina";
                boolean done = hoy && j.optBoolean("creatineDone", false);
                status = done ? "✓ Tomada hoy" : "Toca para marcar";
                pi = GymWidget.bc(ctx, "com.jaider.gimnasio.WIDGET_CREATINE", code);
            } else if ("peso".equals(kind)) {
                ic = "⚖️"; name = "Peso"; action = "go:weight";
            } else if ("fotos".equals(kind)) {
                ic = "📸"; name = "Fotos"; action = "go:photos";
            } else if ("historial".equals(kind)) {
                ic = "📊"; name = "Historial"; action = "go:history";
            } else if ("ciclo".equals(kind)) {
                ic = "🌸"; name = "Mi ciclo"; action = "go:cycle";
                status = j.optString("cycleShort", "");
            }
            if (pi == null) pi = GymWidget.act(ctx, action, code);

            v.setTextViewText(icon, ic);
            v.setTextViewText(label, name);
            v.setTextViewText(sub, status);
            if (root != 0 && pi != null) v.setOnClickPendingIntent(root, pi);

            // Tamaño: el widget se adapta al espacio que le dé la persona.
            int w = 0, h = 0;
            try {
                Bundle o = m.getAppWidgetOptions(widgetId);
                w = o.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 0);
                h = o.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT, 0);
                if (h == 0) h = o.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 0);
            } catch (Throwable ignored) { }
            if (w == 0) w = 70;
            if (h == 0) h = 70;
            int s = Math.min(w, h);
            boolean tiny = w < 64 || h < 56;
            boolean showSub = !tiny && h >= 96 && status.length() > 0;
            float iconSp = tiny ? Math.max(18f, s * 0.42f) : Math.min(46f, Math.max(20f, s * (showSub ? 0.30f : 0.36f)));
            v.setTextViewTextSize(icon, TypedValue.COMPLEX_UNIT_SP, iconSp);
            v.setViewVisibility(label, tiny ? View.GONE : View.VISIBLE);
            v.setTextViewTextSize(label, TypedValue.COMPLEX_UNIT_SP, w >= 150 && h >= 110 ? 16f : 13f);
            v.setViewVisibility(sub, showSub ? View.VISIBLE : View.GONE);
            m.updateAppWidget(widgetId, v);
        } catch (Throwable ignored) { }
    }

    static String todayTitle(JSONObject j) {
        try {
            JSONObject days = j.optJSONObject("days");
            if (days == null) return "";
            JSONObject d = days.optJSONObject(String.valueOf(GymWidget.dow()));
            return d == null ? "" : d.optString("title", "");
        } catch (Throwable t) {
            return "";
        }
    }
}
