# Funcionalidad de Tutor en MatchStudy

## Descripción
Se ha agregado la posibilidad de que los usuarios se registren como tutores en la plataforma MatchStudy, incluyendo un sistema de skills para especificar sus especialidades.

## Cambios Realizados

### 1. Base de Datos
Se agregaron dos nuevos campos a la tabla `usuarios`:
- `es_tutor`: BOOLEAN (default: FALSE) - Indica si el usuario es tutor
- `skills`: TEXT - Lista de skills separadas por comas

**Migración SQL necesaria:**
```sql
-- Ejecutar en Supabase SQL Editor
ALTER TABLE usuarios ADD COLUMN es_tutor BOOLEAN DEFAULT FALSE;
ALTER TABLE usuarios ADD COLUMN skills TEXT;
```

### 2. API Updates
- **`/api/update-user-profile`**: Ahora acepta `es_tutor` (boolean) y `skills` (string)
- **`lib/supabase/user.ts`**: Tipo `DBUser` actualizado con nuevos campos

### 3. Interfaz de Usuario
En `/dashboard/perfil` se agregaron:
- **Switch "Es tutor"**: Toggle para activar/desactivar el rol de tutor
- **Campo Skills**: Textarea que aparece solo cuando el usuario es tutor
- **Badge de Tutor**: Muestra "Tutor" en el perfil cuando está activado
- **Badge de Skills**: Muestra las especialidades del tutor

## Cómo Usar

1. **Ejecutar la migración SQL** en Supabase para agregar los nuevos campos
2. **Reiniciar el servidor** de desarrollo
3. **Ir al perfil** del usuario (`/dashboard/perfil`)
4. **Hacer clic en "Editar"**
5. **Activar el switch "Es tutor"** si el usuario quiere ser tutor
6. **Agregar skills** en el campo correspondiente (separadas por comas)
7. **Guardar cambios**

## Ejemplo de Skills
```
Matemáticas, Física, Cálculo, Álgebra, Geometría
Inglés, Francés, Conversación, Gramática
Programación, JavaScript, React, Node.js
```

## Notas Técnicas
- Los skills se almacenan como texto plano separado por comas
- El campo skills solo es visible cuando `es_tutor` es `true`
- Los cambios se guardan junto con el resto del perfil del usuario
- La validación es mínima (solo tipo de datos), se puede extender según necesidades</content>
<parameter name="filePath">c:\Users\Juan-Sistemas\Documents\Match\MatchStudy\\match_study\\my-app\\TUTOR_FEATURE_README.md