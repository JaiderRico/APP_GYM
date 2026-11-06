# Cómo modificar Mi Progreso (guía para Claude u otra persona)

## Qué hay aquí
- Dos apps Android tipo WebView: **Mi Progreso** (Jaider, `com.jaider.gimnasio`) y **Mi Progreso Ella** (`com.jaider.gimnasio.ella`).
- Toda la interfaz y la lógica están en `assets/index.html` dentro de cada APK.
- No hay proyecto de Android Studio: se edita la APK publicada más reciente y se vuelve a firmar.
- `fuente/MiProgreso_Backend.gs`: el backend (Google Apps Script). Las claves NO están en el código: viven en las Propiedades del script (CODIGO_ELLA, CODIGO_ADMIN, GROQ_API_KEY).
  Al hacer push de un cambio a este archivo, el workflow **Actualizar Apps Script** lo sube con clasp, actualiza la misma implementación (la URL no cambia) y comprueba `?action=health`.
- `fuente/MsgPoll.java`: código nativo que hace las notificaciones con la app cerrada (ya está dentro de las APK como classes6.dex, y `Reminders.onReceive` lo llama).

## Pasos
1. `python3 herramientas/mp.py extraer` → deja la última versión en `trabajo/ella` y `trabajo/jaider`.
2. Edita `trabajo/<app>/assets/index.html`. Comprueba la sintaxis de los `<script>` con `node --check`.
3. `python3 herramientas/mp.py publicar X.Y.Z --notas "- cambio"` (sin `--clave`: las APK quedan sin firmar).
   La versión debe ser mayor y con la misma cantidad de caracteres (8.4.18, 8.4.19 … 8.4.99 → 8.5.10).
4. `git add releases/vX.Y.Z && git commit && git push origin HEAD:main`. El workflow las **firma con el secreto FIRMA_PEM**,
   verifica el certificado, publica el Release y lo marca Latest. Revisa que el run de "Publicar versión" termine en verde.
   Siempre se publican **las dos** APK con el mismo número (las apps buscan su archivo en el último Release).

## Reglas del proyecto
- Firma: siempre la misma clave (certificado SHA-256 `f7d6a22c…0d7d`), guardada como secreto `FIRMA_PEM` del repo. Con otra clave el teléfono no deja actualizar. **Nunca subir la clave al repo ni pedirla.**
- App de Ella: es para una amiga. Nada romántico: sin corazones ni frases que se puedan malinterpretar; tono de entrenador.
- No decir "Drive" ni "carpeta compartida" en la app de Ella: decir "la nube".
- Datos por usuario: la app de Ella manda `app:'ella'` en cada llamada al backend. Con el código de Ella usa los archivos de ella; con el código de administrador (Jaider probando) usa `progreso_prueba.json`.
- Sin API keys ni códigos dentro de las APK (el repo es público).
- Backend: edítalo en `herramientas/fuente/MiProgreso_Backend.gs`, pruébalo (node --check y, si puedes, con un simulador de DriveApp) y haz push; revisa que "Actualizar Apps Script" termine en verde. Nunca escribas claves reales en el archivo. Mantén compatibles las acciones que ya usan las apps instaladas.
