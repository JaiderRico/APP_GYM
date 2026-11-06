# Cómo modificar Mi Progreso (guía para Claude u otra persona)

## Qué hay aquí
- Dos apps Android tipo WebView: **Mi Progreso** (Jaider, `com.jaider.gimnasio`) y **Mi Progreso Ella** (`com.jaider.gimnasio.ella`).
- Toda la interfaz y la lógica están en `assets/index.html` dentro de cada APK.
- No hay proyecto de Android Studio: se edita la APK publicada más reciente y se vuelve a firmar.
- `fuente/MiProgreso_Backend.gs`: el backend (Google Apps Script). Las claves NO están en el código: viven en las Propiedades del script (CODIGO_ELLA, CODIGO_ADMIN, GROQ_API_KEY).
  Al hacer push de un cambio a este archivo, el workflow **Actualizar Apps Script** lo sube con clasp, actualiza la misma implementación (la URL no cambia) y comprueba `?action=health`.
- `fuente/MsgPoll.java`: código nativo que hace las notificaciones con la app cerrada (ya está dentro de las APK como classes6.dex, y `Reminders.onReceive` lo llama).
- `fuente/QuickWidget.java`, `fuente/Qw*.java`, `fuente/Ext2.java` (8.4.18, dentro de las APK como classes7.dex):
  un widget por acceso rápido (Entrenar, Comida, Creatina, Peso, Fotos, Historial y, en la de Ella, Mi ciclo), redimensionables,
  y los controles de música. La página llega a ellos con `NativeStore.savePhoto('__media__', 'toggle|next|prev|active')`
  y `NativeStore.savePhoto('__widget_pin__', 'q:<tipo>')`. Ganchos en smali: al inicio de `Extra.savePhoto` (llama a
  `Ext2.handles/hook`) y de `GymWidget.updateAll` (llama a `QuickWidget.updateAll`). Recursos nuevos: `res/layout/widget_quick.xml`
  y `res/xml/widget_quick_info.xml`. Los widgets viejos (Panel Diario y Entreno Rápido) ya no aparecen en la lista de widgets;
  `GymWidget` sigue como receptor de las acciones de creatina y descanso.
- Si algún día hay que tocar el manifiesto o los recursos: `apt-get install apktool android-sdk-platform-23 dalvik-exchange`,
  `apktool d` de la APK, editar, `apktool b`, y copiar a `trabajo/<app>/` solo `AndroidManifest.xml`, `resources.arsc`, `res/`
  y los `classesN.dex` que cambiaron (los IDs de recursos se conservan). Java nuevo: `javac --release 8` contra el android.jar
  y `dalvik-exchange --dex` → un `classesN.dex` nuevo en `trabajo/<app>/`.

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
- Pedidos de Ella (backend v14): ella escribe en Ajustes → "Pedir cambios para la app"; quedan en `pedidos_app_ella.json`
  y Jaider los ve y los marca desde "Progreso de Ella". Si eres Claude y te piden "lo que pidió ella", están ahí.
- Backend: edítalo en `herramientas/fuente/MiProgreso_Backend.gs`, pruébalo (node --check y, si puedes, con un simulador de DriveApp) y haz push; revisa que "Actualizar Apps Script" termine en verde. Nunca escribas claves reales en el archivo. Mantén compatibles las acciones que ya usan las apps instaladas.
