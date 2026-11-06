# Cómo modificar Mi Progreso (guía para Claude u otra persona)

## Qué hay aquí
- Dos apps Android tipo WebView: **Mi Progreso** (Jaider, `com.jaider.gimnasio`) y **Mi Progreso Ella** (`com.jaider.gimnasio.ella`).
- Toda la interfaz y la lógica están en `assets/index.html` dentro de cada APK.
- No hay proyecto de Android Studio: se edita la APK publicada más reciente y se vuelve a firmar.
- `fuente/MiProgreso_Backend_v12.gs`: el backend (Google Apps Script). Tiene marcadores en lugar de los códigos reales; Jaider lo pega en script.google.com y pone sus claves.
- `fuente/MsgPoll.java`: código nativo que hace las notificaciones con la app cerrada (ya está dentro de las APK como classes6.dex, y `Reminders.onReceive` lo llama).

## Pasos
1. `apt-get install -y apksigner zipalign openssl`
2. `python3 herramientas/mp.py extraer` → deja la última versión en `trabajo/ella` y `trabajo/jaider`.
3. Edita `trabajo/<app>/assets/index.html`. Comprueba la sintaxis de los `<script>` con `node --check`.
4. `python3 herramientas/mp.py publicar X.Y.Z --clave <ruta .pem> --notas "- cambio"`.
   La versión debe ser mayor y con la misma cantidad de caracteres (8.4.18, 8.4.19 … 8.4.99 → 8.5.10).
5. `git add releases/vX.Y.Z && git commit && git push origin HEAD:main`. El workflow publica el Release y lo marca Latest.
   Siempre se publican **las dos** APK con el mismo número (las apps buscan su archivo en el último Release).

## Reglas del proyecto
- Firma: siempre la misma clave (certificado SHA-256 `f7d6a22c…0d7d`). Con otra clave el teléfono no deja actualizar. **Nunca subir la clave al repo.**
- App de Ella: es para una amiga. Nada romántico: sin corazones ni frases que se puedan malinterpretar; tono de entrenador.
- No decir "Drive" ni "carpeta compartida" en la app de Ella: decir "la nube".
- Datos por usuario: la app de Ella manda `app:'ella'` en cada llamada al backend. Con el código de Ella usa los archivos de ella; con el código de administrador (Jaider probando) usa `progreso_prueba.json`.
- Sin API keys ni códigos dentro de las APK (el repo es público).
- Si cambias el backend, entrega el `.gs` completo a Jaider y recuérdale actualizar la implementación con "Nueva versión" (sin cambiar la URL).
