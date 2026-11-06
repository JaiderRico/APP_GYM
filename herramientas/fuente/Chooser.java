package com.jaider.gimnasio;

import android.content.Intent;
import android.webkit.WebChromeClient;

/**
 * 8.5.13: el selector de archivos acepta videos (para mandarlos por el chat).
 * Extra.configureChooser lo llama primero; si la página pidió video/* (o image/*,video/*)
 * arma el Intent aquí y devuelve true. Si no, sigue el comportamiento de antes (solo imágenes o JSON).
 */
public final class Chooser {
    private Chooser() { }

    public static boolean configure(Intent i, WebChromeClient.FileChooserParams p) {
        if (i == null || p == null) return false;
        String[] a;
        try { a = p.getAcceptTypes(); } catch (Throwable t) { return false; }
        if (a == null) return false;
        boolean img = false, vid = false;
        for (String s : a) {
            if (s == null) continue;
            for (String part : s.split(",")) {
                String x = part.trim();
                if (x.startsWith("video")) vid = true;
                if (x.startsWith("image")) img = true;
            }
        }
        if (!vid) return false;
        i.setAction(Intent.ACTION_GET_CONTENT);
        i.addCategory(Intent.CATEGORY_OPENABLE);
        if (img) {
            i.setType("*/*");
            i.putExtra(Intent.EXTRA_MIME_TYPES, new String[]{"image/*", "video/*"});
        } else {
            i.setType("video/*");
        }
        return true;
    }
}
