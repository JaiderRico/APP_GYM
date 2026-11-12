// ============================================================================
// BACKEND MI PROGRESO v24 — Google Apps Script (respaldo en Drive + app de Ella)
// ============================================================================
// NOVEDAD v24 — APP Y PERMISOS POR PERSONA:
//   Cada persona tiene app: 'ella' (la rosa) o 'libre' (la pública, que con un código PE- se conecta igual),
//   perms { ver, chat, msgs, ia } (ver = tus entrenos; msgs = mensajes y rutinas; ia = IA + copia en la nube)
//   y, si quieres, expiresAt (vence sola). Los códigos Pro viejos (MP-) siguen funcionando igual.
//   usr_create { name, app?, perms?, days? } · usr_update { id, perms?, app?, days? (alarga), noExpire? }
//   Lo que una persona no tiene: su app recibe listas vacías (mensajes, rutinas, chat) o un aviso claro.
// ============================================================================
// NOVEDAD v23 — VARIAS PERSONAS EN LA APP DE ELLA:
//   Jaider crea personas desde su app (Ajustes → 👥 Personas): nombre -> código propio (PE-XXXX-XXXX).
//   Se guardan en la propiedad del script USUARIOS_APP (no en Drive). Con ese código, la app de Ella
//   funciona igual que con Ella, pero todo lo de esa persona (progreso, historial, fotos, mensajes,
//   rutinas, pedidos, chat y snacks) va en SU carpeta: "Mi Progreso - Personas/<nombre> (<id>)" en la
//   raíz de Mi unidad (USR_FOLDER_ID), fuera de la carpeta compartida con Ella.
//   Ella sigue con CODIGO_ELLA y sus archivos de siempre; el código admin en la app de Ella sigue siendo "prueba".
//   Desde la app de Jaider, las acciones de seguimiento aceptan user:'<id>' (o thread:'<id>' en el chat)
//   para trabajar con esa persona; sin user siguen siendo de Ella (compatible con las apps anteriores).
//   usr_create { code, name } · usr_list { code } · usr_update { code, id, name?, revoke?, share?, newCode? }
//   usr_delete { code, id }  (solo admin; la carpeta queda)
// ============================================================================
// NOVEDAD v12 — DATOS POR USUARIO:
//   La app de Ella (8.4.13+) manda app:'ella' en cada llamada. Con eso el backend sabe
//   quién está usando esa app:
//     · Código de Ella          -> usuario "ella"   -> progreso_ella.json, Fotos_Ella
//     · Código admin (Jaider)   -> usuario "prueba" -> progreso_prueba.json, Fotos_Prueba
//   Así puedes probar la app de ella en tu teléfono con TU código sin tocar sus datos.
//   En modo prueba, marcar mensajes como leídos, responderlos o guardar rutinas tampoco
//   cambia lo que ella ve: se guarda aparte (campo "test").
//   Tu app (Mi Progreso) no manda app:'ella', así que sigue viendo los datos reales de Ella.
//   pending_notifications: las apps 8.4.16+ lo consultan cada ~15 min para avisar aunque estén cerradas.
// ============================================================================
// Carpeta "Mi Progreso v8.0":
// https://drive.google.com/drive/folders/1hUkPHwACKs533vFBA0_D4VymitggIXKD
//
// v22: autorizarIA(): ejecútala UNA vez desde el editor (▶ Ejecutar) para darle al script el permiso de conectarse
//      a internet (UrlFetchApp), que necesita la IA desde v19. Sin ese permiso la IA responde un aviso claro.
//      health devuelve iaPermiso (true/false) y la automatización de GitHub avisa si falta.
//
// v21: lista de snacks de Ella compartida (snacks_ella.json). Ella la edita desde su app y Jaider desde la suya
//      (sus sugerencias le llegan como notificación). snacks_get / snacks_edit.
//
// v20: chat más rápido. chat_list acepta rev (si nada cambió responde sin abrir Drive), markRead (marca leído en la
//      misma llamada) y devuelve presencia: otherSeen (última vez), otherTyping y otherGot (hasta dónde recibió).
//      chat_typing avisa "escribiendo…". chat_send acepta since (devuelve los nuevos en la misma respuesta) y
//      reply { id } para responder un mensaje. Todo es compatible con las apps anteriores.
//
// v19: las claves de IA ya NO salen del servidor. Las apps (8.5.17+) le piden la respuesta a la IA con la
//      acción "ai" y este script llama a Groq con tus claves (rota entre ellas si una se agota). verify_code y
//      pro_verify ya no devuelven las claves (solo cuántas hay). Si alguna vez necesitas que las apps viejas
//      las reciban otra vez, crea la propiedad CLAVES_IA_EN_APP = 1 (no recomendado).
//
// v18: fotos y videos en el chat (normales o "ver una vez"). Los archivos van a una carpeta PRIVADA en la raíz
//      de tu Drive ("Mi Progreso - Chat (privado)"), no en la carpeta compartida. Los de "ver una vez" solo los
//      puede abrir quien los recibe, una sola vez, y el archivo se manda a la papelera al abrirlo.
//
// v17: cada código Pro sirve en UN solo teléfono. El primero que lo activa queda amarrado (device);
//      otro teléfono recibe "Este código ya está en uso en otro teléfono". Jaider lo libera con
//      pro_update { release:true } para que la persona lo pase a un teléfono nuevo.
//
// v16: códigos Pro para la app pública "Mi Progreso Libre". Jaider los crea desde su app (nombre + días),
//      quedan en las Propiedades del script (PRO_CODIGOS, nadie más los ve) y vencen solos. Con un código
//      vigente la app libre usa la IA (tus claves) y guarda su copia en su propia carpeta, dentro de
//      "Mi Progreso - Usuarios Pro" en la raíz de tu Drive (NO en la carpeta compartida).
//
// v15: varias claves de Groq (GROQ_API_KEY, GROQ_API_KEY_2, GROQ_API_KEY_3… o GROQ_API_KEYS
//      separadas por comas): verify_code devuelve groqKeys y las apps pasan a la siguiente cuando
//      una se agota. Chat entre las dos apps (chat_send / chat_list / chat_read) con aviso aunque la
//      app esté cerrada (pending_notifications).
//
// v14: pedidos de cambios para la app de Ella (send_request / get_requests / update_request /
//      delete_request). Ella anota lo que quiere que cambie y Jaider lo ve y lo marca.
//
// v13: las claves viven en "Propiedades del script" y GitHub Actions publica este archivo
//      solo (workflow "Actualizar Apps Script") cuando cambia en el repo.
//
// CÓMO ACTUALIZARLO A MANO (sin cambiar la URL /exec que ya usan las apps):
// 1. Abre tu proyecto en https://script.google.com, borra el código y pega este archivo.
// 2. La primera vez: ⚙️ Configuración del proyecto → Propiedades del script → agrega
//    CODIGO_ELLA, CODIGO_ADMIN y GROQ_API_KEY. Guarda (💾).
// 3. "Implementar" -> "Gestionar implementaciones" -> lápiz ✏️ de la implementación actual
//    -> Versión: "Nueva versión" -> "Implementar".
//    (Si haces "Nueva implementación" la URL cambia y tendrías que ponerla en las apps.)
// 4. Debe seguir con: Ejecutar como "Yo" · Quién tiene acceso "Cualquier persona".
//
// ACCIONES (POST con cuerpo JSON, o GET con ?action=...):
//   verify_code    { code }                       -> { ok, role, aiProxy:true, aiKeys:n }  (v19: sin claves)
//   ai             { code|pro+device, app?, req }  -> { ok, status, body, retryAfter }  (la IA a través del servidor)
//   sync_her_data  { code, payload }              -> guarda progreso_ella.json        (Ella o admin)
//   get_messages   { code, includeRead? }         -> mensajes pendientes / todos       (Ella o admin)
//   mark_read      { code, ids:[...] }            -> marca mensajes como leídos        (Ella o admin)
//   get_my_data    { code }                       -> progreso_jaider.json (solo lectura) (Ella o admin)
//   send_message   { code, text, timestamp, id }  -> guarda en mensajes_motivacion.json (solo admin)
//   delete_message { code, id }                   -> borra un mensaje                  (solo admin)
//   get_her_data   { code }                       -> progreso_ella.json                (Ella o admin)
//   sync_my_data   { code, payload }              -> guarda progreso_jaider.json       (solo admin)
//   send_reply     { code, id, emoji, text }      -> Ella reacciona/responde un mensaje (Ella o admin)
//   send_routine   { code, routine }              -> rutina para la app de Ella        (solo admin)
//   get_routines   { code }                       -> rutinas pendientes / todas        (Ella o admin)
//   ack_routine    { code, ids:[...] }            -> Ella ya la guardó                 (Ella o admin)
//   delete_routine { code, id }                   -> borra una rutina enviada          (solo admin)
//   backup_photo   { code, id, date, dataUrl }    -> copia de una foto de progreso     (Ella o admin)
//   list_photos    { code }                       -> fotos respaldadas                 (Ella o admin)
//   get_photo      { code, id }                   -> una foto (para recuperarla)       (Ella o admin)
//   pending_notifications { code, app? }       -> novedades para notificar con la app cerrada
//   send_request   { code, app, id, text }        -> Ella pide un cambio para su app    (Ella o admin)
//   get_requests   { code, app? }                 -> pedidos (Ella: los suyos; Jaider: todos)
//   update_request { code, id, status, note }     -> Jaider marca un pedido             (solo admin)
//   delete_request { code, app?, id }             -> borra un pedido (Ella los suyos; admin cualquiera)
//   chat_send      { code, app?, thread?, id, text } -> manda un mensaje al chat        (Ella o admin)
//   chat_list      { code, app?, thread?, since? }   -> mensajes del chat y no leídos   (Ella o admin)
//   chat_read      { code, app?, thread?, upTo? }    -> marca el chat como leído        (Ella o admin)
//   chat_list      { …, rev?, markRead? }            -> (v20) unchanged:true si rev no cambió; otherSeen/otherTyping/otherGot
//   snacks_get     { code, app?, user? }             -> (v21) { list:[{id,t,k,p,w,by,at}], updatedAt }  (Ella o admin)
//   snacks_edit    { code, app?, user?, op:'add'|'upd'|'del'|'reset', item?, id? } -> lista nueva  (Ella o admin)
//     · App de Ella: su lista (con el código admin, la de prueba). App de Jaider: user:'prueba' para la de prueba.
//   chat_typing    { code, app?, thread? }           -> (v20) "escribiendo…" por 6 s (sin tocar Drive)
//   chat_send      { …, since?, reply:{id}? }        -> (v20) también devuelve messages nuevos, rev y readByOther
//   chat_send      { …, media:{ dataUrl, kind:'image'|'video', once, thumb?, w?, h?, dur? } } -> foto o video
//   chat_media     { code, app?, thread?, id }       -> { dataUrl } del archivo (ver una vez: solo quien lo recibe, 1 vez)
//     · App de Ella con su código -> chat "ella"; con el código admin (prueba) -> chat "prueba".
//     · App de Jaider -> chat "ella" (o thread:'prueba' para ver el de prueba).
//   usr_create     { code, name, app?, perms?, days? } -> (v23/v24) persona nueva con su código  (solo admin)
//   usr_list / usr_update { id, name?, revoke?, share?, newCode? } / usr_delete { id }   (solo admin)
//     · Desde la app de Jaider, user:'<id>' (o thread:'<id>') hace que get_her_data, mensajes, rutinas,
//       pedidos, chat y snacks sean de esa persona. Sin user: Ella (como siempre).
//   pro_create     { code, name, days }           -> crea un código Pro temporal        (solo admin)
//   pro_list       { code }                       -> códigos Pro y su estado            (solo admin)
//   pro_update     { code, id, days?, revoke?, release? } -> alarga / revoca / reactiva / libera el teléfono (solo admin)
//   pro_delete     { code, id }                   -> borra el código (la carpeta queda)  (solo admin)
//   pro_verify     { pro, device }                -> { ok, name, expiresAt, aiProxy:true }  (app libre; amarra el teléfono)
//   pro_sync       { pro, device, payload }       -> copia en su carpeta                (app libre)
//   pro_get        { pro, device }                -> su última copia                    (app libre)
//   backup / sin action -> respaldo clásico (igual que antes)
//   (Con app:'ella' + código admin, las acciones de Ella usan el usuario "prueba".)
// ============================================================================

