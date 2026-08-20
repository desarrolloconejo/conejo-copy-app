# Especificación de ampliación — Conejo Copy Check

## Modelo de datos

| Entidad | Propósito | Datos principales |
| --- | --- | --- |
| Cliente | Agrupa el trabajo de una marca o cuenta. | Nombre, sector y propietario. |
| Regla de auditoría | Define límites y expresiones a vigilar por cliente o sector. | Límites de palabras, prueba obligatoria, preámbulos, frases gastadas y términos de tensión. |
| Registro de copy | Conserva la ficha de producción y su estado. | Hook, rótulo, prueba, plataforma, auditoría, estado y métrica primaria. |
| Resultado real | Aporta datos posteriores a la publicación. | Impresiones, vistas a 3 segundos, guardados, compartidos, clics y nota de aprendizaje. |

## Flujos

Un usuario crea un cliente y, opcionalmente, una regla de marca o sector. Desde el Canvas guarda una ficha como registro de copy. Cuando la pieza se publica, añade resultados reales y un aprendizaje. El historial permite buscar por texto y filtrar por cliente, plataforma, estado y objetivo. Cada ficha puede descargarse como CSV de datos o como una vista de impresión lista para guardar en PDF.

## Seguridad y persistencia

Los datos estarán ligados al usuario autenticado. Cada consulta, creación o actualización se limitará al propietario actual. La pantalla usará una sesión temporal de interfaz hasta que el usuario se autentique; al guardar, los datos se persisten en la base de datos.
