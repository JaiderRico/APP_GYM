#!/usr/bin/env python3
"""
Herramienta para modificar y publicar Mi Progreso (app de Jaider y app de Ella).

  python3 herramientas/mp.py extraer
      Descomprime las APK de la última versión en releases/ dentro de trabajo/jaider y trabajo/ella.
      Lo que normalmente se edita: trabajo/<app>/assets/index.html (toda la app es ese HTML).

  python3 herramientas/mp.py publicar 8.4.18 --notas "- Cambio 1" "- Cambio 2"
      Sin --clave: deja las APK SIN firmar; al hacer push, GitHub Actions las firma con el secreto
      FIRMA_PEM del repositorio (la clave nunca sale de ahí). Es la forma normal.
  python3 herramientas/mp.py publicar 8.4.18 --clave /ruta/clave_firma_MiProgreso.pem --notas "..."
      Con --clave: las firma aquí mismo (solo si tienes el archivo .pem).
      Sube la versión (APP_VERSION del HTML + versionName/versionCode del manifiesto), arma las dos APK
      a partir de trabajo/, las alinea, las firma con la MISMA clave, verifica el certificado y las deja en
      releases/v8.4.18/ con notas.md. Después solo falta git add/commit/push a main
      (la automatización "Publicar versión" crea el Release y lo marca como Latest).

  python3 herramientas/mp.py libre 8.5.0 --notas "- Cambio"
      App pública "Mi Progreso Libre" (com.jaider.gimnasio.libre): copia trabajo/jaider/assets/index.html,
      le quita todo lo que conecta con nuestras apps (código, Apps Script, IA, chat, datos de Jaider), le agrega
      fuente/publica.js (cuestionario, plan genérico, aviso Pro) y deja la APK sin firmar en
      publica/v8.5.0/MiProgreso_Libre_v8.5.0.apk. Al hacer push, el workflow "Publicar app libre" la firma y
      la sube al Release "publica" (pre-release, nunca Latest) como MiProgreso_Libre.apk: ese es el enlace fijo
      que comparten las apps. Córrelo DESPUÉS de "publicar" para que lleve el mismo número de versión.

Requisitos para firmar aquí (Ubuntu): apt-get install -y apksigner zipalign openssl
Nunca subas la clave .pem al repositorio (es público).
"""
import os, re, sys, glob, shutil, struct, zipfile, subprocess, argparse, tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TRABAJO = os.path.join(RAIZ, 'trabajo')
CERT_SHA256 = 'f7d6a22c1b257de37f8d7fa134e6b5755c1a94cb2d996648809fabda31fa0d7d'
FIRMAS = ('META-INF/MP.RSA', 'META-INF/MP.SF', 'META-INF/MANIFEST.MF')
APPS = {'jaider': 'MiProgreso_v{v}.apk', 'ella': 'MiProgreso_Ella_v{v}.apk'}
LIBRE = 'MiProgreso_Libre_v{v}.apk'
FUENTE = os.path.join(RAIZ, 'herramientas', 'fuente')
LIBRE_BASE_INICIAL = os.path.join(RAIZ, 'herramientas', 'libre_base_8.4.18.apk')  # solo para la primera versión


def ultima_version():
    vs = [os.path.basename(d)[1:] for d in glob.glob(os.path.join(RAIZ, 'releases', 'v*')) if os.path.isdir(d)]
    vs.sort(key=lambda s: [int(x) for x in s.split('.')])
    return vs[-1]


def apk_base(app, v):
    return os.path.join(RAIZ, 'releases', 'v' + v, APPS[app].format(v=v))