// ---------- CLAVES PRIVADAS (nunca en el APK ni en el código) ----------
// Se guardan en Apps Script → ⚙️ Configuración del proyecto → Propiedades del script:
//   CODIGO_ELLA, CODIGO_ADMIN, GROQ_API_KEY
//   y, si quieres claves de reserva: GROQ_API_KEY_2, GROQ_API_KEY_3 … (hasta _9)
//   o GROQ_API_KEYS con varias separadas por comas.
// Así el código se puede actualizar automáticamente desde GitHub sin borrar las claves.
// (Si alguna propiedad falta, se usa el valor de respaldo de aquí abajo.)
function prop_(k, respaldo) {
  try { const v = PropertiesService.getScriptProperties().getProperty(k); return v ? String(v).trim() : respaldo; }
  catch (e) { return respaldo; }
}
const CODIGO_ELLA  = prop_('CODIGO_ELLA',  "TU_CODIGO_SECRETO_AQUI");
const CODIGO_ADMIN = prop_('CODIGO_ADMIN', "TU_CODIGO_ADMIN");
const GROQ_API_KEY = prop_('GROQ_API_KEY', "TU_API_KEY_DE_GROQ");
const BACKEND_VERSION = 'v24';
// Todas las claves de Groq configuradas, sin repetir y en orden (la principal primero).
function groqKeys_() {
  const out = [];
  const add = function (v) {
    String(v || '').split(/[\s,;]+/).forEach(function (k) {
      k = k.trim();
      if (/^gsk_[A-Za-z0-9]{10,}$/.test(k) && out.indexOf(k) < 0) out.push(k);
    });
  };
  add(GROQ_API_KEY);
  for (let i = 2; i <= 9; i++) add(prop_('GROQ_API_KEY_' + i, ''));
  add(prop_('GROQ_API_KEYS', ''));
  return out;
}
// v19: solo si la propiedad CLAVES_IA_EN_APP = 1 se le entregan las claves a las apps (modo viejo).
function clavesEnApp_() { return prop_('CLAVES_IA_EN_APP', '') === '1'; }
function infoClaves_() {
  const keys = groqKeys_(), o = { aiProxy: true, aiKeys: keys.length };
  if (clavesEnApp_()) { o.groqKey = keys[0] || ''; o.groqKeys = keys; }
  return o;
}

// ---------- IA a través del servidor (v19) ----------
const AI_URL_GROQ = 'https://api.groq.com/openai/v1/chat/completions';
const AI_MAX_BYTES = 12 * 1024 * 1024;     // fotos de menús incluidas
const AI_LIMITE_HORA = 150;                // llamadas por persona por hora
function aiCoolKey_(k) { return 'aicool_' + Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, k)).slice(0, 20); }
function aiQuien_(body) {
  const role = roleOf(body.code);
  if (role) return role + ':' + userOf(body, role);
  if (body.pro) return 'pro:' + requirePro(body).x.id;
  throw new Error('Código inválido o faltante');
}
function aiLimite_(quien) {
  const c = CacheService.getScriptCache(), k = 'aicnt_' + quien.replace(/[^a-zA-Z0-9:_-]/g, '') + '_' + Math.floor(Date.now() / 3600000);
  const n = Number(c.get(k) || 0) + 1;
  c.put(k, String(n), 3700);
  if (n > AI_LIMITE_HORA) throw new Error('Llegaste al límite de la IA por esta hora. Intenta más tarde.');
}
function aiValidar_(req) {
  if (!req || typeof req !== 'object' || Array.isArray(req)) throw new Error('Falta la consulta para la IA');
  if (typeof req.model !== 'string' || !Array.isArray(req.messages) || !req.messages.length) throw new Error('Consulta de IA inválida');
  if (req.stream) throw new Error('La IA del servidor no admite stream');
  const s = JSON.stringify(req);
  if (s.length > AI_MAX_BYTES) throw new Error('La consulta para la IA es demasiado grande');
  return s;
}
// Llama a Groq probando las claves en orden; la que responde 429/401/403 descansa un rato.
function aiLlamar_(payload, keys, fetchFn) {
  const cache = CacheService.getScriptCache();
  const listas = [], descansando = [];
  keys.forEach(function (k) { (cache.get(aiCoolKey_(k)) ? descansando : listas).push(k); });
  const orden = listas.concat(descansando);
  if (!orden.length) return { status: 503, body: JSON.stringify({ error: { message: 'No hay claves de IA configuradas en el servidor.' } }), retryAfter: 0 };
  let last = null;
  for (let i = 0; i < orden.length; i++) {
    const k = orden[i];
    const r = fetchFn(AI_URL_GROQ, {
      method: 'post', contentType: 'application/json', muteHttpExceptions: true,
      headers: { Authorization: 'Bearer ' + k }, payload: payload
    });
    const st = r.getResponseCode(), h = r.getHeaders() || {};
    const ra = Number(h['retry-after'] || h['Retry-After'] || 0) || 0;
    last = { status: st, body: r.getContentText(), retryAfter: ra };
    if (st !== 429 && st !== 401 && st !== 403) return last;
    cache.put(aiCoolKey_(k), '1', st === 429 ? Math.min(21600, Math.max(ra, 300)) : 21600);
  }
  return last;
}

// v22: el permiso para conectarse a internet (UrlFetchApp) lo da el dueño del script una sola vez.
const AVISO_PERMISO_IA = 'La IA del servidor aún no tiene permiso para conectarse. Jaider: abre el Apps Script, elige la función autorizarIA y dale ▶ Ejecutar (una sola vez).';
function esFaltaPermiso_(e) { return /permiso|permission|external_request|autoriz|authoriz/i.test(String(e && e.message || e)); }
function iaPermiso_() {
  try {
    UrlFetchApp.fetch('https://api.groq.com/openai/v1/models', { muteHttpExceptions: true, headers: { Authorization: 'Bearer ' + (groqKeys_()[0] || 'x') } });
    return true;
  } catch (e) { return esFaltaPermiso_(e) ? false : true; }
}
// ▶ Ejecuta esta función desde el editor (una sola vez) y acepta los permisos que pide Google.
function autorizarIA() {
  const keys = groqKeys_();
  Logger.log('Claves de IA configuradas: ' + keys.length);
  keys.forEach(function (k, i) {
    const r = UrlFetchApp.fetch('https://api.groq.com/openai/v1/models', { muteHttpExceptions: true, headers: { Authorization: 'Bearer ' + k } });
    Logger.log('Clave ' + (i + 1) + ' (…' + k.slice(-4) + '): ' + (r.getResponseCode() === 200 ? 'funciona ✓' : 'responde ' + r.getResponseCode()));
  });
  Logger.log('Listo: la IA de las apps ya puede usar el servidor.');
}

function clavesConfiguradas_() {
  return CODIGO_ELLA !== "TU_CODIGO_SECRETO_AQUI" && CODIGO_ADMIN !== "TU_CODIGO_ADMIN";
}

// Las acciones nuevas piden el código guardado en la app. Así, aunque alguien saque la
// URL del APK público de GitHub, no puede leer los datos ni mandar mensajes.
const EXIGIR_CODIGO = true;

// Respaldo clásico (action "backup" y GET ?filename=) sin código, para que las apps 8.1
// que ya están instaladas sigan funcionando. Cuando las dos apps manden el código,
// cámbialo a false.
const PERMITIR_RESPALDO_SIN_CODIGO = true;

// Qué partes de tu respaldo puede ver Ella con get_my_data (nada de ajustes ni claves).
// Agrega 'bodyWeights' o 'bodyMeasurements' si algún día quieres compartir tu peso/medidas.
const CAMPOS_COMPARTIDOS_JAIDER = ['workouts', 'customRoutines'];

// ---------- Archivos ----------
const FOLDER_ID   = '1hUkPHwACKs533vFBA0_D4VymitggIXKD';
const MASTER_FILE = 'MiProgreso_Respaldo_Auto.json';
const HISTORY_DIR = 'Historial_Respaldos';
const HER_FILE    = 'progreso_ella.json';
const MY_FILE     = 'progreso_jaider.json';
const MSG_FILE    = 'mensajes_motivacion.json';
const ROUTINE_FILE = 'rutinas_para_ella.json';
const MAX_RUTINAS = 60;
const REQUEST_FILE = 'pedidos_app_ella.json';
const MAX_PEDIDOS = 150;
const ESTADOS_PEDIDO = ['pendiente', 'en_proceso', 'hecho', 'descartado'];
const PHOTO_DIR = 'Fotos_Ella';
const MAX_FOTO_BYTES = 8 * 1024 * 1024;
// Archivos que ya escriben las apps 8.1 (se usan como respaldo si el nuevo aún no existe)
const HER_LEGACY_FILES = ['MiProgreso_Ella_Respaldo_Auto.json'];
const MY_LEGACY_FILES  = ['MiProgreso_Jaider_Respaldo_Auto.json', MASTER_FILE];
// Archivos de cada usuario de la app de Ella
const USUARIOS = {
  ella:   { file: HER_FILE,               photos: PHOTO_DIR,      daily: 'progreso_ella_',   legacy: HER_LEGACY_FILES },
  prueba: { file: 'progreso_prueba.json', photos: 'Fotos_Prueba', daily: 'progreso_prueba_', legacy: [] }
};
const MAX_MENSAJES = 200;
const MAX_TEXTO_MENSAJE = 500;
const TZ = 'America/Bogota';

// ============================================================================
// Utilidades de Drive
// ============================================================================
function getTargetFolder(customId) {
  try {
    return DriveApp.getFolderById(customId || FOLDER_ID);
  } catch (e) {
    return DriveApp.getFolderById(FOLDER_ID);
  }
}

function findFile(folder, name) {
  const it = folder.getFilesByName(name);
  return it.hasNext() ? it.next() : null;
}

function upsertFile(folder, name, content) {
  const f = findFile(folder, name);
  if (f) {
    f.setContent(content);
    return f;
  }
  return folder.createFile(name, content, MimeType.PLAIN_TEXT);
}

function readJsonFile(file) {
  const txt = file.getBlob().getDataAsString('UTF-8');
  try { return JSON.parse(txt); } catch (e) { return txt; }
}

// Devuelve el archivo más reciente entre varios nombres posibles.
function newestFile(folder, names) {
  let best = null;
  names.forEach(function (n) {
    const f = findFile(folder, n);
    if (f && (!best || f.getLastUpdated() > best.getLastUpdated())) best = f;
  });
  return best;
}

function getHistoryFolder(folder) {
  const hit = folder.getFoldersByName(HISTORY_DIR);
  return hit.hasNext() ? hit.next() : folder.createFolder(HISTORY_DIR);
}

