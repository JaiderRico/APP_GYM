// ============================================================================
// BACKEND MI PROGRESO v16 — Google Apps Script (respaldo en Drive + app de Ella)
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
//   verify_code    { code }                       -> { ok, role, groqKey, groqKeys:[...] }
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
//     · App de Ella con su código -> chat "ella"; con el código admin (prueba) -> chat "prueba".
//     · App de Jaider -> chat "ella" (o thread:'prueba' para ver el de prueba).
//   pro_create     { code, name, days }           -> crea un código Pro temporal        (solo admin)
//   pro_list       { code }                       -> códigos Pro y su estado            (solo admin)
//   pro_update     { code, id, days?, revoke? }   -> alarga / revoca / reactiva         (solo admin)
//   pro_delete     { code, id }                   -> borra el código (la carpeta queda)  (solo admin)
//   pro_verify     { pro }                        -> { ok, name, expiresAt, groqKeys }  (app libre)
//   pro_sync       { pro, payload }               -> copia en su carpeta                (app libre)
//   pro_get        { pro }                        -> su última copia                    (app libre)
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
const BACKEND_VERSION = 'v16';
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
  return null;
}

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
function userOf(body, role) {
  if (fromHerApp(body) && role === 'admin') return 'prueba';
  return 'ella';
}
function userCfg(body, role) { return USUARIOS[userOf(body, role)]; }
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

function loadChat(folder) {
  const f = findFile(folder, CHAT_FILE);
  const d = f ? readJsonFile(f) : null;
  const threads = (d && d.threads && typeof d.threads === 'object') ? d.threads : {};
  return { threads: threads };
}

function saveChat(folder, chat) {
  upsertFile(folder, CHAT_FILE, JSON.stringify({ updatedAt: new Date().toISOString(), threads: chat.threads }, null, 2));
}

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
  return { side: 'jaider', other: 'ella', thread: String(body.thread || '') === 'prueba' ? 'prueba' : 'ella' };
}