def extraer(_):
    v = ultima_version()
    for app in APPS:
        dst = os.path.join(TRABAJO, app)
        shutil.rmtree(dst, ignore_errors=True)
        with zipfile.ZipFile(apk_base(app, v)) as z:
            z.extractall(dst)
    open(os.path.join(TRABAJO, 'BASE'), 'w').write(v)
    vl, base = libre_base()
    if not os.path.exists(base):
        print('Extraída la versión', v, 'en', TRABAJO, '(no hay app libre publicada todavía)'); return
    dst = os.path.join(TRABAJO, 'libre')
    shutil.rmtree(dst, ignore_errors=True)
    with zipfile.ZipFile(base) as z:
        z.extractall(dst)
    open(os.path.join(TRABAJO, 'BASE_LIBRE'), 'w').write(vl)
    print('Extraída la versión', v, 'en', TRABAJO, '(y la libre', vl + ')')
    print('Edita trabajo/ella/assets/index.html y/o trabajo/jaider/assets/index.html')


def codigo(v):
    a, b, c = [int(x) for x in v.split('.')]
    if c > 99 or b > 9: sys.exit('Usa versiones tipo 8.4.NN (parche 0-99, menor 0-9).')
    return a * 1000 + b * 100 + c


def libre_base():
    """(versión, apk) de la última app libre publicada en publica/, o la base inicial."""
    vs = [os.path.basename(d)[1:] for d in glob.glob(os.path.join(RAIZ, 'publica', 'v*')) if os.path.isdir(d)]
    vs = [v for v in vs if os.path.exists(os.path.join(RAIZ, 'publica', 'v' + v, LIBRE.format(v=v)))]
    if vs:
        vs.sort(key=lambda s: [int(x) for x in s.split('.')])
        return vs[-1], os.path.join(RAIZ, 'publica', 'v' + vs[-1], LIBRE.format(v=vs[-1]))
    return '8.4.18', LIBRE_BASE_INICIAL


def libre_html(t):
    """HTML de la app de Jaider -> app libre (sin nada que se conecte con nuestras apps)."""
    def rep(a, b, n=None):
        nonlocal t
        c = t.count(a)
        if c == 0 or (n is not None and c != n): sys.exit(f'libre: no encontré (o cambió) "{a[:60]}" ({c} veces)')
        t = t.replace(a, b)
    rep("MP_APK_IS_ELLA=false,", "MP_APK_IS_ELLA=false,MP_PUBLICA=true,", 1)
    lines = t.split('\n')
    hits = [i for i, l in enumerate(lines) if l.lstrip().startswith('const BOOTSTRAP_DATA=')]
    if len(hits) != 1: sys.exit('libre: BOOTSTRAP_DATA no encontrado')
    lines[hits[0]] = '  const BOOTSTRAP_DATA=null;'
    t = '\n'.join(lines)
    t, n = re.subn(r"MP_PAIR_CODE='[^']*'", "MP_PAIR_CODE=''", t)
    t, n2 = re.subn(r"MP_DRIVE_URL='[^']*'", "MP_DRIVE_URL=''", t)
    if n != 1 or n2 != 1: sys.exit('libre: MP_PAIR_CODE/MP_DRIVE_URL no encontrados')
    # Actualizaciones: solo su propia APK (Release "publica", que es pre-release) y la versión sale del título
    rep("(MP_APK_IS_ELLA?/ella/i.test(a.name):!/ella|libre/i.test(a.name))", "/libre/i.test(a.name)", 2)
    rep("!x.draft&&!x.prerelease&&", "!x.draft&&", 1)
    pv = lambda x: f"verNum((({x}.name||'').match(/\\d+\\.\\d+\\.\\d+/)||[{x}.tag_name])[0])"
    rep("verNum(b.tag_name)-verNum(a.tag_name)", pv('b') + '-' + pv('a'), 1)
    rep("verNum(j.tag_name)<=verNum(cur)", pv('j') + "<=verNum(cur)", 1)
    rep("updInfo={tag:j.tag_name,", "updInfo={tag:'v'+(((j.name||'').match(/\\d+\\.\\d+\\.\\d+/)||[j.tag_name])[0]),", 1)
    rep("'🎓 Universidad'", "'🏋️ Otro gimnasio'")
    rep("<title>Mi progreso · Gimnasio v8.1</title>", "<title>Mi Progreso Libre</title>", 1)
    if 'script.google.com/macros' in t: sys.exit('libre: quedó una URL del Apps Script en el HTML')
    bloque = open(os.path.join(FUENTE, 'publica.js'), encoding='utf-8').read().rstrip() + '\n'
    rep('\n  initV7();', '\n' + bloque + '\n  initV7();', 1)
    return t


