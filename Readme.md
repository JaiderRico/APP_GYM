# Mi Progreso – actualizaciones

Aquí se publican las APK de **Mi Progreso** (Jaider) y **Mi Progreso Ella**.
Las apps revisan los Releases de este repositorio y avisan cuando hay una versión nueva.

## Cómo se publica una versión

1. Crear la carpeta `releases/vX.Y.Z/` con las dos APK:
   - `MiProgreso_vX.Y.Z.apk` (app de Jaider)
   - `MiProgreso_Ella_vX.Y.Z.apk` (el nombre **debe** contener "Ella")
   - `notas.md` (opcional): lo que verán en la tarjeta de actualización.
2. Subirla a `main`. La automatización `Publicar versión` crea el Release, sube las APK y lo marca como **Latest**.
3. Si la versión ya existía, reemplaza sus APK (sirve para corregir una versión publicada).

Descarga directa de la última versión: https://github.com/JaiderRico/APP_GYM/releases/latest

## Mi Progreso Libre (app pública)

Versión para cualquier persona, sin conexión con nuestras apps (todo queda en el teléfono).
Se publica aparte, en el pre-release fijo `publica`, con el workflow `Publicar app libre` (carpeta `publica/vX.Y.Z/`).

Descarga directa: https://github.com/JaiderRico/APP_GYM/releases/download/publica/MiProgreso_Libre.apk