function todayStr() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone() || TZ, 'yyyy-MM-dd');
}

function toContent(payload) {
  return typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function withLock(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try { return fn(); } finally { lock.releaseLock(); }
}

// ============================================================================
// Códigos y roles
// ============================================================================
function roleOf(code) {
  code = String(code || '').trim();
  if (!code) return null;
  if (code === CODIGO_ADMIN) return 'admin';
  if (code === CODIGO_ELLA) return 'ella';
  if (usrByCode_(code)) return 'ella';      // v23: otra persona de la app de Ella (mismos permisos que Ella)
  return null;
}

// ============================================================================
// Personas de la app de Ella (v23)
// ============================================================================
const USR_PROP = 'USUARIOS_APP';
const USR_ROOT_NAME = 'Mi Progreso - Personas';
const USR_MAX = 40;
const USR_RESERVADOS = { ella: 1, prueba: 1, jaider: 1, admin: 1 };
let usrCache_ = null;
function usrLoad_() {
  if (usrCache_) return usrCache_;
  try { const v = PropertiesService.getScriptProperties().getProperty(USR_PROP); const d = v ? JSON.parse(v) : []; usrCache_ = Array.isArray(d) ? d : []; }
  catch (e) { usrCache_ = []; }
  return usrCache_;
}
function usrSave_(list) { usrCache_ = list; PropertiesService.getScriptProperties().setProperty(USR_PROP, JSON.stringify(list)); }
function usrByCode_(code) {
  const c = proNorm(code);
  if (!c) return null;
  return usrLoad_().filter(function (r) { return !r.revoked && !usrVencido_(r) && proNorm(r.code) === c; })[0] || null;
}
// v24: vencimiento y permisos
function usrVencido_(r) { return Number(r.expiresAt) > 0 && Number(r.expiresAt) <= Date.now(); }
const PERMS_TODOS = { ver: true, chat: true, msgs: true, ia: true };
function usrPerms_(r) {
  const p = Object.assign({}, PERMS_TODOS, (r && r.perms) || {});
  if (r && !r.perms && r.share === false) p.ver = false;      // personas creadas en v23
  Object.keys(PERMS_TODOS).forEach(function (k) { p[k] = p[k] !== false && p[k] !== 'false'; });
  return p;
}
function permsIn_(x, base) {
  const p = Object.assign({}, base || PERMS_TODOS);
  if (x && typeof x === 'object') Object.keys(PERMS_TODOS).forEach(function (k) { if (k in x) p[k] = x[k] !== false && x[k] !== 'false'; });
  return p;
}
// ¿Esta persona (la que llama desde su app) tiene el permiso? Ella, prueba y Jaider: siempre.
function puede_(body, role, k) {
  if (role === 'admin') return true;
  const r = usrByCode_(body.code);
  return !r || usrPerms_(r)[k];
}
// Desde la app de Jaider: ¿la persona elegida tiene el permiso?
function puedeDestino_(uid, k) { const r = usrById_(uid); return !r || usrPerms_(r)[k]; }
const NO_PERM = { chat: 'El chat no está activado para ti.', msgs: 'Los mensajes no están activados.', ia: 'La IA y la copia en la nube no están activadas para ti. Pídeselo a Jaider.', ver: 'Jaider no tiene registros compartidos contigo.' };
function exigir_(body, role, k) { if (!puede_(body, role, k)) throw new Error(NO_PERM[k]); }
function usrById_(id) {
  id = String(id || '');
  if (!id || USR_RESERVADOS[id]) return null;
  return usrLoad_().filter(function (r) { return r.id === id; })[0] || null;
}
function usrNewCode_(list) {
  const pro = proLoad();
  for (let t = 0; t < 50; t++) {
    let c = 'PE';
    for (let i = 0; i < 8; i++) c += PRO_LETRAS.charAt(Math.floor(Math.random() * PRO_LETRAS.length));
    const usado = list.some(function (x) { return proNorm(x.code) === c; }) || pro.some(function (x) { return proNorm(x.code) === c; });
    if (!usado && c !== proNorm(CODIGO_ELLA) && c !== proNorm(CODIGO_ADMIN)) return c.slice(0, 2) + '-' + c.slice(2, 6) + '-' + c.slice(6);
  }
  throw new Error('No se pudo generar un código');
}
function usrPublic_(x) {
  const p = usrPerms_(x);
  return { id: x.id, name: x.name, code: x.code, createdAt: x.createdAt || 0, revoked: !!x.revoked, share: p.ver,
    app: x.app === 'libre' ? 'libre' : 'ella', perms: p, expiresAt: Number(x.expiresAt) || 0, expired: usrVencido_(x),
    lastUse: x.lastUse || 0, lastSync: x.lastSync || 0 };
}
function usrTouch_(id, fields) {
  try {
    withLock(function () {
      usrCache_ = null;
      const list = usrLoad_();
      list.forEach(function (r) { if (r.id === id) Object.keys(fields).forEach(function (k) { r[k] = fields[k]; }); });
      usrSave_(list);
    });
  } catch (e) { }
}
function usrRootFolder_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('USR_FOLDER_ID');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) { } }
  const it = DriveApp.getRootFolder().getFoldersByName(USR_ROOT_NAME);
  const f = it.hasNext() ? it.next() : DriveApp.getRootFolder().createFolder(USR_ROOT_NAME);
  props.setProperty('USR_FOLDER_ID', f.getId());
  return f;
}
// Carpeta privada de una persona (se busca por id; si Jaider le cambió el nombre, sigue siendo la misma)
function usrFolder_(x) {
  if (x.folderId) { try { const f = DriveApp.getFolderById(x.folderId); if (!f.isTrashed || !f.isTrashed()) return f; } catch (e) { } }
  const root = usrRootFolder_(), suf = ' (' + x.id + ')';
  let f = null;
  const it = root.getFolders();
  while (it.hasNext()) { const g = it.next(); if (g.getName().slice(-suf.length) === suf) { f = g; break; } }
  if (!f) f = root.createFolder((String(x.name || 'persona').replace(/[\\/:*?"<>|]+/g, ' ').trim().slice(0, 40) || 'persona') + suf);
  x.folderId = f.getId();
  usrTouch_(x.id, { folderId: x.folderId });
  return f;
}
// Nombre para avisos y mensajes
function usrName_(uid) { if (uid === 'ella') return 'Ella'; if (uid === 'prueba') return 'Prueba'; const r = usrById_(uid); return r ? r.name : 'Alguien'; }

// need: 'any' (Ella o admin) | 'admin'
function requireRole(body, need) {
  if (!EXIGIR_CODIGO && need === 'any') return 'ella';
  const role = roleOf(body.code);
  if (!role) throw new Error('Código inválido o faltante');
  if (need === 'admin' && role !== 'admin') throw new Error('Esta acción es solo para Jaider');
  return role;
}

// ¿Quién está usando la app de Ella? (la de Jaider no manda app:'ella' y siempre ve a "ella")
function fromHerApp(body) { return String(body.app || '') === 'ella'; }
// Usuario de la app de Ella: 'ella', 'prueba' (código admin en la app de Ella) o el id de otra persona (v23).
function userOf(body, role) {
  if (role === 'admin') return fromHerApp(body) ? 'prueba' : adminTarget_(body);
  const r = usrByCode_(body.code);
  return r ? r.id : 'ella';
}
// Desde la app de Jaider: ¿con quién? (user o thread; sin nada -> Ella, como antes)
function adminTarget_(body) {
  const c = [body.thread, body.user].map(function (x) { return String(x || ''); });
  if (c.indexOf('prueba') >= 0) return 'prueba';
  for (let i = 0; i < c.length; i++) if (usrById_(c[i])) return c[i];
  // Una persona que ya se borró: error (para no mostrarle a Jaider los datos de Ella con el nombre de otra)
  if (c.some(function (x) { return /^u[0-9a-f]{9}$/.test(x); })) throw new Error('Esa persona ya no existe');
  return 'ella';
}
const CFG_PERSONA = { file: 'progreso.json', photos: 'Fotos', daily: 'progreso_', legacy: [] };
// Dónde están las cosas de un usuario: Ella y prueba en la carpeta de siempre; las demás personas en la suya.
function space_(uid, folder, body) {
  if (USUARIOS[uid]) return { uid: uid, folder: folder || getTargetFolder(body && body.folderId), cfg: USUARIOS[uid], legacy: true };
  const r = usrById_(uid);
  if (!r) throw new Error('Esa persona ya no existe');
  return { uid: uid, folder: usrFolder_(r), cfg: CFG_PERSONA, legacy: false, rec: r };
}
function spaceOf(body, role, folder) { return space_(userOf(body, role), folder, body); }
function userCfg(body, role) { return USUARIOS[userOf(body, role)] || CFG_PERSONA; }
function photoFolder(folder, cfg, create) {
  const hit = folder.getFoldersByName(cfg.photos);
  if (hit.hasNext()) return hit.next();
  return create ? folder.createFolder(cfg.photos) : null;
}

function withoutTest(x) { const o = JSON.parse(JSON.stringify(x)); delete o.test; return o; }

// En modo prueba, leído/respuesta/importada se guardan en x.test y no tocan lo de Ella.
function viewAsTester(x) {
  const t = x.test || {};
  const out = JSON.parse(JSON.stringify(x));
  delete out.test;
  out.read = !!t.read; out.readAt = t.readAt || null;
  out.imported = !!t.imported; out.importedAt = t.importedAt || null;
  if (t.reply) out.reply = t.reply; else delete out.reply;
  return out;
}

// ============================================================================
// Mensajes
// ============================================================================
function loadMessages(folder) {
  const f = findFile(folder, MSG_FILE);
  if (!f) return [];
  const data = readJsonFile(f);
  return Array.isArray(data) ? data : (data && Array.isArray(data.messages) ? data.messages : []);
}

function saveMessages(folder, list) {
  list.sort(function (a, b) { return (a.timestamp || 0) - (b.timestamp || 0); });
  if (list.length > MAX_MENSAJES) list = list.slice(list.length - MAX_MENSAJES);
  upsertFile(folder, MSG_FILE, JSON.stringify({ updatedAt: new Date().toISOString(), messages: list }, null, 2));
  return list;
}

// ============================================================================
// Pedidos de cambios (app de Ella)
// ============================================================================
function loadRequests(folder) {
  const f = findFile(folder, REQUEST_FILE);
  if (!f) return [];
  const d = readJsonFile(f);
  return (d && Array.isArray(d.requests)) ? d.requests : [];
}

function saveRequests(folder, list) {
  list.sort(function (a, b) { return (a.createdAt || 0) - (b.createdAt || 0); });
  if (list.length > MAX_PEDIDOS) list = list.slice(list.length - MAX_PEDIDOS);
  upsertFile(folder, REQUEST_FILE, JSON.stringify({ updatedAt: new Date().toISOString(), requests: list }, null, 2));
  return list;
}

// ============================================================================
// Chat entre las dos apps (v15)
// ============================================================================
const CHAT_FILE = 'chat_mi_progreso.json';
const MAX_CHAT = 400;
const MAX_TEXTO_CHAT = 1000;
const MAX_MEDIA_BYTES = 20 * 1024 * 1024;
const MAX_THUMB = 12000;
const CHAT_MEDIA_ROOT = 'Mi Progreso - Chat (privado)';
const MEDIA_MIME = /^data:((?:image\/(?:jpeg|png|webp))|(?:video\/(?:mp4|3gpp|webm|quicktime|x-matroska)));base64,(.+)$/;

function chatMediaFolder() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('CHAT_FOLDER_ID');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) { } }
  const it = DriveApp.getRootFolder().getFoldersByName(CHAT_MEDIA_ROOT);
  const f = it.hasNext() ? it.next() : DriveApp.getRootFolder().createFolder(CHAT_MEDIA_ROOT);
  props.setProperty('CHAT_FOLDER_ID', f.getId());
  return f;
}
// Lo que ven las apps de un mensaje (sin el id del archivo en Drive)
function chatOut(m) {
  if (!m || !m.media) return m;
  const o = JSON.parse(JSON.stringify(m));
  delete o.media.fileId;
  if (o.media.once) delete o.media.thumb;
  return o;
}
function chatTrashMedia(m) {
  if (!m || !m.media || !m.media.fileId) return;
  try { DriveApp.getFileById(m.media.fileId).setTrashed(true); } catch (e) { }
  m.media.fileId = '';
}
function chatMediaLabel(m) {
  if (!m.media) return m.text;
  const k = m.media.kind === 'video' ? '🎥 Video' : '📷 Foto';
  return (m.media.once ? k + ' (ver una vez)' : k) + (m.text ? ' · ' + m.text : '');
}

function loadChat(folder) {
  const f = findFile(folder, CHAT_FILE);
  const d = f ? readJsonFile(f) : null;
  const threads = (d && d.threads && typeof d.threads === 'object') ? d.threads : {};
  return { threads: threads };
}

function saveChat(folder, chat) {
  upsertFile(folder, CHAT_FILE, JSON.stringify({ updatedAt: new Date().toISOString(), threads: chat.threads }, null, 2));
  chatBump_();
}
// v20: "revisión" del chat en caché. Cambia con cada escritura; si la app ya la tiene, no hace falta leer Drive.
function chatCache_() { return CacheService.getScriptCache(); }
function chatBump_() { const r = Date.now().toString(36) + Math.random().toString(36).slice(2, 7); try { chatCache_().put('chat_rev', r, 21600); } catch (e) { } return r; }
function chatRev_() { let r = null; try { r = chatCache_().get('chat_rev'); } catch (e) { } return r; }
function chatPresKey_(kind, thread, side) { return 'chat_' + kind + '_' + thread + '_' + side; }
function chatPresence_(w) {
  const c = chatCache_(), o = {};
  try {
    c.put(chatPresKey_('seen', w.thread, w.side), String(Date.now()), 21600);
    const v = c.getAll([chatPresKey_('seen', w.thread, w.other), chatPresKey_('typ', w.thread, w.other), chatPresKey_('got', w.thread, w.other)]);
    o.otherSeen = Number(v[chatPresKey_('seen', w.thread, w.other)]) || 0;
    o.otherTyping = Number(v[chatPresKey_('typ', w.thread, w.other)]) > Date.now() - 6000;
    o.otherGot = Number(v[chatPresKey_('got', w.thread, w.other)]) || 0;
  } catch (e) { }
  return o;
}
function chatGot_(w, ts) { try { if (ts) chatCache_().put(chatPresKey_('got', w.thread, w.side), String(ts), 21600); } catch (e) { } }

function chatThread(chat, name) {
  const t = chat.threads[name] = chat.threads[name] || {};
  if (!Array.isArray(t.messages)) t.messages = [];
  t.read = t.read || {};
  return t;
}

// Quién escribe y en qué conversación: { side: 'jaider'|'ella', other, thread: 'ella'|'prueba' }
function chatWho(body, role) {
  if (fromHerApp(body)) return { side: 'ella', other: 'jaider', thread: userOf(body, role) };
  if (role !== 'admin') throw new Error('Código inválido o faltante');
  return { side: 'jaider', other: 'ella', thread: adminTarget_(body) };
}
// v23: el chat de Ella y el de prueba siguen en la carpeta de siempre; el de otra persona, en la suya.
function chatFolder_(w, folder, body) { return space_(w.thread, folder, body).folder; }
// v24: ¿hay chat con esta persona? (lo revisan las dos puntas)
function chatOn_(w) { return puedeDestino_(w.thread, 'chat'); }
function chatExigir_(w) { if (!chatOn_(w)) throw new Error(w.side === 'jaider' ? usrName_(w.thread) + ' no tiene el chat activado.' : NO_PERM.chat); }

function chatUnread(t, side) {
  const seen = Number(t.read[side]) || 0;
  return t.messages.filter(function (m) { return m.from !== side && Number(m.ts) > seen; });
}

// ============================================================================
// Snacks de Ella (v21): altos en calorías y poco saciantes; ella y Jaider los editan
// ============================================================================
const SNACK_FILE = 'snacks_ella.json';
const MAX_SNACKS = 40;
const SNACKS_BASE = [
  ['d1', 'Batido de leche entera con banano, avena molida y 1 cda de mantequilla de maní', 550, 20, 'Líquido: entra fácil y casi no llena.'],
  ['d2', 'Puñado de maní o mezcla de frutos secos con uvas pasas (50 g)', 300, 10, 'Mucha energía en un bocado pequeño.'],
  ['d3', 'Pan tostado con mantequilla de maní y miel', 350, 10, 'Pocas mordidas, muchas calorías.'],
  ['d4', 'Queso con bocadillo', 300, 12, 'Clásico, rápido y denso en calorías.'],
  ['d5', 'Vaso grande de leche entera achocolatada', 350, 14, 'Se toma en un minuto y no te quita el hambre de la comida.'],
  ['d6', 'Yogur entero con granola y miel', 380, 12, 'Se come rápido y aporta bastante energía.'],
  ['d7', 'Chocolatina con almendras o maní', 250, 5, 'Pequeña y muy calórica.'],
  ['d8', 'Medio aguacate con galletas de soda y sal', 320, 5, 'Grasa buena: muchas calorías sin volumen.'],
  ['d9', 'Dátiles o mango deshidratado (50 g) con un puñado de almendras', 300, 6, 'La fruta seca llena mucho menos que la fresca.'],
  ['d10', 'Avena líquida con leche entera y canela', 300, 11, 'Bebida, no plato: entra sin esfuerzo.'],
  ['d11', 'Galletas con arequipe', 260, 3, 'Para un antojo rápido entre comidas.'],
  ['d12', 'Jugo de fruta en leche entera (mora, guanábana o mango)', 260, 9, 'Líquido y con azúcar natural: no sacia.']
].map(function (x) { return { id: x[0], t: x[1], k: x[2], p: x[3], w: x[4], by: 'app', at: 0 }; });
function snackUser_(body, role) {
  if (fromHerApp(body)) return userOf(body, role);
  if (role !== 'admin') throw new Error('Código inválido o faltante');
  return adminTarget_(body);
}
function snackLoad_(folder, u) {
  const f = findFile(folder, SNACK_FILE);
  const d = f ? readJsonFile(f) : null;
  const all = (d && d.users && typeof d.users === 'object') ? d.users : {};
  const x = all[u];
  return { all: all, list: (x && Array.isArray(x.list)) ? x.list : JSON.parse(JSON.stringify(SNACKS_BASE)), updatedAt: (x && x.updatedAt) || 0 };
}
function snackClean_(it, by, old) {
  it = it || {};
  const t = String(it.t || '').replace(/\s+/g, ' ').trim().slice(0, 120);
  if (!t) throw new Error('Escribe el snack');
  const num = function (v, max) { const n = Math.round(Number(v) || 0); return Math.max(0, Math.min(max, n)); };
  return { id: (old && old.id) || ('s' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36)),
    t: t, k: num(it.k, 3000), p: num(it.p, 300), w: String(it.w || '').trim().slice(0, 100),
    by: (old && old.by) || by, at: (old && old.at) || Date.now(), ...(old ? { editedBy: by, editedAt: Date.now() } : {}) };
}

