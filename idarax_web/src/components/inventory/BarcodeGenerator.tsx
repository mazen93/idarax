import React from 'react';

// Code 128 patterns (0-106)
const PATTERNS = [
    "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213", 
    "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132", 
    "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211", 
    "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313", 
    "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331", 
    "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111", 
    "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214", 
    "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111", 
    "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141", 
    "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141", 
    "114131", "311141", "411131", "211412", "211214", "211232", "2331112"
];

function encodeCode128B(text: string) {
    const CODE128_B_START = 104;
    const CODE128_STOP = 106;
    
    let checksum = CODE128_B_START;
    let barcodeData = [PATTERNS[CODE128_B_START]];
    
    for (let i = 0; i < text.length; i++) {
        let charCode = text.charCodeAt(i);
        let val = charCode - 32;
        if (val < 0 || val > 95) val = 0; // Fallback to space for unsupported chars
        
        checksum += val * (i + 1);
        barcodeData.push(PATTERNS[val]);
    }
    
    checksum = checksum % 103;
    barcodeData.push(PATTERNS[checksum]);
    barcodeData.push(PATTERNS[CODE128_STOP]);
    
    let rects = [];
    let xOffset = 0;
    
    for (let pattern of barcodeData) {
        for (let i = 0; i < pattern.length; i++) {
            let width = parseInt(pattern[i]);
            let isBar = i % 2 === 0;
            if (isBar) {
                rects.push({ x: xOffset, width: width });
            }
            xOffset += width;
        }
    }
    
    return { rects, totalWidth: xOffset };
}

interface BarcodeGeneratorProps {
    value: string;
    width?: number | string;
    height?: number | string;
    displayValue?: boolean;
    className?: string;
}

export function BarcodeGenerator({ value, width = '100%', height = '100%', displayValue = true, className = '' }: BarcodeGeneratorProps) {
    if (!value) return null;
    
    // Force a valid string, trim to avoid invisible whitespace bugs
    const text = String(value).trim() || 'UNKNOWN';
    const { rects, totalWidth } = encodeCode128B(text);
    
    // viewBox ensures it scales perfectly
    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <svg 
                viewBox={`0 0 ${totalWidth} 50`} 
                preserveAspectRatio="none" 
                style={{ width, height, minHeight: '30px', display: 'block' }}
                shapeRendering="crispEdges"
            >
                <rect width="100%" height="100%" fill="white" />
                {rects.map((rect, i) => (
                    <rect key={i} x={rect.x} y="0" width={rect.width} height="50" fill="black" />
                ))}
            </svg>
            {displayValue && (
                <div className="text-center font-mono text-[10px] sm:text-xs mt-1 font-bold tracking-[0.2em] text-black w-full">
                    {text}
                </div>
            )}
        </div>
    );
}
