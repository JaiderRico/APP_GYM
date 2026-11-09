# Cómo modificar Mi Progreso (guía para Claude u otra persona)

## Qué hay aquí
**Son TRES apps** y cada cambio va en las tres, salvo que se pida otra cosa: **Mi Progreso** (Jaider), **Mi Progreso Ella** y
**Mi Progreso Libre** (pública). En cada versión: `mp.py publicar` (Jaider + Ella) **y** `mp.py libre` con el mismo número.
- Dos apps Android tipo WebView: **Mi Progreso** (Jaider, `com.jaider.gimnasio`) y **Mi Progreso Ella** (`com.jaider.gimnasio.ella`).
- La tercera, pública: **Mi Progreso Libre** (`com.jaider.gimnasio.libre`, desde 8.5.10). Es la app de Jaider sin nada que
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
- `fuente/MiProgreso_Backend.gs` (v22): el backend (Google Apps Script). Las claves NO están en el código: viven en las Propiedades del script (CODIGO_ELLA, CODIGO_ADMIN, GROQ_API_KEY).
  Al hacer push de un cambio a este archivo, el workflow **Actualizar Apps Script** lo sube con clasp, actualiza la misma implementación (la URL no cambia) y comprueba `?action=health`.
- `fuente/MsgPoll.java`: código nativo que hace las notificaciones con la app cerrada (ya está dentro de las APK como classes6.dex, y `Reminders.onReceive` lo llama).
- `fuente/Pip.java` (8.5.10, en classes7.dex): ventana flotante. La página usa `NativeStore.savePhoto('__pip__', 'supported'|'enter:9:16'|'auto:1'|'auto:0'|'active')`
  (Ext2 lo enruta). El manifiesto de MainActivity tiene `supportsPictureInPicture`, `resizeableActivity` y `configChanges`
  (para que la página no se recargue al entrar/salir de la ventana). La página detecta la ventana angosta (<330 px) y
  muestra una vista mínima (descanso, ejercicio, siguiente). Desde 8.5.15 también pregunta `'active'` (la ventana se puede
  agrandar), la vista se arma con los datos del entreno (`v85MiniHtml`), y en Ajustes se elige forma (`data.settings.pip.shape`:
  9:16, 3:4, 1:1, 16:9) y letra (`text`: sm/md/lg). El auto-entrar se manda como `auto:w:h:1|0` (Pip.java lo entiende; las
  versiones viejas solo miraban el último carácter). Ojo: la página ya usa la clase global `.hero`; el bloque usa `.mp*`.
  Para recompilar classes7: `javac --release 8` de Ext2.java + Pip.java (con un stub de QuickWidget), `dalvik-exchange --dex`,
  `baksmali d`, copiar los .smali a `smali_classes7/` del `apktool d` y `apktool b`; luego copiar classes7.dex.
- `fuente/Chooser.java` (8.5.13, en classes7.dex): el selector de archivos acepta videos. `Extra.configureChooser`
  (classes4.dex, smali) lo llama al inicio; si la página pide `video/*` arma el Intent ahí, si no sigue igual que antes.
- Fotos y videos en el chat (backend v18): van dentro de `chat_send` (`media.dataUrl`, fotos comprimidas a 1600 px en el
  teléfono, videos de máx. 20 MB) y se bajan con `chat_media`. Los archivos están en "Mi Progreso - Chat (privado)" en la
  raíz de Mi unidad (`CHAT_FOLDER_ID`). "Ver una vez": solo quien lo recibe, una vez; al abrirlo el archivo va a la
  papelera. Para archivos grandes la app usa `fetch` directo al Apps Script (y `nxHttp` si falla).
- `fuente/v850_comun.js`: el bloque 8.5.10 que va en las dos apps (antes de `initV7();`): chat, varias claves de IA,
  compartir la app libre, ventana flotante y (Jaider) aviso de pedidos de Ella. Si lo cambias, vuelve a pegarlo en los
  dos `index.html` reemplazando el bloque anterior.
- `fuente/v880_comun.js` (8.5.18, **las tres apps**): (1) botón/gesto de volver: la parte nativa hace `webView.goBack()`
  si hay historial y si no cierra la app, así que mientras haya algo abierto (visor, chat, selección/respuesta del chat,
  ventanas `.modal`, el modo libre de Ella, otra pestaña o un entreno) la página deja una entrada con `history.pushState`
  y en `popstate` cierra lo de encima (`v88Top`); en Inicio sin nada abierto no hay entrada y volver sale de la app.
  En pleno entreno pregunta antes de salir (usa `#exitFocus`, que guarda la sesión). (2) **Novedades**: lista `V88_NOV`
  (versión, fecha y textos marcados `j`/`e`/`l` para cada app), se ve siempre en Ajustes → 🆕 Novedades y una vez al
  actualizar (`mp_nov_seen_v1`). **En cada versión nueva agrega arriba su entrada en `V88_NOV`** y pega el bloque en los
  dos `index.html` justo antes de `initV7();` (en la de Ella después de v870). La libre lo hereda de la de Jaider.