// ============================================================================
// Códigos Pro (app libre) — v16
// ============================================================================
const PRO_PROP = 'PRO_CODIGOS';
const PRO_ROOT_NAME = 'Mi Progreso - Usuarios Pro';
const PRO_MAX_DIAS = 400;
const PRO_LETRAS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   // sin 0/O ni 1/I

function proLoad() {
  try { const v = PropertiesService.getScriptProperties().getProperty(PRO_PROP); const d = v ? JSON.parse(v) : []; return Array.isArray(d) ? d : []; }
  catch (e) { return []; }
}
function proSave(list) { PropertiesService.getScriptProperties().setProperty(PRO_PROP, JSON.stringify(list)); }
function proNorm(c) { return String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }
function proNewCode(list) {
  for (let t = 0; t < 50; t++) {
    let c = 'MP';
    for (let i = 0; i < 8; i++) c += PRO_LETRAS.charAt(Math.floor(Math.random() * PRO_LETRAS.length));
    if (!list.some(function (x) { return proNorm(x.code) === c; })) return c.slice(0, 2) + '-' + c.slice(2, 6) + '-' + c.slice(6);
  }
  throw new Error('No se pudo generar un código');
}
function proStatus(x) { return x.revoked ? 'revocado' : (Number(x.expiresAt) <= Date.now() ? 'vencido' : 'activo'); }
function proPublic(x) {
  return { id: x.id, name: x.name, code: x.code, createdAt: x.createdAt, expiresAt: x.expiresAt, revoked: !!x.revoked,
    status: proStatus(x), lastUse: x.lastUse || 0, lastBackup: x.lastBackup || 0,
    device: !!x.device, deviceAt: x.deviceAt || 0, blockedAt: x.blockedAt || 0 };
}
// Carpeta raíz de los usuarios Pro: en "Mi unidad", fuera de la carpeta compartida.
function proRootFolder() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('PRO_FOLDER_ID');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) { } }
  const it = DriveApp.getRootFolder().getFoldersByName(PRO_ROOT_NAME);
  const f = it.hasNext() ? it.next() : DriveApp.getRootFolder().createFolder(PRO_ROOT_NAME);
  props.setProperty('PRO_FOLDER_ID', f.getId());
  return f;
}
function proFolder(x) {
  const root = proRootFolder();
  const name = (String(x.name || 'usuario').replace(/[\\/:*?"<>|]+/g, ' ').trim().slice(0, 40) || 'usuario') + ' (' + x.id + ')';
  const it = root.getFoldersByName(name);
  return it.hasNext() ? it.next() : root.createFolder(name);
}
// Valida el código Pro que manda la app libre; devuelve el registro (y la lista para guardar cambios).
function requirePro(body) {
  const c = proNorm(body.pro);
  if (!c) throw new Error('Falta el código Pro');
  const list = proLoad();
  const x = list.filter(function (r) { return proNorm(r.code) === c; })[0];
  if (!x) { const e = new Error('Código Pro inválido'); throw e; }
  if (x.revoked) throw new Error('Este código Pro fue desactivado');
  if (Number(x.expiresAt) <= Date.now()) throw new Error('Tu código Pro venció');
  const dev = proDevice(body);
  if (!dev) throw new Error('Actualiza Mi Progreso Libre para usar tu código Pro');
  if (x.device && x.device !== dev) {
    proTouch(x.id, { blockedAt: Date.now() });   // Jaider ve que alguien más lo intentó usar
    throw new Error('Este código Pro ya está en uso en otro teléfono');
  }
  return { x: x, list: list, device: dev };
}
function proDevice(body) { return String(body.device || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64); }
function proTouch(id, fields) {
  withLock(function () {
    const list = proLoad();
    list.forEach(function (r) { if (r.id === id) Object.keys(fields).forEach(function (k) { r[k] = fields[k]; }); });
    proSave(list);
  });
}

// ============================================================================
// Acciones
// ============================================================================
const ACTIONS = {
  verify_code: function (body) {
    const role = roleOf(body.code);
    if (!role) {
      const c = proNorm(body.code), x = c && usrLoad_().filter(function (r) { return proNorm(r.code) === c; })[0];
      if (x && x.revoked) return { ok: false, error: 'Este código fue desactivado. Pídele uno nuevo a Jaider.' };
      if (x && usrVencido_(x)) return { ok: false, error: 'Tu código venció. Pídele a Jaider que lo renueve.' };
      return { ok: false, error: 'Código inválido' };
    }
    const out = Object.assign({ ok: true, role: role, user: userOf(body, role) }, infoClaves_());
    const r = role !== 'admin' && usrByCode_(body.code);
    if (r) {
      const p = usrPerms_(r);
      Object.assign(out, { name: r.name, share: p.ver, perms: p, app: r.app === 'libre' ? 'libre' : 'ella', expiresAt: Number(r.expiresAt) || 0 });
      usrTouch_(r.id, { lastUse: Date.now() });
    } else if (role !== 'admin' || fromHerApp(body)) out.perms = Object.assign({}, PERMS_TODOS);
    return out;
  },

  // v19: la app manda la consulta y el servidor la hace con sus claves (nunca salen de aquí).
  ai: function (body) {
    if (body.code) exigir_(body, roleOf(body.code), 'ia');
    const quien = aiQuien_(body);
    const payload = aiValidar_(body.req);
    aiLimite_(quien);
    let r;
    try { r = aiLlamar_(payload, groqKeys_(), function (u, o) { return UrlFetchApp.fetch(u, o); }); }
    catch (e) {
      if (esFaltaPermiso_(e)) throw new Error(AVISO_PERMISO_IA);
      throw e;
    }
    return { ok: true, status: r.status, body: r.body, retryAfter: r.retryAfter || 0 };
  },

  sync_her_data: function (body, folder) {
    const role = requireRole(body, 'any');
    exigir_(body, role, 'ia');
    const sp = spaceOf(body, role, folder), u = sp.cfg;
    if (body.payload == null) throw new Error('Falta payload');
    const content = toContent(body.payload);
    const f = withLock(function () {
      const master = upsertFile(sp.folder, u.file, content);
      if (body.keepDaily !== false) {
        upsertFile(getHistoryFolder(sp.folder), u.daily + todayStr() + '.json', content);
      }
      return master;
    });
    if (sp.rec) usrTouch_(sp.uid, { lastSync: Date.now(), lastUse: Date.now() });
    return { ok: true, user: sp.uid, fileId: f.getId(), updatedAt: new Date().toISOString() };
  },

  // Jaider lo revisa desde su app; Ella lo usa para restaurar su respaldo si cambia de teléfono.
  get_her_data: function (body, folder) {
    const role = requireRole(body, 'any');
    exigir_(body, role, 'ia');
    const sp = spaceOf(body, role, folder), u = sp.cfg;
    const f = newestFile(sp.folder, [u.file].concat(u.legacy));
    if (!f) return { ok: false, error: sp.uid === 'prueba' ? 'Aún no hay respaldo de prueba.' : sp.rec ? sp.rec.name + ' aún no ha sincronizado su progreso.' : 'Ella aún no ha sincronizado su progreso.' };
    return { ok: true, user: sp.uid, file: f.getName(), updatedAt: f.getLastUpdated().toISOString(), payload: readJsonFile(f) };
  },

  sync_my_data: function (body, folder) {
    requireRole(body, 'admin');
    if (body.payload == null) throw new Error('Falta payload');
    const f = withLock(function () { return upsertFile(folder, MY_FILE, toContent(body.payload)); });
    return { ok: true, fileId: f.getId(), updatedAt: new Date().toISOString() };
  },

  get_my_data: function (body, folder) {
    const role = requireRole(body, 'any');
    if (!puede_(body, role, 'ver')) return { ok: false, error: NO_PERM.ver };
    const f = newestFile(folder, [MY_FILE].concat(MY_LEGACY_FILES));
    if (!f) return { ok: false, error: 'Jaider aún no tiene registros compartidos.' };
    const full = readJsonFile(f);
    const shared = { readOnly: true, owner: 'jaider', backupCreated: (full && full.backupCreated) || f.getLastUpdated().toISOString() };
    if (full && typeof full === 'object') {
      CAMPOS_COMPARTIDOS_JAIDER.forEach(function (k) { if (full[k] !== undefined) shared[k] = full[k]; });
    }
    return { ok: true, updatedAt: f.getLastUpdated().toISOString(), payload: shared };
  },

  send_message: function (body, folder) {
    requireRole(body, 'admin');
    const sp0 = spaceOf(body, 'admin', folder); folder = sp0.folder;
    if (!puedeDestino_(sp0.uid, 'msgs')) throw new Error(usrName_(sp0.uid) + ' no tiene activados los mensajes y rutinas.');
    const text = String(body.text || '').trim().slice(0, MAX_TEXTO_MENSAJE);
    if (!text) throw new Error('El mensaje está vacío');
    const msg = {
      id: String(body.id || Utilities.getUuid()),
      text: text,
      timestamp: Number(body.timestamp) || Date.now(),
      from: 'jaider',
      read: false,
      readAt: null
    };
    withLock(function () {
      const list = loadMessages(folder).filter(function (m) { return m.id !== msg.id; });
      list.push(msg);
      saveMessages(folder, list);
    });
    return { ok: true, message: msg };
  },

  get_messages: function (body, folder) {
    const role = requireRole(body, 'any');
    if (!puede_(body, role, 'msgs')) return { ok: true, off: true, pending: 0, messages: [] };
    const sp = spaceOf(body, role, folder); folder = sp.folder;
    const tester = sp.uid === 'prueba';
    let all = loadMessages(folder);
    all = all.map(tester ? viewAsTester : withoutTest);
    // Ella recibe solo los pendientes; Jaider (admin, desde su app) ve todos con su estado de lectura.
    const includeRead = (role === 'admin' && !fromHerApp(body)) || body.includeRead === true || body.includeRead === 'true';
    const list = includeRead ? all : all.filter(function (m) { return !m.read; });
    return { ok: true, pending: all.filter(function (m) { return !m.read; }).length, messages: list.slice().reverse() };
  },

  mark_read: function (body, folder) {
    const role = requireRole(body, 'any');
    const sp = spaceOf(body, role, folder); folder = sp.folder;
    const tester = sp.uid === 'prueba';
    let ids = body.ids || (body.id ? [body.id] : []);
    if (typeof ids === 'string') ids = ids.split(',');
    ids = ids.map(String);
    const now = new Date().toISOString();
    let n = 0;
    withLock(function () {
      const list = loadMessages(folder);
      list.forEach(function (m) {
        if (!(ids.indexOf(String(m.id)) >= 0 || body.all === true)) return;
        if (tester) {
          m.test = m.test || {};
          if (!m.test.read) { m.test.read = true; m.test.readAt = now; n++; }
        } else if (!m.read) { m.read = true; m.readAt = now; n++; }
      });
      saveMessages(folder, list);
    });
    return { ok: true, marked: n };
  },

  delete_message: function (body, folder) {
    requireRole(body, 'admin');
    folder = spaceOf(body, 'admin', folder).folder;
    let removed = 0;
    withLock(function () {
      const list = loadMessages(folder);
      const keep = list.filter(function (m) { return String(m.id) !== String(body.id); });
      removed = list.length - keep.length;
      saveMessages(folder, keep);
    });
    return { ok: true, removed: removed };
  },

  send_reply: function (body, folder) {
    const role = requireRole(body, 'any');
    const sp = spaceOf(body, role, folder); folder = sp.folder;
    const tester = sp.uid === 'prueba';
    const emoji = String(body.emoji || '').slice(0, 8);
    const text = String(body.text || '').trim().slice(0, MAX_TEXTO_MENSAJE);
    if (!emoji && !text) throw new Error('Respuesta vacía');
    let found = null;
    withLock(function () {
      const list = loadMessages(folder);
      list.forEach(function (m) {
        if (String(m.id) === String(body.id)) {
          const reply = { emoji: emoji, text: text, at: new Date().toISOString() };
          const target = tester ? (m.test = m.test || {}) : m;
          target.reply = reply;
          if (!target.read) { target.read = true; target.readAt = reply.at; }
          found = tester ? viewAsTester(m) : withoutTest(m);
        }
      });
      saveMessages(folder, list);
    });
    if (!found) return { ok: false, error: 'Mensaje no encontrado' };
    return { ok: true, message: found };
  },

  send_routine: function (body, folder) {
    requireRole(body, 'admin');
    const sp0 = spaceOf(body, 'admin', folder); folder = sp0.folder;
    if (!puedeDestino_(sp0.uid, 'msgs')) throw new Error(usrName_(sp0.uid) + ' no tiene activados los mensajes y rutinas.');
    const r = body.routine || {};
    const items = (Array.isArray(r.items) ? r.items : []).map(String).map(function (x) { return x.trim().slice(0, 70); }).filter(String).slice(0, 20);
    if (!items.length) throw new Error('La rutina no tiene ejercicios');
    const presc = {};
    items.forEach(function (n) {
      const p = (r.prescription || {})[n] || {};
      presc[n] = { sets: Math.max(1, Math.min(10, Number(p.sets) || 3)), reps: String(p.reps || '8–12').slice(0, 12), rir: String(p.rir || '1–2').slice(0, 8) };
    });
    const routine = {
      id: String(r.id || Utilities.getUuid()),
      title: String(r.title || 'Rutina de Jaider').trim().slice(0, 60),
      note: String(r.note || '').trim().slice(0, 400),
      items: items, prescription: presc,
      sentAt: new Date().toISOString(), imported: false, importedAt: null
    };
    withLock(function () {
      const f = findFile(folder, ROUTINE_FILE);
      let list = f ? (readJsonFile(f).routines || []) : [];
      list = list.filter(function (x) { return x.id !== routine.id; });
      list.push(routine);
      if (list.length > MAX_RUTINAS) list = list.slice(list.length - MAX_RUTINAS);
      upsertFile(folder, ROUTINE_FILE, JSON.stringify({ updatedAt: new Date().toISOString(), routines: list }, null, 2));
    });
    return { ok: true, routine: routine };
  },

  get_routines: function (body, folder) {
    const role = requireRole(body, 'any');
    if (!puede_(body, role, 'msgs')) return { ok: true, off: true, routines: [] };
    const sp = spaceOf(body, role, folder); folder = sp.folder;
    const tester = sp.uid === 'prueba';
    const f = findFile(folder, ROUTINE_FILE);
    let all = f ? (readJsonFile(f).routines || []) : [];
    all = all.map(tester ? viewAsTester : withoutTest);
    const list = (role === 'admin' && !fromHerApp(body)) ? all : all.filter(function (r) { return !r.imported; });
    return { ok: true, routines: list.slice().reverse() };
  },

  ack_routine: function (body, folder) {
    const role = requireRole(body, 'any');
    const sp = spaceOf(body, role, folder); folder = sp.folder;
    const tester = sp.uid === 'prueba';
    let ids = body.ids || (body.id ? [body.id] : []);
    if (typeof ids === 'string') ids = ids.split(',');
    ids = ids.map(String);
    let n = 0;
    withLock(function () {
      const f = findFile(folder, ROUTINE_FILE);
      if (!f) return;
      const list = readJsonFile(f).routines || [];
      list.forEach(function (r) {
        if (ids.indexOf(String(r.id)) < 0) return;
        const target = tester ? (r.test = r.test || {}) : r;
        if (!target.imported) { target.imported = true; target.importedAt = new Date().toISOString(); n++; }
      });
      upsertFile(folder, ROUTINE_FILE, JSON.stringify({ updatedAt: new Date().toISOString(), routines: list }, null, 2));
    });
    return { ok: true, acked: n };
  },

  delete_routine: function (body, folder) {
    requireRole(body, 'admin');
    folder = spaceOf(body, 'admin', folder).folder;
    let removed = 0;
    withLock(function () {
      const f = findFile(folder, ROUTINE_FILE);
      if (!f) return;
      const list = readJsonFile(f).routines || [];
      const keep = list.filter(function (r) { return String(r.id) !== String(body.id); });
      removed = list.length - keep.length;
      upsertFile(folder, ROUTINE_FILE, JSON.stringify({ updatedAt: new Date().toISOString(), routines: keep }, null, 2));
    });
    return { ok: true, removed: removed };
  },

  send_request: function (body, folder) {
    const role = requireRole(body, 'any');
    const text = String(body.text || '').trim().slice(0, MAX_TEXTO_MENSAJE);
    if (!text) throw new Error('El pedido está vacío');
    const sp = spaceOf(body, role, folder); folder = sp.folder;
    const user = sp.uid;
    const req = {
      id: String(body.id || Utilities.getUuid()).slice(0, 64),
      user: user,
      text: text,
      createdAt: Number(body.createdAt) || Date.now(),
      status: 'pendiente',
      note: '',
      updatedAt: null
    };
    let saved = req;
    withLock(function () {
      const list = loadRequests(folder);
      const prev = list.filter(function (r) { return String(r.id) === req.id; })[0];
      if (prev) { saved = prev; return; }          // reintento de un envío que ya llegó
      list.push(req);
      saveRequests(folder, list);
    });
    return { ok: true, request: saved };
  },

  get_requests: function (body, folder) {
    const role = requireRole(body, 'any');
    const sp = spaceOf(body, role, folder);
    let list = loadRequests(sp.folder);
    if (fromHerApp(body) || role !== 'admin' || !sp.legacy) {
      const user = sp.uid;
      list = list.filter(function (r) { return (r.user || 'ella') === user; });
    }
    return { ok: true, user: sp.uid, requests: list.slice().reverse() };
  },

  update_request: function (body, folder) {
    requireRole(body, 'admin');
    folder = spaceOf(body, 'admin', folder).folder;
    const status = String(body.status || '');
    if (ESTADOS_PEDIDO.indexOf(status) < 0) throw new Error('Estado inválido');
    let found = null;
    withLock(function () {
      const list = loadRequests(folder);
      list.forEach(function (r) {
        if (String(r.id) !== String(body.id)) return;
        r.status = status;
        if (body.note !== undefined) r.note = String(body.note || '').slice(0, MAX_TEXTO_MENSAJE);
        r.updatedAt = Date.now();
        found = r;
      });
      if (found) saveRequests(folder, list);
    });
    if (!found) return { ok: false, error: 'Pedido no encontrado' };
    return { ok: true, request: found };
  },

  delete_request: function (body, folder) {
    const role = requireRole(body, 'any');
    const sp = spaceOf(body, role, folder); folder = sp.folder;
    const user = sp.uid;
    const admin = role === 'admin' && !fromHerApp(body);
    let removed = 0;
    withLock(function () {
      const list = loadRequests(folder);
      const keep = list.filter(function (r) {
        return !(String(r.id) === String(body.id) && (admin || (r.user || 'ella') === user));
      });
      removed = list.length - keep.length;
      if (removed) saveRequests(folder, keep);
    });
    return { ok: true, removed: removed };
  },

  backup_photo: function (body, folder) {
    const role0 = requireRole(body, 'any'); exigir_(body, role0, 'ia');
    const sp = spaceOf(body, role0, folder), u = sp.cfg; folder = sp.folder;
    const id = String(body.id || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40);
    const date = String(body.date || '').replace(/[^0-9-]/g, '').slice(0, 10);
    const m = String(body.dataUrl || '').match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
    if (!id || !m) throw new Error('Foto inválida');
    const bytes = Utilities.base64Decode(m[2]);
    if (bytes.length > MAX_FOTO_BYTES) throw new Error('La foto es demasiado grande');
    const ext = m[1] === 'image/png' ? 'png' : m[1] === 'image/webp' ? 'webp' : 'jpg';
    const name = 'foto_' + (date || 'sin-fecha') + '_' + id + '.' + ext;
    const file = withLock(function () {
      const dir = photoFolder(folder, u, true);
      const old = dir.getFilesByName(name);
      while (old.hasNext()) old.next().setTrashed(true);
      return dir.createFile(Utilities.newBlob(bytes, m[1], name));
    });
    return { ok: true, id: id, fileId: file.getId() };
  },

  list_photos: function (body, folder) {
    const sp = spaceOf(body, requireRole(body, 'any'), folder);
    const dir = photoFolder(sp.folder, sp.cfg, false);
    const out = [];
    if (dir) {
      const it = dir.getFiles();
      while (it.hasNext()) {
        const f = it.next();
        const mm = f.getName().match(/^foto_([0-9-]+|sin-fecha)_([a-zA-Z0-9_-]+)\.\w+$/);
        if (mm) out.push({ id: mm[2], date: mm[1] === 'sin-fecha' ? '' : mm[1] });
      }
    }
    return { ok: true, photos: out };
  },

  get_photo: function (body, folder) {
    const sp = spaceOf(body, requireRole(body, 'any'), folder);
    const dir = photoFolder(sp.folder, sp.cfg, false);
    const id = String(body.id || '').replace(/[^a-zA-Z0-9_-]/g, '');
    if (!id || !dir) return { ok: false, error: 'No hay fotos respaldadas.' };
    const it = dir.getFiles();
    while (it.hasNext()) {
      const f = it.next();
      if (f.getName().indexOf('_' + id + '.') > 0) {
        const b = f.getBlob();
        return { ok: true, id: id, dataUrl: 'data:' + b.getContentType() + ';base64,' + Utilities.base64Encode(b.getBytes()) };
      }
    }
    return { ok: false, error: 'Foto no encontrada' };
  },

  chat_send: function (body, folder) {
    const w = chatWho(body, requireRole(body, 'any'));
    chatExigir_(w);
    folder = chatFolder_(w, folder, body);
    const text = String(body.text || '').trim().slice(0, MAX_TEXTO_CHAT);
    const id = String(body.id || Utilities.getUuid()).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || Utilities.getUuid();
    let media = null, mediaBytes = null;
    if (body.media && body.media.dataUrl) {
      const mm = String(body.media.dataUrl).match(MEDIA_MIME);
      if (!mm) throw new Error('Formato de archivo no permitido');
      const kind = mm[1].indexOf('video/') === 0 ? 'video' : 'image';
      const bytes = Utilities.base64Decode(mm[2]);
      if (bytes.length > MAX_MEDIA_BYTES) throw new Error('El archivo pesa más de 20 MB');
      mediaBytes = bytes;
      const ext = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'video/mp4': 'mp4', 'video/3gpp': '3gp', 'video/webm': 'webm', 'video/quicktime': 'mov', 'video/x-matroska': 'mkv' }[mm[1]] || 'bin';
      const once = body.media.once === true || body.media.once === 'true';
      const thumb = String(body.media.thumb || '');
      media = { kind: kind, once: once, mime: mm[1], size: bytes.length, ext: ext,
        thumb: (!once && /^data:image\/jpeg;base64,/.test(thumb) && thumb.length <= MAX_THUMB) ? thumb : '',
        w: Number(body.media.w) || 0, h: Number(body.media.h) || 0, dur: Number(body.media.dur) || 0, opened: 0, fileId: '' };
    }
    if (!text && !media) throw new Error('El mensaje está vacío');
    let saved = null;
    withLock(function () {
      const chat = loadChat(folder), t = chatThread(chat, w.thread);
      saved = t.messages.filter(function (m) { return m.id === id; })[0] || null;
      if (saved) return;                                   // reintento de un envío que ya llegó
      if (media) {
        const f = chatMediaFolder().createFile(Utilities.newBlob(mediaBytes, media.mime, 'chat_' + w.thread + '_' + id + '.' + media.ext));
        media.fileId = f.getId();
      }
      const last = t.messages.length ? Number(t.messages[t.messages.length - 1].ts) || 0 : 0;
      saved = { id: id, from: w.side, text: text, ts: Math.max(Date.now(), last + 1) };
      if (media) saved.media = media;
      const rid = body.reply && String(body.reply.id || '');
      const orig = rid && t.messages.filter(function (m) { return m.id === rid; })[0];
      if (orig) saved.reply = { id: orig.id, from: orig.from, text: orig.media ? chatMediaLabel(orig).slice(0, 120) : String(orig.text || '').slice(0, 120) };
      t.messages.push(saved);
      if (t.messages.length > MAX_CHAT) { t.messages.slice(0, t.messages.length - MAX_CHAT).forEach(chatTrashMedia); t.messages = t.messages.slice(t.messages.length - MAX_CHAT); }
      t.read[w.side] = saved.ts;                            // lo mío cuenta como leído
      saveChat(folder, chat);
    });
    const out = { ok: true, thread: w.thread, message: chatOut(saved), rev: chatRev_() };
    if (body.since != null) {                               // v20: de una vez, lo nuevo del chat
      const t2 = chatThread(loadChat(folder), w.thread), since = Number(body.since) || 0;
      out.messages = t2.messages.filter(function (m) { return Number(m.ts) > since; }).slice(-200).map(chatOut);
      out.readByOther = Number(t2.read[w.other]) || 0;
      out.unread = chatUnread(t2, w.side).length;
      try { chatCache_().remove(chatPresKey_('typ', w.thread, w.side)); } catch (e) { }
      Object.assign(out, chatPresence_(w));
    }
    return out;
  },

  chat_media: function (body, folder) {
    const w = chatWho(body, requireRole(body, 'any'));
    chatExigir_(w);
    folder = chatFolder_(w, folder, body);
    const id = String(body.id || '');
    let out = null, err = '';
    withLock(function () {
      const chat = loadChat(folder), t = chatThread(chat, w.thread);
      const m = t.messages.filter(function (x) { return x.id === id; })[0];
      if (!m || !m.media) { err = 'Archivo no encontrado'; return; }
      if (m.media.once) {
        if (m.from === w.side) { err = 'Lo enviaste para ver una vez: solo lo puede abrir la otra persona'; return; }
        if (m.media.opened) { err = 'Ya lo abriste (era para ver una vez)'; return; }
      }
      if (!m.media.fileId) { err = 'El archivo ya no está disponible'; return; }
      let blob;
      try { blob = DriveApp.getFileById(m.media.fileId).getBlob(); } catch (e) { err = 'El archivo ya no está disponible'; return; }
      out = { kind: m.media.kind, once: !!m.media.once, mime: m.media.mime, dataUrl: 'data:' + m.media.mime + ';base64,' + Utilities.base64Encode(blob.getBytes()) };
      if (m.media.once) { m.media.opened = Date.now(); chatTrashMedia(m); saveChat(folder, chat); }
    });
    if (!out) return { ok: false, error: err || 'No se pudo abrir' };
    return { ok: true, id: id, media: out };
  },

  chat_list: function (body, folder) {
    const w = chatWho(body, requireRole(body, 'any'));
    if (!chatOn_(w)) return { ok: true, off: true, thread: w.thread, me: w.side, messages: [], unread: 0, readByOther: 0, readByMe: 0, rev: '' };
    const pres = chatPresence_(w);
    // v20: si la app ya tiene la última revisión, no se abre Drive
    const rev = chatRev_();
    if (rev && body.rev && String(body.rev) === rev) return Object.assign({ ok: true, thread: w.thread, me: w.side, unchanged: true, rev: rev, messages: [] }, pres);
    folder = chatFolder_(w, folder, body);
    let chat = loadChat(folder), t = chatThread(chat, w.thread);
    const lastTs = t.messages.length ? Number(t.messages[t.messages.length - 1].ts) || 0 : 0;
    if (body.markRead && lastTs > (Number(t.read[w.side]) || 0) && chatUnread(t, w.side).length) {
      withLock(function () {
        chat = loadChat(folder); t = chatThread(chat, w.thread);
        const lt = t.messages.length ? Number(t.messages[t.messages.length - 1].ts) || 0 : 0;
        if (lt > (Number(t.read[w.side]) || 0)) { t.read[w.side] = lt; saveChat(folder, chat); }
      });
    }
    chatGot_(w, lastTs);
    const since = Number(body.since) || 0;
    // Además de los nuevos, los "ver una vez" que se abrieron hace poco (para que quien los mandó vea "Abierta")
    const list = t.messages.filter(function (m) { return Number(m.ts) > since || (m.media && m.media.once && Number(m.media.opened) > Date.now() - 3 * 86400000); }).slice(-200).map(chatOut);
    return {
      ok: true, thread: w.thread, me: w.side, messages: list,
      unread: chatUnread(t, w.side).length,
      readByOther: Number(t.read[w.other]) || 0,
      readByMe: Number(t.read[w.side]) || 0,
      rev: chatRev_() || chatBump_(),
      otherSeen: pres.otherSeen || 0, otherTyping: !!pres.otherTyping, otherGot: pres.otherGot || 0
    };
  },

  snacks_get: function (body, folder) {
    const role = requireRole(body, 'any'), u = snackUser_(body, role);
    folder = space_(u, folder, body).folder;
    const s = snackLoad_(folder, u);
    return { ok: true, user: u, list: s.list, updatedAt: s.updatedAt };
  },

  snacks_edit: function (body, folder) {
    const role = requireRole(body, 'any'), u = snackUser_(body, role);
    folder = space_(u, folder, body).folder;
    const by = fromHerApp(body) ? 'ella' : 'jaider';
    const op = String(body.op || '');
    let out = null;
    withLock(function () {
      const s = snackLoad_(folder, u);
      let list = s.list;
      if (op === 'add') {
        if (list.length >= MAX_SNACKS) throw new Error('La lista ya tiene ' + MAX_SNACKS + ' snacks: quita alguno primero');
        list.push(snackClean_(body.item, by, null));
      } else if (op === 'upd') {
        const id = String((body.item && body.item.id) || body.id || '');
        const i = list.findIndex(function (x) { return x.id === id; });
        if (i < 0) throw new Error('Ese snack ya no está en la lista');
        list[i] = snackClean_(body.item, by, list[i]);
      } else if (op === 'del') {
        const id = String(body.id || '');
        list = list.filter(function (x) { return x.id !== id; });
      } else if (op === 'reset') {
        list = JSON.parse(JSON.stringify(SNACKS_BASE));
      } else throw new Error('Operación inválida');
      s.all[u] = { list: list, updatedAt: Date.now() };
      upsertFile(folder, SNACK_FILE, JSON.stringify({ updatedAt: new Date().toISOString(), users: s.all }, null, 2));
      out = { ok: true, user: u, list: list, updatedAt: s.all[u].updatedAt };
    });
    return out;
  },

  // v20: "escribiendo…" (solo caché, no toca Drive)
  chat_typing: function (body) {
    const w = chatWho(body, requireRole(body, 'any'));
    if (!chatOn_(w)) return { ok: true, off: true };
    try { chatCache_().put(chatPresKey_('typ', w.thread, w.side), String(Date.now()), 30); } catch (e) { }
    return { ok: true };
  },

  chat_read: function (body, folder) {
    const w = chatWho(body, requireRole(body, 'any'));
    chatExigir_(w);
    folder = chatFolder_(w, folder, body);
    let at = 0;
    withLock(function () {
      const chat = loadChat(folder), t = chatThread(chat, w.thread);
      const lastTs = t.messages.length ? Number(t.messages[t.messages.length - 1].ts) || 0 : 0;
      const upTo = Math.min(Number(body.upTo) || lastTs, lastTs);
      at = Math.max(Number(t.read[w.side]) || 0, upTo);
      if (at !== (Number(t.read[w.side]) || 0)) { t.read[w.side] = at; saveChat(folder, chat); }
    });
    return { ok: true, readAt: at };
  },

  pro_create: function (body) {
    requireRole(body, 'admin');
    const name = String(body.name || '').trim().slice(0, 40);
    if (!name) throw new Error('Escribe el nombre de la persona');
    const days = Math.max(1, Math.min(PRO_MAX_DIAS, Math.round(Number(body.days) || 30)));
    let rec = null;
    withLock(function () {
      const list = proLoad();
      rec = { id: Utilities.getUuid().replace(/-/g, '').slice(0, 8), name: name, code: proNewCode(list),
        createdAt: Date.now(), expiresAt: Date.now() + days * 86400000, revoked: false, lastUse: 0, lastBackup: 0 };
      list.push(rec);
      proSave(list);
    });
    return { ok: true, pro: proPublic(rec) };
  },

  pro_list: function (body) {
    requireRole(body, 'admin');
    return { ok: true, codes: proLoad().map(proPublic).reverse() };
  },

  pro_update: function (body) {
    requireRole(body, 'admin');
    let found = null;
    withLock(function () {
      const list = proLoad();
      list.forEach(function (r) {
        if (r.id !== String(body.id)) return;
        if (body.revoke === true || body.revoke === 'true') r.revoked = true;
        if (body.revoke === false || body.revoke === 'false') r.revoked = false;
        if (body.release === true || body.release === 'true') { r.device = ''; r.deviceAt = 0; r.blockedAt = 0; }
        const d = Number(body.days) || 0;
        if (d) r.expiresAt = Math.max(Date.now(), Number(r.expiresAt) || 0) + Math.max(1, Math.min(PRO_MAX_DIAS, d)) * 86400000;
        found = r;
      });
      if (found) proSave(list);
    });
    if (!found) return { ok: false, error: 'Código no encontrado' };
    return { ok: true, pro: proPublic(found) };
  },

  pro_delete: function (body) {
    requireRole(body, 'admin');
    let removed = 0;
    withLock(function () {
      const list = proLoad(), keep = list.filter(function (r) { return r.id !== String(body.id); });
      removed = list.length - keep.length;
      if (removed) proSave(keep);
    });
    return { ok: true, removed: removed };
  },

  pro_verify: function (body) {
    const v = requirePro(body), x = v.x;
    if (!x.device) {
      // Primer teléfono: se amarra (con candado, por si dos lo activan al mismo tiempo)
      let taken = false;
      withLock(function () {
        const list = proLoad(), r = list.filter(function (q) { return q.id === x.id; })[0];
        if (!r) return;
        if (r.device && r.device !== v.device) { taken = true; return; }
        r.device = v.device; r.deviceAt = Date.now();
        proSave(list);
      });
      if (taken) throw new Error('Este código Pro ya está en uso en otro teléfono');
    }
    proTouch(x.id, { lastUse: Date.now() });
    return Object.assign({ ok: true, name: x.name, expiresAt: x.expiresAt }, infoClaves_());
  },

  pro_sync: function (body) {
    const x = requirePro(body).x;
    if (body.payload == null) throw new Error('Falta payload');
    const content = toContent(body.payload);
    if (content.length > 20 * 1024 * 1024) throw new Error('La copia es demasiado grande');
    withLock(function () {
      const dir = proFolder(x);
      upsertFile(dir, 'progreso.json', content);
      upsertFile(getHistoryFolder(dir), 'progreso_' + todayStr() + '.json', content);
    });
    const now = Date.now();
    proTouch(x.id, { lastUse: now, lastBackup: now });
    return { ok: true, updatedAt: new Date(now).toISOString(), expiresAt: x.expiresAt };
  },

  pro_get: function (body) {
    const x = requirePro(body).x;
    const f = findFile(proFolder(x), 'progreso.json');
    if (!f) return { ok: false, error: 'Aún no tienes copia en la nube.' };
    return { ok: true, updatedAt: f.getLastUpdated().toISOString(), payload: readJsonFile(f) };
  },

  // v23: personas de la app de Ella (solo admin)
  usr_create: function (body) {
    requireRole(body, 'admin');
    const name = String(body.name || '').replace(/\s+/g, ' ').trim().slice(0, 40);
    if (!name) throw new Error('Escribe el nombre de la persona');
    let rec = null;
    withLock(function () {
      usrCache_ = null;
      const list = usrLoad_();
      if (list.length >= USR_MAX) throw new Error('Ya hay ' + USR_MAX + ' personas: borra alguna primero');
      let id;
      do { id = 'u' + Utilities.getUuid().replace(/-/g, '').slice(0, 9); } while (list.some(function (r) { return r.id === id; }));
      const perms = permsIn_(body.perms, Object.assign({}, PERMS_TODOS, { ver: body.share !== false && body.share !== 'false' }));
      const dias = Math.max(0, Math.min(PRO_MAX_DIAS, Math.round(Number(body.days) || 0)));
      rec = { id: id, name: name, code: usrNewCode_(list), createdAt: Date.now(), revoked: false, app: body.app === 'libre' ? 'libre' : 'ella',
        perms: perms, share: perms.ver, expiresAt: dias ? Date.now() + dias * 86400000 : 0, lastUse: 0, lastSync: 0 };
      list.push(rec);
      usrSave_(list);
    });
    return { ok: true, user: usrPublic_(rec) };
  },

  usr_list: function (body) {
    requireRole(body, 'admin');
    return { ok: true, users: usrLoad_().map(usrPublic_) };
  },

  usr_update: function (body) {
    requireRole(body, 'admin');
    let found = null;
    withLock(function () {
      usrCache_ = null;
      const list = usrLoad_();
      list.forEach(function (r) {
        if (r.id !== String(body.id)) return;
        const name = String(body.name || '').replace(/\s+/g, ' ').trim().slice(0, 40);
        if (name) r.name = name;
        if (body.revoke === true || body.revoke === 'true') r.revoked = true;
        if (body.revoke === false || body.revoke === 'false') r.revoked = false;
        if (body.share === true || body.share === 'true') { r.perms = Object.assign(usrPerms_(r), { ver: true }); r.share = true; }
        if (body.share === false || body.share === 'false') { r.perms = Object.assign(usrPerms_(r), { ver: false }); r.share = false; }
        if (body.perms && typeof body.perms === 'object') { r.perms = permsIn_(body.perms, usrPerms_(r)); r.share = r.perms.ver; }
        if (body.app === 'ella' || body.app === 'libre') r.app = body.app;
        const d = Math.max(0, Math.min(PRO_MAX_DIAS, Math.round(Number(body.days) || 0)));
        if (d) r.expiresAt = Math.max(Date.now(), Number(r.expiresAt) || 0) + d * 86400000;
        if (body.noExpire === true || body.noExpire === 'true') r.expiresAt = 0;
        if (body.newCode === true || body.newCode === 'true') r.code = usrNewCode_(list);
        found = r;
      });
      if (found) usrSave_(list);
    });
    if (!found) return { ok: false, error: 'Persona no encontrada' };
    return { ok: true, user: usrPublic_(found) };
  },

  usr_delete: function (body) {
    requireRole(body, 'admin');
    let removed = 0;
    withLock(function () {
      usrCache_ = null;
      const list = usrLoad_(), keep = list.filter(function (r) { return r.id !== String(body.id); });
      removed = list.length - keep.length;
      if (removed) usrSave_(keep);
    });
    return { ok: true, removed: removed };
  },

  // Comprobación para la automatización de GitHub (no revela ninguna clave).
  health: function () {
    return { ok: true, version: BACKEND_VERSION, clavesConfiguradas: clavesConfiguradas_(), clavesIA: groqKeys_().length, iaPermiso: iaPermiso_() };
  },

  // Novedades para notificar con la app cerrada (la app consulta cada ~15 min).
  // App de Ella: mensajes sin leer y rutinas nuevas de Jaider.
  // App de Jaider: respuestas de Ella y entrenos que terminó (últimas 36 h).
  pending_notifications: function (body, folder) {
    const role = requireRole(body, 'any');
    const items = [];
    if (fromHerApp(body)) {
      const sp = spaceOf(body, role, folder); folder = sp.folder;
      const tester = sp.uid === 'prueba', pm = puede_(body, role, 'msgs'), pc = puede_(body, role, 'chat');
      (pm ? loadMessages(folder) : []).map(tester ? viewAsTester : withoutTest).forEach(function (m) {
        if (!m.read) items.push({ id: 'msg:' + m.id, title: '📩 Nuevo mensaje de Jaider', text: m.text, action: 'go:home' });
      });
      const rf = pm && findFile(folder, ROUTINE_FILE);
      ((rf && readJsonFile(rf).routines) || []).map(tester ? viewAsTester : withoutTest).forEach(function (r) {
        if (!r.imported) items.push({ id: 'rut:' + r.id, title: '📋 Jaider te mandó una rutina', text: r.title + (r.note ? ' · ' + r.note : ''), action: 'go:home' });
      });
      const yo = userOf(body, role);
      loadRequests(folder).forEach(function (q) {
        if ((q.user || 'ella') !== yo || !q.updatedAt || q.status === 'pendiente') return;
        if (Date.now() - Number(q.updatedAt) > 36 * 3600000) return;
        const t = q.status === 'hecho' ? '✅ Tu pedido para la app está listo' : q.status === 'en_proceso' ? '🛠 Jaider está trabajando en tu pedido' : '💡 Jaider revisó tu pedido';
        items.push({ id: 'ped:' + q.id + ':' + q.status, title: t, text: q.text + (q.note ? ' · ' + q.note : ''), action: 'go:requests' });
      });
      snackLoad_(folder, userOf(body, role)).list.forEach(function (x) {
        if (x.by !== 'jaider' || Date.now() - Number(x.at) > 36 * 3600000) return;
        items.push({ id: 'snk:' + x.id, title: '🥤 Jaider te sugirió un snack', text: x.t + (x.k ? ' · ~' + x.k + ' kcal' : ''), action: 'go:food' });
      });
      (pc ? chatUnread(chatThread(loadChat(folder), userOf(body, role)), 'ella') : []).forEach(function (m) {
        if (Date.now() - Number(m.ts) > 36 * 3600000) return;
        items.push({ id: 'chat:' + m.id, title: '💬 Jaider', text: chatMediaLabel(m), action: 'go:chat', button: 'Responder' });
      });
    } else if (role === 'admin') {
      loadMessages(folder).forEach(function (m) {
        const r = m.reply;
        if (!r || Date.now() - Date.parse(r.at || 0) > 36 * 3600000) return;
        items.push({ id: 'rep:' + m.id + ':' + r.at, title: '💬 Ella respondió tu mensaje', text: ((r.emoji || '') + ' ' + (r.text || '')).trim() || 'Reaccionó a tu mensaje', action: 'go:home' });
      });
      loadRequests(folder).forEach(function (q) {
        if ((q.user || 'ella') !== 'ella' || q.status !== 'pendiente') return;
        if (Date.now() - Number(q.createdAt || 0) > 36 * 3600000) return;
        items.push({ id: 'ped:' + q.id, title: '💡 Ella pidió un cambio para su app', text: q.text, action: 'go:requests' });
      });
      const chat = loadChat(folder);
      ['ella', 'prueba'].forEach(function (th) {
        chatUnread(chatThread(chat, th), 'jaider').forEach(function (m) {
          if (Date.now() - Number(m.ts) > 36 * 3600000) return;
          items.push({ id: 'chat:' + m.id, title: th === 'prueba' ? '💬 Chat (prueba)' : '💬 Ella', text: chatMediaLabel(m), action: th === 'prueba' ? 'go:chat:prueba' : 'go:chat', button: 'Responder' });
        });
      });
      const hf = newestFile(folder, [HER_FILE].concat(HER_LEGACY_FILES));
      if (hf && Date.now() - hf.getLastUpdated().getTime() < 36 * 3600000) {
        const d = readJsonFile(hf);
        const limite = Utilities.formatDate(new Date(Date.now() - 36 * 3600000), TZ, 'yyyy-MM-dd');
        ((d && d.workouts) || []).forEach(function (w) {
          if (!w || String(w.date || '') < limite) return;
          const series = (w.exercises || []).reduce(function (n, e) { return n + ((e.sets || []).length); }, 0);
          items.push({ id: 'w:' + (w.id || (w.date + ':' + w.title)), title: '✅ Ella terminó su entreno', text: (w.title || 'Entrenamiento') + (series ? ' · ' + series + ' series' : ''), action: 'go:history' });
        });
      }
      // v23: lo mismo para cada persona (cada una en su carpeta)
      usrLoad_().filter(function (x) { return !x.revoked; }).forEach(function (x) {
        try { notifPersona_(x, items); } catch (e) { }
      });
    }
    return { ok: true, items: items.slice(-20) };
  },

  // Respaldo clásico (lo que ya hacían las apps 8.1)
  backup: function (body, folder) {
    if (!PERMITIR_RESPALDO_SIN_CODIGO) requireRole(body, 'any');
    const content = toContent(body.payload);
    const name = body.filename || MASTER_FILE;
    const master = withLock(function () {
      const m = upsertFile(folder, name, content);
      if (body.keepDaily !== false) {
        const prefix = name === MASTER_FILE ? 'respaldo_gimnasio_' : name.replace(/\.json$/i, '') + '_';
        upsertFile(getHistoryFolder(folder), prefix + todayStr() + '.json', content);
      }
      return m;
    });
    return { ok: true, fileId: master.getId(), updatedAt: new Date().toISOString() };
  }
};

// v23: avisos para la app de Jaider sobre una persona (respuestas, pedidos, chat y entrenos de las últimas 36 h)
function notifPersona_(x, items) {
  const f = usrFolder_(x), n = x.name || 'Alguien', lim = Date.now() - 36 * 3600000, go = 'go:persona:' + x.id;
  loadMessages(f).forEach(function (m) {
    const r = m.reply;
    if (!r || Date.parse(r.at || 0) < lim) return;
    items.push({ id: 'rep:' + m.id + ':' + r.at, title: '💬 ' + n + ' respondió tu mensaje', text: ((r.emoji || '') + ' ' + (r.text || '')).trim() || 'Reaccionó a tu mensaje', action: go });
  });
  loadRequests(f).forEach(function (q) {
    if (q.status !== 'pendiente' || Number(q.createdAt || 0) < lim) return;
    items.push({ id: 'ped:' + q.id, title: '💡 ' + n + ' pidió un cambio para su app', text: q.text, action: go });
  });
  (usrPerms_(x).chat ? chatUnread(chatThread(loadChat(f), x.id), 'jaider') : []).forEach(function (m) {
    if (Number(m.ts) < lim) return;
    items.push({ id: 'chat:' + m.id, title: '💬 ' + n, text: chatMediaLabel(m), action: 'go:chat:' + x.id, button: 'Responder' });
  });
  const pf = findFile(f, CFG_PERSONA.file);
  if (pf && pf.getLastUpdated().getTime() > lim) {
    const d = readJsonFile(pf), limite = Utilities.formatDate(new Date(lim), TZ, 'yyyy-MM-dd');
    ((d && d.workouts) || []).forEach(function (w) {
      if (!w || String(w.date || '') < limite) return;
      const series = (w.exercises || []).reduce(function (k, e) { return k + ((e.sets || []).length); }, 0);
      items.push({ id: 'w:' + x.id + ':' + (w.id || (w.date + ':' + w.title)), title: '✅ ' + n + ' terminó su entreno', text: (w.title || 'Entrenamiento') + (series ? ' · ' + series + ' series' : ''), action: go });
    });
  }
}

// v20: estas acciones abren la carpeta solo si la necesitan (así el chat responde más rápido)
const SIN_CARPETA = { chat_list: 1, chat_typing: 1, ai: 1, health: 1, usr_create: 1, usr_list: 1, usr_update: 1, usr_delete: 1 };
function route(body) {
  const action = String(body.action || 'backup');
  const fn = ACTIONS[action];
  if (!fn) return { ok: false, error: 'Acción desconocida: ' + action };
  return fn(body, SIN_CARPETA[action] ? null : getTargetFolder(body.folderId));
}

// ============================================================================
// Puntos de entrada
// ============================================================================
function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    return json(route(body));
  } catch (err) {
    return json({ ok: false, error: String(err && err.message || err) });
  }
}