function chatUnread(t, side) {
  const seen = Number(t.read[side]) || 0;
  return t.messages.filter(function (m) { return m.from !== side && Number(m.ts) > seen; });
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
    status: proStatus(x), lastUse: x.lastUse || 0, lastBackup: x.lastBackup || 0 };
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
  return { x: x, list: list };
}
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
    if (!role) return { ok: false, error: 'Código inválido' };
    const keys = groqKeys_();
    return { ok: true, role: role, user: userOf(body, role), groqKey: keys[0] || GROQ_API_KEY, groqKeys: keys };
  },

  sync_her_data: function (body, folder) {
    const role = requireRole(body, 'any');
    const u = userCfg(body, role);
    if (body.payload == null) throw new Error('Falta payload');
    const content = toContent(body.payload);
    const f = withLock(function () {
      const master = upsertFile(folder, u.file, content);
      if (body.keepDaily !== false) {
        upsertFile(getHistoryFolder(folder), u.daily + todayStr() + '.json', content);
      }
      return master;
    });
    return { ok: true, user: userOf(body, role), fileId: f.getId(), updatedAt: new Date().toISOString() };
  },

  // Jaider lo revisa desde su app; Ella lo usa para restaurar su respaldo si cambia de teléfono.
  get_her_data: function (body, folder) {
    const role = requireRole(body, 'any');
    const u = userCfg(body, role);
    const f = newestFile(folder, [u.file].concat(u.legacy));
    if (!f) return { ok: false, error: userOf(body, role) === 'prueba' ? 'Aún no hay respaldo de prueba.' : 'Ella aún no ha sincronizado su progreso.' };
    return { ok: true, user: userOf(body, role), file: f.getName(), updatedAt: f.getLastUpdated().toISOString(), payload: readJsonFile(f) };
  },

  sync_my_data: function (body, folder) {
    requireRole(body, 'admin');
    if (body.payload == null) throw new Error('Falta payload');
    const f = withLock(function () { return upsertFile(folder, MY_FILE, toContent(body.payload)); });
    return { ok: true, fileId: f.getId(), updatedAt: new Date().toISOString() };
  },

  get_my_data: function (body, folder) {
    requireRole(body, 'any');
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
    const tester = userOf(body, role) === 'prueba';
    let all = loadMessages(folder);
    all = all.map(tester ? viewAsTester : withoutTest);
    // Ella recibe solo los pendientes; Jaider (admin, desde su app) ve todos con su estado de lectura.
    const includeRead = (role === 'admin' && !fromHerApp(body)) || body.includeRead === true || body.includeRead === 'true';
    const list = includeRead ? all : all.filter(function (m) { return !m.read; });
    return { ok: true, pending: all.filter(function (m) { return !m.read; }).length, messages: list.slice().reverse() };
  },

  mark_read: function (body, folder) {
    const role = requireRole(body, 'any');
    const tester = userOf(body, role) === 'prueba';
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
    const tester = userOf(body, role) === 'prueba';
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
    const tester = userOf(body, role) === 'prueba';
    const f = findFile(folder, ROUTINE_FILE);
    let all = f ? (readJsonFile(f).routines || []) : [];
    all = all.map(tester ? viewAsTester : withoutTest);
    const list = (role === 'admin' && !fromHerApp(body)) ? all : all.filter(function (r) { return !r.imported; });
    return { ok: true, routines: list.slice().reverse() };
  },

  ack_routine: function (body, folder) {
    const role = requireRole(body, 'any');
    const tester = userOf(body, role) === 'prueba';
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
    const user = userOf(body, role);
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
    let list = loadRequests(folder);
    if (fromHerApp(body) || role !== 'admin') {
      const user = userOf(body, role);
      list = list.filter(function (r) { return (r.user || 'ella') === user; });
    }
    return { ok: true, requests: list.slice().reverse() };
  },

  update_request: function (body, folder) {
    requireRole(body, 'admin');
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
    const user = userOf(body, role);
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
    const u = userCfg(body, requireRole(body, 'any'));
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
    const dir = photoFolder(folder, userCfg(body, requireRole(body, 'any')), false);
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
    const dir = photoFolder(folder, userCfg(body, requireRole(body, 'any')), false);
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
    const text = String(body.text || '').trim().slice(0, MAX_TEXTO_CHAT);
    if (!text) throw new Error('El mensaje está vacío');
    const id = String(body.id || Utilities.getUuid()).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || Utilities.getUuid();
    let saved = null;
    withLock(function () {
      const chat = loadChat(folder), t = chatThread(chat, w.thread);
      saved = t.messages.filter(function (m) { return m.id === id; })[0] || null;
      if (saved) return;                                   // reintento de un envío que ya llegó
      const last = t.messages.length ? Number(t.messages[t.messages.length - 1].ts) || 0 : 0;
      saved = { id: id, from: w.side, text: text, ts: Math.max(Date.now(), last + 1) };
      t.messages.push(saved);
      if (t.messages.length > MAX_CHAT) t.messages = t.messages.slice(t.messages.length - MAX_CHAT);
      t.read[w.side] = saved.ts;                            // lo mío cuenta como leído
      saveChat(folder, chat);
    });
    return { ok: true, thread: w.thread, message: saved };
  },

  chat_list: function (body, folder) {
    const w = chatWho(body, requireRole(body, 'any'));
    const t = chatThread(loadChat(folder), w.thread);
    const since = Number(body.since) || 0;
    const list = t.messages.filter(function (m) { return Number(m.ts) > since; }).slice(-200);
    return {
      ok: true, thread: w.thread, me: w.side, messages: list,
      unread: chatUnread(t, w.side).length,
      readByOther: Number(t.read[w.other]) || 0,
      readByMe: Number(t.read[w.side]) || 0
    };
  },

  chat_read: function (body, folder) {
    const w = chatWho(body, requireRole(body, 'any'));
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
    const x = requirePro(body).x;
    proTouch(x.id, { lastUse: Date.now() });
    return { ok: true, name: x.name, expiresAt: x.expiresAt, groqKeys: groqKeys_() };
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

  // Comprobación para la automatización de GitHub (no revela ninguna clave).
  health: function () {
    return { ok: true, version: BACKEND_VERSION, clavesConfiguradas: clavesConfiguradas_(), clavesIA: groqKeys_().length };
  },

  // Novedades para notificar con la app cerrada (la app consulta cada ~15 min).
  // App de Ella: mensajes sin leer y rutinas nuevas de Jaider.
  // App de Jaider: respuestas de Ella y entrenos que terminó (últimas 36 h).
  pending_notifications: function (body, folder) {
    const role = requireRole(body, 'any');
    const items = [];
    if (fromHerApp(body)) {
      const tester = userOf(body, role) === 'prueba';
      loadMessages(folder).map(tester ? viewAsTester : withoutTest).forEach(function (m) {
        if (!m.read) items.push({ id: 'msg:' + m.id, title: '📩 Nuevo mensaje de Jaider', text: m.text, action: 'go:home' });
      });
      const rf = findFile(folder, ROUTINE_FILE);
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
      chatUnread(chatThread(loadChat(folder), userOf(body, role)), 'ella').forEach(function (m) {
        if (Date.now() - Number(m.ts) > 36 * 3600000) return;
        items.push({ id: 'chat:' + m.id, title: '💬 Jaider', text: m.text, action: 'go:chat', button: 'Responder' });
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
          items.push({ id: 'chat:' + m.id, title: th === 'prueba' ? '💬 Chat (prueba)' : '💬 Ella', text: m.text, action: th === 'prueba' ? 'go:chat:prueba' : 'go:chat', button: 'Responder' });
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

function route(body) {
  const folder = getTargetFolder(body.folderId);
  const action = String(body.action || 'backup');
  const fn = ACTIONS[action];
  if (!fn) return { ok: false, error: 'Acción desconocida: ' + action };
  return fn(body, folder);
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
  Logger.log('Claves de IA configuradas: ' + groqKeys_().length);
  Logger.log('Códigos Pro: ' + proLoad().length + ' (carpeta: ' + PRO_ROOT_NAME + ')');
  Logger.log('Mensajes en el chat: ' + (chatThread(loadChat(folder), 'ella').messages.length));
}
