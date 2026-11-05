export const tiers = {
    'eco': { id: 'L0', num: 0 },
    'balanced': { id: 'L1', num: 1 },
    'pro': { id: 'L2', num: 2 },
    'ultra': { id: 'L3', num: 3 }
};

export const defaultPostProcess = {
    bloom: true,
    bloomIntensity: 0.8,
    grain: false,
    grainIntensity: 0.3,
    glassReflections: true,
    blurIntensity: 1.0,
    shadows: true,           // Sombras dinámicas
    shadowQuality: 1.0,      // Calidad de sombras
    antiAliasing: true,      // Suavizado de bordes CSS
    particleDensity: 1.0,    // Densidad de partículas
    fpsLimit: 60             // Límite de FPS (VSync simulación)
};
