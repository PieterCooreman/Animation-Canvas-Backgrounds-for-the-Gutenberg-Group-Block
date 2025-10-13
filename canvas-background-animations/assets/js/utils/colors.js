// color.js - shared utility for parsing color formats
// Supports #RRGGBB, #RRGGBBAA, rgb(), rgba(), and 'transparent'
window.CBA_parseColor = function(input) {
    if (!input) return { r: 0, g: 115, b: 170, a: 1 };
    const color = String(input).trim().toLowerCase();
    if (color === 'transparent') {
        return { r: 0, g: 0, b: 0, a: 0 };
    }
    // rgba() or rgb()
    const rgbaMatch = color.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*([01]?\.?\d*))?\s*\)$/);
    if (rgbaMatch) {
        return {
            r: Math.min(255, parseInt(rgbaMatch[1], 10)),
            g: Math.min(255, parseInt(rgbaMatch[2], 10)),
            b: Math.min(255, parseInt(rgbaMatch[3], 10)),
            a: rgbaMatch[4] !== undefined ? Math.max(0, Math.min(1, parseFloat(rgbaMatch[4]))) : 1
        };
    }
    // 8-digit hex (#RRGGBBAA)
    const hex8 = color.match(/^#?([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i);
    if (hex8) {
        return {
            r: parseInt(hex8[1], 16),
            g: parseInt(hex8[2], 16),
            b: parseInt(hex8[3], 16),
            a: parseInt(hex8[4], 16) / 255
        };
    }
    // 6-digit hex (#RRGGBB)
    const hex6 = color.match(/^#?([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i);
    if (hex6) {
        return {
            r: parseInt(hex6[1], 16),
            g: parseInt(hex6[2], 16),
            b: parseInt(hex6[3], 16),
            a: 1
        };
    }
    // fallback
    return { r: 0, g: 115, b: 170, a: 1 };
};

// Alias for compatibility
window.parseColor = window.CBA_parseColor;
window.hexToRgb = window.CBA_parseColor;