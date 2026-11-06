# Cómo modificar Mi Progreso (guía para Claude u otra persona)

## Qué hay aquí
- Dos apps Android tipo WebView: **Mi Progreso** (Jaider, `com.jaider.gimnasio`) y **Mi Progreso Ella** (`com.jaider.gimnasio.ella`).
- Una tercera, pública: **Mi Progreso Libre** (`com.jaider.gimnasio.libre`, desde 8.5.10). Es la app de Jaider sin nada que
  se conecte con nosotros (sin código, sin Apps Script, sin IA, sin chat, sin sus datos): todo queda en el teléfono.
  Tiene cuestionario inicial (objetivo, experiencia, días, lugar, prioridades, creatina) que arma la rutina y consejos
  genéricos. Lo de IA y nube es "Pro": se activa con un código temporal (ver Códigos Pro abajo). Se genera sola con `mp.py libre` (ver Pasos) desde
  `trabajo/jaider` + `fuente/publica.js`. Va en `publica/vX.Y.Z/` y el workflow **Publicar app libre** la sube al Release
  fijo `publica` (pre-release, nunca Latest) como `MiProgreso_Libre.apk`. Enlace que comparten las apps:
  https://github.com/JaiderRico/APP_GYM/releases/download/publica/MiProgreso_Libre.apk
  **Nunca pongas la APK libre dentro de `releases/vX.Y.Z/`**: las apps 8.4.x de Jaider toman la primera APK sin "ella"
  del último Release y podrían bajar la libre.
- Toda la interfaz y la lógica están en `assets/index.html` dentro de cada APK.
- No hay proyecto de Android Studio: se edita la APK publicada más reciente y se vuelve a firmar.
- `fuente/MiProgreso_Backend.gs` (v15): el backend (Google Apps Script). Las claves NO están en el código: viven en las Propiedades del script (CODIGO_ELLA, CODIGO_ADMIN, GROQ_API_KEY).
  Al hacer push de un cambio a este archivo, el workflow **Actualizar Apps Script** lo sube con clasp, actualiza la misma implementación (la URL no cambia) y comprueba `?action=health`.
- `fuente/MsgPoll.java`: código nativo que hace las notificaciones con la app cerrada (ya está dentro de las APK como classes6.dex, y `Reminders.onReceive` lo llama).
- `fuente/Pip.java` (8.5.10, en classes7.dex): ventana flotante. La página usa `NativeStore.savePhoto('__pip__', 'supported'|'enter:9:16'|'auto:1'|'auto:0'|'active')`
  (Ext2 lo enruta). El manifiesto de MainActivity tiene `supportsPictureInPicture`, `resizeableActivity` y `configChanges`
  (para que la página no se recargue al entrar/salir de la ventana). La página detecta la ventana angosta (<330 px) y
  muestra una vista mínima (descanso, ejercicio, siguiente).
  Para recompilar classes7: `javac --release 8` de Ext2.java + Pip.java (con un stub de QuickWidget), `dalvik-exchange --dex`,
  `baksmali d`, copiar los .smali a `smali_classes7/` del `apktool d` y `apktool b`; luego copiar classes7.dex.
- `fuente/v850_comun.js`: el bloque 8.5.10 que va en las dos apps (antes de `initV7();`): chat, varias claves de IA,
  compartir la app libre, ventana flotante y (Jaider) aviso de pedidos de Ella. Si lo cambias, vuelve a pegarlo en los
  dos `index.html` reemplazando el bloque anterior.
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
4. Si la app libre debe llevar los cambios de la de Jaider: `python3 herramientas/mp.py libre X.Y.Z --notas "- cambio"`
   (después del paso 3; deja `publica/vX.Y.Z/MiProgreso_Libre_vX.Y.Z.apk` sin firmar). Si falla diciendo que no encontró
   un texto, es que cambió en la app de Jaider: ajusta `libre_html()` en mp.py.
5. `git add releases/vX.Y.Z publica/vX.Y.Z && git commit && git push origin HEAD:main`. El workflow las **firma con el secreto FIRMA_PEM**,
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
- Chat (backend v15): `chat_send` / `chat_list` / `chat_read`, guardado en `chat_mi_progreso.json`. La app de Ella con su
  código usa el chat "ella"; con el código admin (prueba) usa "prueba". En la app de Jaider el botón 🧪 Prueba muestra ese.
  `pending_notifications` avisa los mensajes sin leer (y los pedidos de Ella) aunque la app esté cerrada (~15 min).
- Claves de IA (backend v15): `GROQ_API_KEY`, `GROQ_API_KEY_2`, `GROQ_API_KEY_3`… (hasta _9) o `GROQ_API_KEYS` (separadas
  por comas) en Propiedades del script. `verify_code` devuelve `groqKeys`; las apps las traen cada 12 h (o con
  Ajustes → 🔑 Claves de IA → Traer del servidor) y si una responde 429/401/403 reintentan con la siguiente.
- Códigos Pro (backend v16, app libre 8.5.11+): Jaider los crea en su app → Ajustes → ✦ Códigos Pro (nombre + días);
  se guardan en la propiedad del script `PRO_CODIGOS` (no en Drive, para que nadie más los vea) y vencen solos.
  Con un código vigente la app libre llama a `pro_verify` (recibe las claves de IA), `pro_sync` (sube su copia cada vez que
  cambia, máx. cada 3 min) y `pro_get` (recuperar). Cada persona tiene su carpeta `<nombre> (<id>)` dentro de
  "Mi Progreso - Usuarios Pro" en la raíz de Mi unidad (`PRO_FOLDER_ID`), fuera de la carpeta compartida con Ella.
  Al vencer o desactivarse, la app libre borra las claves y vuelve a gratis sin tocar sus datos.
- Backend: edítalo en `herramientas/fuente/MiProgreso_Backend.gs`, pruébalo (node --check y, si puedes, con un simulador de DriveApp) y haz push; revisa que "Actualizar Apps Script" termine en verde. Nunca escribas claves reales en el archivo. Mantén compatibles las acciones que ya usan las apps instaladas.