- `fuente/v900_seguimiento.js` (8.5.20, **solo app de Jaider**; la libre lo trae apagado): pantalla de seguimiento de Ella
  (`#v90`). La tarjeta de Inicio "Progreso de Ella" (`#hmEntry`) la abre; desde ahí: chat, snacks, pedidos y "Mensajes y
  rutinas" (la ventana vieja `openHerModal`). Pestañas: Resumen, Entrenos (filtro por fechas/un día y por ejercicio, con
  mejor serie y tendencia), Comidas por día (marca los días sin registro) y Peso/medidas. Lee `get_her_data` (su copia
  completa en la nube; reutiliza `hmState.raw`). "💬 Comentarle" abre el chat con el texto empezado. Va antes de `initV7();`
  en el `index.html` de Jaider (después de v890). En la de Ella, Novedades le avisa que Jaider ve sus entrenos y comidas.
- `fuente/v890_snacks.js` (8.5.19, apps de **Jaider y Ella**; la libre lo trae apagado por `MP_PUBLICA`): editor de la
  lista de snacks de Ella, guardada en el servidor (`snacks_ella.json`, acciones `snacks_get` / `snacks_edit` con
  `op: add|upd|del|reset`, backend v21; usuario `ella` o `prueba` como el resto). Ella lo abre desde Comida → “✏️ Mi lista”;
  Jaider desde “Progreso de Ella” → Snacks de Ella (con 🧪 Prueba). Cada snack: `{id,t,k,p,w,by,at}`; `by:'jaider'` = sugerencia
  (a ella le llega notificación por `pending_notifications` y sale primero 3 días como “Nuevo de Jaider”). La lista
  base está en el backend (`SNACKS_BASE`) y en v870 (`H87_IDEAS`, para usar sin conexión): si cambias una, cambia la otra.
  Va antes de `initV7();`, después de v880, en los dos `index.html`.
- `fuente/v870_ella_comidas.js` (8.5.17, **solo app de Ella**): registrar comidas es obligatorio (la pestaña Comida
  siempre está, el cuestionario ya no lo pregunta) y 3 snacks al día altos en calorías y poco saciantes (le cuesta comer):
  tarjeta arriba en Comida con ideas y botón "+ Lo comí" (se guarda como comida tipo `snack` con kcal/proteína), aviso en
  Resumen si va atrasada, notificaciones `h87_snack1..3` (horas en `reminders.snack1..3`, apagado con `reminders.snacks`),
  aviso de una sola vez (`settings.h87.seen`) y contexto para la IA de comidas/coach. Va en `trabajo/ella/assets/index.html`
  justo antes de `initV7();` (después de v860). Si lo cambias, pégalo de nuevo ahí.
- `fuente/v860_registros.js` (8.5.16): pesos raros. Va en los dos `index.html` justo después del bloque v8.5.0 (antes de
  `initV7();`); la libre lo hereda de la de Jaider. Al terminar una serie, si el peso no cuadra con las últimas sesiones del mismo
  ejercicio (kg totales; lb→kg, "por lado"×2; placas aparte) pregunta con `confirm`; confirmado queda `st.loadOk=true` (también
  en `draftWorkout`). Los raros sin confirmar se quitan de `getPRsAgainst`, `recordEvents`, `exGroups`, `evaluateSetPR`,
  `recordPoints` y `bestBeforeVariant`, y Logros los lista con "Era correcto". Si lo cambias, pégalo de nuevo en los dos.
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
4. Siempre (son tres apps) publica también la libre con el mismo número: `python3 herramientas/mp.py libre X.Y.Z --notas "- cambio"`
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
- Chat tipo WhatsApp (backend v20, apps 8.5.18): el envío va a una cola en el teléfono (`mp_chat_out_v1`) y se ve al
  instante con 🕓; `chat_send` con `since` devuelve de una vez lo nuevo. Mientras el chat está abierto, cada 2,5 s se llama
  `chat_list` con `rev`: si nada cambió el servidor responde desde CacheService sin abrir Drive (`unchanged:true`).
  `markRead:true` marca leído en la misma llamada. Presencia sin tocar Drive: `otherSeen` ("en línea" si < 20 s),
  `otherTyping` (`chat_typing`, dura 6 s) y `otherGot` (✓✓ gris: le llegó); ✓✓ azul = `readByOther`. Responder: deslizar
  el mensaje a la derecha o mantenerlo presionado → Responder/Copiar; se guarda `reply:{id,from,text}` en el mensaje.