def libre(a):
    nueva = a.version
    vieja = open(os.path.join(TRABAJO, 'BASE_LIBRE')).read().strip()
    if codigo(nueva) <= codigo(vieja): sys.exit(f'La versión nueva ({nueva}) debe ser mayor que {vieja}')
    if len(nueva) != len(vieja): sys.exit(f'La versión nueva debe tener los mismos caracteres que la anterior ({vieja} -> {nueva}). Ej: 8.4.17 -> 8.4.18, 8.4.99 -> 8.5.10')
    src = open(os.path.join(TRABAJO, 'jaider', 'assets', 'index.html'), encoding='utf-8').read()
    if f"APP_VERSION='{nueva}'" not in src:
        sys.exit(f'Primero corre "publicar {nueva}" (la app de Jaider debe estar en {nueva}).')
    html = os.path.join(TRABAJO, 'libre', 'assets', 'index.html')
    open(html, 'w', encoding='utf-8').write(libre_html(src).replace(f"APP_VERSION='{nueva}'", f"APP_VERSION='{vieja}'"))
    for f in glob.glob(os.path.join(TRABAJO, 'libre', 'assets', '*.json')): os.remove(f)  # respaldos personales
    subir_version('libre', vieja, nueva)
    _, base = libre_base()
    destino = os.path.join(RAIZ, 'publica', 'v' + nueva)
    os.makedirs(destino, exist_ok=True)
    final = os.path.join(destino, LIBRE.format(v=nueva))
    armar('libre', base, final)
    open(os.path.join(TRABAJO, 'BASE_LIBRE'), 'w').write(nueva)
    notas = a.notas or [f'- Mi Progreso Libre {nueva}']
    open(os.path.join(destino, 'notas.md'), 'w', encoding='utf-8').write('\n'.join(notas) + '\n')
    print('Sin firmar (la firma GitHub Actions):', os.path.relpath(final, RAIZ))
    print('Listo. Ahora: git add publica/v' + nueva + ' && git commit && git push origin HEAD:main')


def subir_version(app, vieja, nueva):
    html = os.path.join(TRABAJO, app, 'assets', 'index.html')
    t = open(html, encoding='utf-8').read()
    n = len(re.findall(r"APP_VERSION='[^']*'", t))
    if n != 1: sys.exit(f'{app}: se esperaba 1 APP_VERSION en el HTML y hay {n}')
    t = re.sub(r"APP_VERSION='[^']*'", f"APP_VERSION='{nueva}'", t)
    open(html, 'w', encoding='utf-8').write(t)

    man = os.path.join(TRABAJO, app, 'AndroidManifest.xml')
    b = bytearray(open(man, 'rb').read())
    o, w = vieja.encode('utf-16le'), nueva.encode('utf-16le')
    if len(o) != len(w):
        sys.exit(f'La versión nueva debe tener los mismos caracteres que la anterior ({vieja} -> {nueva}). Ej: 8.4.17 -> 8.4.18, 8.4.99 -> 8.5.10')
    if b.count(o) != 1: sys.exit(f'{app}: versionName {vieja} no encontrado en el manifiesto')
    i = b.find(o); b[i:i + len(o)] = w
    pat = struct.pack('<I', codigo(vieja))
    hits = [k for k in range(len(b) - 3) if b[k:k + 4] == pat]
    if len(hits) != 1: sys.exit(f'{app}: versionCode {codigo(vieja)} aparece {len(hits)} veces en el manifiesto')
    b[hits[0]:hits[0] + 4] = struct.pack('<I', codigo(nueva))
    open(man, 'wb').write(b)