function doGet(e) {
  try {
    const p = (e && e.parameter) || {};
    if (p.action) return json(route(p));

    // GET clásico: descarga un respaldo por nombre (?filename=...)
    if (!PERMITIR_RESPALDO_SIN_CODIGO && !roleOf(p.code)) throw new Error('Código inválido o faltante');
    const folder = getTargetFolder(p.folderId);
    const name = p.filename || MASTER_FILE;
    const f = findFile(folder, name);
    if (!f) return json({ ok: false, error: 'Aún no hay ningún respaldo automático en esta carpeta de Drive.' });
    return json({ ok: true, updatedAt: f.getLastUpdated().toISOString(), payload: f.getBlob().getDataAsString('UTF-8') });
  } catch (err) {
    return json({ ok: false, error: String(err && err.message || err) });
  }
}

// Ejecuta esta función desde el editor (▶ Ejecutar) para autorizar Drive y comprobar la carpeta.
function probarConfiguracion() {
  const folder = getTargetFolder();
  Logger.log('Carpeta: ' + folder.getName());
  Logger.log('Mensajes guardados: ' + loadMessages(folder).length);
  Logger.log('progreso_ella.json: ' + (findFile(folder, HER_FILE) ? 'sí' : 'aún no'));
  Logger.log('progreso_prueba.json: ' + (findFile(folder, USUARIOS.prueba.file) ? 'sí' : 'aún no'));
  Logger.log('Pedidos de la app de Ella: ' + loadRequests(folder).length);
  Logger.log('Códigos configurados: ' + clavesConfiguradas_());
  Logger.log('Claves de IA configuradas: ' + groqKeys_().length + (clavesEnApp_() ? ' (se entregan a las apps: CLAVES_IA_EN_APP=1)' : ' (se quedan en el servidor)'));
  Logger.log('Códigos Pro: ' + proLoad().length + ' (carpeta: ' + PRO_ROOT_NAME + ')');
  Logger.log('Personas en la app de Ella: ' + usrLoad_().length + ' (carpeta: ' + USR_ROOT_NAME + ')');
  Logger.log('Mensajes en el chat: ' + (chatThread(loadChat(folder), 'ella').messages.length));
}