- Chat (backend v15): `chat_send` / `chat_list` / `chat_read`, guardado en `chat_mi_progreso.json`. La app de Ella con su
  código usa el chat "ella"; con el código admin (prueba) usa "prueba". En la app de Jaider el botón 🧪 Prueba muestra ese.
  `pending_notifications` avisa los mensajes sin leer (y los pedidos de Ella) aunque la app esté cerrada (~15 min).
- **Permiso de internet del Apps Script (v22):** la IA usa `UrlFetchApp`, que necesita un permiso que solo da el dueño:
  en script.google.com, elegir la función `autorizarIA` → ▶ Ejecutar → aceptar (una vez). clasp no puede darlo.
  `?action=health` devuelve `iaPermiso` y "Actualizar Apps Script" deja un aviso si es `false`. **Si agregas otro servicio
  de Google al backend (Gmail, Calendar…), Jaider tendrá que volver a autorizar de la misma forma.**
- **IA por el servidor (backend v19, apps 8.5.17+)**: las claves de Groq ya NO salen del Apps Script. Las apps mandan
  la consulta con la acción `ai` (`{code, app?, req}` o, en la libre con Pro, `{pro, device, req}`) y el script llama a Groq
  rotando las claves (la que da 429/401/403 descansa en CacheService). Límite: 150 llamadas por persona por hora.
  `verify_code` y `pro_verify` ya no devuelven `groqKeys` (solo `aiProxy:true` y `aiKeys`). En el teléfono, `aiCfg().key`
  queda con la marca `gsk_servidor` (no es una clave) y el `window.fetch` de v850 desvía a `ai` las llamadas a api.groq.com.
  Las claves propias que alguien pegue en el teléfono siguen funcionando (y son el respaldo si el servidor falla).
  Al actualizar, las apps borran las claves del servidor que tenían guardadas. Solo si hiciera falta volver al modo viejo:
  propiedad `CLAVES_IA_EN_APP = 1`. Recomendado: cambiar las claves de Groq una vez todos estén en 8.5.17 (las viejas
  sí llegaron a los teléfonos). La app libre pone `window.__mpAiVia` (publica.js) para usar su código Pro.
- Claves de IA (backend v15): `GROQ_API_KEY`, `GROQ_API_KEY_2`, `GROQ_API_KEY_3`… (hasta _9) o `GROQ_API_KEYS` (separadas
  por comas) en Propiedades del script. (hasta v18) `verify_code` devolvía `groqKeys`; las apps las traían cada 12 h (o con
  Ajustes → 🔑 Claves de IA → Traer del servidor) y si una responde 429/401/403 reintentan con la siguiente.
- Códigos Pro (backend v16, app libre 8.5.11+): Jaider los crea en su app → Ajustes → ✦ Códigos Pro (nombre + días);
  se guardan en la propiedad del script `PRO_CODIGOS` (no en Drive, para que nadie más los vea) y vencen solos.
  Con un código vigente la app libre llama a `pro_verify` (recibe las claves de IA), `pro_sync` (sube su copia cada vez que
  cambia, máx. cada 3 min) y `pro_get` (recuperar). Cada persona tiene su carpeta `<nombre> (<id>)` dentro de
  "Mi Progreso - Usuarios Pro" en la raíz de Mi unidad (`PRO_FOLDER_ID`), fuera de la carpeta compartida con Ella.
  Al vencer o desactivarse, la app libre borra las claves y vuelve a gratis sin tocar sus datos.
  Desde v17 cada código sirve en UN teléfono: la app libre manda un `device` aleatorio y el primero que hace `pro_verify`
  queda amarrado; otro teléfono recibe "ya está en uso en otro teléfono". Jaider lo libera con "Liberar teléfono"
  (`pro_update {release:true}`) cuando la persona cambia de teléfono.
- Backend: edítalo en `herramientas/fuente/MiProgreso_Backend.gs`, pruébalo (node --check y, si puedes, con un simulador de DriveApp) y haz push; revisa que "Actualizar Apps Script" termine en verde. Nunca escribas claves reales en el archivo. Mantén compatibles las acciones que ya usan las apps instaladas.
