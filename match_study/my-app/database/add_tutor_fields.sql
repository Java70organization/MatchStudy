-- Migration: Configuración de tutor ya implementada
-- Las skills se almacenan en la tabla tutor_skills (relación muchos-a-muchos)
-- El estado de tutor se maneja en la tabla tutor_profiles

-- La tabla tutor_profiles ya existe con campos:
-- user_email, active, modality, hourly_rate_min, hourly_rate_max

-- La tabla tutor_skills ya existe con campos:
-- user_email, tag_id, weight

-- No se requieren migraciones adicionales para esta funcionalidad