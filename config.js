// ==========================================================
// config.js - Configuración del Calificador Estol Equipos Médicos
// ==========================================================

const APP_CONFIG = {
    // Nombre de la empresa y sucursal
    empresa: 'Estol Equipos Médicos',
    subtitulo: 'Ortopedia & Rehabilitación desde 1956',
    sucursalDefault: 'Casa Central - Martín García 1282',
    dispositivoId: 'Tablet Kiosk 1',
    sitioWeb: 'https://estol.com.uy',

    // Enlace directo a la ficha y reseñas de Google Maps de Estol Equipos Médicos
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Estol+Equipos+Medicos+Martin+Garcia+Montevideo',
    googleMapsQueryFallback: 'https://maps.google.com/?q=Estol+Equipos+Medicos+Martin+Garcia+Montevideo',

    // PIN para ingresar al panel de estadísticas y administración
    adminPin: '1234',

    // Tiempos en segundos para auto-reinicio a pantalla inicial
    tiempoEsperaAgradecimiento: 5,   // Segundos en pantalla de "Muchas gracias / QR"
    tiempoEsperaFeedback: 12,        // Segundos máximos en pantalla de motivos antes de volver
    tiempoEsperaInactividad: 30,     // Inactividad general

    // Opciones rápidas de motivos para regular / disgustado
    motivosMejora: [
        { id: 'atencion', label: 'Atención del personal', icon: '👤' },
        { id: 'espera', label: 'Tiempo de espera', icon: '⏱️' },
        { id: 'equipos', label: 'Disponibilidad de equipos', icon: '🩺' },
        { id: 'precios', label: 'Precios o formas de pago', icon: '💳' },
        { id: 'envios', label: 'Envíos / Fletes a domicilio', icon: '🚚' },
        { id: 'claridad', label: 'Asesoramiento técnico', icon: '📋' }
    ],

    // Sonidos activados por defecto
    sonidoHabilitado: true
};

// Cargar configuración personalizada guardada localmente si existe
try {
    const savedRaw = localStorage.getItem('estol_calificador_config');
    if (savedRaw) {
        const saved = JSON.parse(savedRaw);
        // Si tenía la URL vieja que daba 404, migrar a la nueva válida
        if (saved.googleMapsUrl && saved.googleMapsUrl.includes('ChIJ8_e-82WEn5UR-n56_Lw5Lvg')) {
            saved.googleMapsUrl = APP_CONFIG.googleMapsUrl;
            localStorage.setItem('estol_calificador_config', JSON.stringify(saved));
        }
        Object.assign(APP_CONFIG, saved);
    }
} catch (e) {
    console.warn('No se pudo cargar config local:', e);
}
