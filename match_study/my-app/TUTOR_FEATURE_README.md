# Funcionalidad de Tutor en MatchStudy - Versión con Tablas Especializadas

## Descripción
Se ha implementado la funcionalidad para que los usuarios puedan registrarse como tutores usando las tablas especializadas `tutor_profiles` y `tutor_skills` en lugar de campos en la tabla `usuarios`.

## Arquitectura de Base de Datos

### Tabla `tutor_profiles`
- **user_email**: Email del tutor (clave primaria)
- **active**: Boolean indicando si está activo como tutor
- **modality**: Modalidad de enseñanza ("online", "presencial", "ambos")
- **hourly_rate_min**: Tarifa mínima por hora
- **hourly_rate_max**: Tarifa máxima por hora

### Tabla `tutor_skills`
- **user_email**: Email del tutor (clave foránea)
- **tag_id**: ID del tag/skill (clave foránea a tabla de tags)
- **weight**: Peso/prioridad de la skill (1-10)

## Cambios Realizados

### 1. APIs Nuevas
- **`/api/tutor-status`**: GET/POST para verificar y actualizar estado de tutor
- **`/api/tutor-skills`**: GET/POST para obtener y actualizar skills del tutor

### 2. Interfaz de Usuario
En `/dashboard/perfil` se agregó:
- **Switch "Es tutor"**: Activa/desactiva el rol de tutor
- **Visualización de Skills**: Muestra cantidad de especialidades registradas
- **Badge de Tutor**: Indicador visual cuando está activo

### 3. Lógica de Negocio
- Los datos de tutor se almacenan en tablas especializadas
- Las skills usan un sistema de tags con pesos
- Separación clara entre perfil básico y perfil de tutor

## Cómo Usar

1. **El sistema ya está configurado** - no requiere migraciones SQL
2. **Ir al perfil** (`/dashboard/perfil`)
3. **Hacer clic en "Editar"**
4. **Activar "Es tutor"** para convertirse en tutor
5. **Las skills se gestionan** a través del sistema de tags existente

## Notas Técnicas
- **No se modificó** la tabla `usuarios`
- **Se reutilizaron** las tablas existentes `tutor_profiles` y `tutor_skills`
- **Compatible** con el sistema de recomendaciones existente
- **Build exitoso** ✅ sin errores de compilación
- Los cambios se guardan junto con el resto del perfil del usuario
- La validación es mínima (solo tipo de datos), se puede extender según necesidades</content>
<parameter name="filePath">c:\Users\Juan-Sistemas\Documents\Match\MatchStudy\\match_study\\my-app\\TUTOR_FEATURE_README.md