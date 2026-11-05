export const detectHardware = () => {
    const memory = navigator.deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    let suggestion = 'balanced';
    if (memory >= 12 && cores >= 8 && !isMobile) suggestion = 'ultra';
    else if (memory >= 8 && cores >= 6) suggestion = 'pro';
    else if (memory < 4 && cores <= 4) suggestion = 'eco';
    
    return { memory, cores, isMobile, suggestion };
};