def armar(app, base_apk, salida):
    raiz = os.path.join(TRABAJO, app)
    hechos = set()
    with zipfile.ZipFile(base_apk) as zi, zipfile.ZipFile(salida, 'w') as zo:
        for info in zi.infolist():
            if info.filename in FIRMAS: continue
            ruta = os.path.join(raiz, info.filename)
            if not os.path.exists(ruta): continue          # borrado a propósito en trabajo/
            ni = zipfile.ZipInfo(info.filename, date_time=info.date_time)
            ni.compress_type = info.compress_type; ni.external_attr = info.external_attr
            zo.writestr(ni, open(ruta, 'rb').read()); hechos.add(info.filename)
        for d, _, fs in os.walk(raiz):                      # archivos nuevos (ej. classes7.dex)
            for f in fs:
                rel = os.path.relpath(os.path.join(d, f), raiz).replace(os.sep, '/')
                if rel in hechos or rel in FIRMAS: continue
                ni = zipfile.ZipInfo(rel); ni.compress_type = zipfile.ZIP_DEFLATED
                zo.writestr(ni, open(os.path.join(d, f), 'rb').read())


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: sys.exit('Falló: ' + ' '.join(cmd) + '\n' + r.stdout + r.stderr)
    return r.stdout + r.stderr


def publicar(a):
    vieja = open(os.path.join(TRABAJO, 'BASE')).read().strip()
    nueva = a.version
    if codigo(nueva) <= codigo(vieja): sys.exit(f'La versión nueva ({nueva}) debe ser mayor que {vieja}')
    if len(nueva) != len(vieja): sys.exit(f'La versión nueva debe tener los mismos caracteres que la anterior ({vieja} -> {nueva}). Ej: 8.4.17 -> 8.4.18, 8.4.99 -> 8.5.10')
    destino = os.path.join(RAIZ, 'releases', 'v' + nueva)
    os.makedirs(destino, exist_ok=True)
    tmp = tempfile.mkdtemp()
    key = os.path.join(tmp, 'key.pk8'); cert = os.path.join(tmp, 'cert.der')
    if a.clave:
        run(['openssl', 'pkcs8', '-topk8', '-nocrypt', '-in', a.clave, '-outform', 'DER', '-out', key])
        run(['openssl', 'x509', '-in', a.clave, '-outform', 'DER', '-out', cert])
    try:
        for app in APPS:
            subir_version(app, vieja, nueva)
            sin = os.path.join(tmp, app + '_sin.apk'); ali = os.path.join(tmp, app + '_ali.apk')
            final = os.path.join(destino, APPS[app].format(v=nueva))
            armar(app, apk_base(app, vieja), sin)
            if not a.clave:
                shutil.copy(sin, final)
                print('Sin firmar (la firma GitHub Actions):', os.path.relpath(final, RAIZ))
                continue
            run(['zipalign', '-f', '-p', '4', sin, ali])
            run(['apksigner', 'sign', '--v4-signing-enabled', 'false', '--key', key, '--cert', cert, '--out', final, ali])
            out = run(['apksigner', 'verify', '--print-certs', final])
            if CERT_SHA256 not in out: sys.exit(f'{app}: el certificado NO coincide con el de siempre. No publiques.')
            print('OK', os.path.relpath(final, RAIZ))
        open(os.path.join(TRABAJO, 'BASE'), 'w').write(nueva)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    notas = a.notas or [f'- Mi Progreso {nueva}']
    open(os.path.join(destino, 'notas.md'), 'w', encoding='utf-8').write('\n'.join(notas) + '\n')
    print('Listo. Ahora: git add releases/v' + nueva + ' && git commit && git push origin HEAD:main')


if __name__ == '__main__':
    p = argparse.ArgumentParser()
    s = p.add_subparsers(dest='cmd', required=True)
    s.add_parser('extraer')
    q = s.add_parser('publicar'); q.add_argument('version'); q.add_argument('--clave'); q.add_argument('--notas', nargs='*')
    q = s.add_parser('libre'); q.add_argument('version'); q.add_argument('--notas', nargs='*')
    a = p.parse_args()
    {'extraer': extraer, 'publicar': publicar, 'libre': libre}[a.cmd](a)
