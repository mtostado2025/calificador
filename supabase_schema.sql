-- ==========================================================
-- TABLA DE CALIFICACIONES / SATISFACCIÓN - ESTOL EQUIPOS MÉDICOS
-- Ejecutar este script en el SQL Editor de tu proyecto Supabase
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.calificaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    rating VARCHAR(20) NOT NULL,            -- 'excelente' (feliz), 'regular' (seria), 'mala' (disgustada)
    score INTEGER NOT NULL,                 -- 3 = Excelente, 2 = Regular, 1 = Mala
    motivos TEXT[] DEFAULT '{}',            -- Motivos seleccionados (ej: ['Atención', 'Tiempo de espera'])
    comentario TEXT DEFAULT '',             -- Comentario adicional opcional
    sucursal VARCHAR(100) DEFAULT 'Casa Central - Martín García 1282',
    dispositivo VARCHAR(100) DEFAULT 'Tablet Kiosk 1',
    qr_escaneado BOOLEAN DEFAULT FALSE      -- Si interactuó con el QR / botón de Google
);

-- Índices para consultas rápidas en el panel de administración
CREATE INDEX IF NOT EXISTS idx_calificaciones_created_at ON public.calificaciones (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calificaciones_rating ON public.calificaciones (rating);
CREATE INDEX IF NOT EXISTS idx_calificaciones_score ON public.calificaciones (score);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.calificaciones ENABLE ROW LEVEL SECURITY;

-- Política 1: Permitir a cualquier cliente (anónimo / tablet) registrar una calificación
CREATE POLICY "Permitir insercion publica de calificaciones"
    ON public.calificaciones
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Política 2: Permitir lectura pública o autenticada para el panel de estadísticas
CREATE POLICY "Permitir lectura para reportes y estadisticas"
    ON public.calificaciones
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Comentario explicativo
COMMENT ON TABLE public.calificaciones IS 'Registro de calificaciones de clientes en tablet Kiosk para Estol Equipos Médicos';
