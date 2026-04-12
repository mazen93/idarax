import { useEffect, useRef } from 'react';

export function useBarcodeScanner(onScan: (barcode: string) => void, enabled: boolean = true) {
    const buffer = useRef<string>('');
    const lastKeyTime = useRef<number>(Date.now());

    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // If the user is typing in a text input (like search, customer note, etc.), we usually
            // want to let the input handle it. However, if they scan a barcode very quickly, it might 
            // still be a scanner. We can check the speed. But to be safe and avoid interfering with typing,
            // we will only capture if the time between keystrokes is extremely fast.
            
            const currentTime = Date.now();
            const timeDiff = currentTime - lastKeyTime.current;
            
            // If the delay is more than 50ms, clear the buffer as it's likely manual typing
            if (timeDiff > 50) {
                buffer.current = '';
            }
            
            lastKeyTime.current = currentTime;

            if (e.key === 'Enter') {
                if (buffer.current.length >= 3) {
                    onScan(buffer.current);
                    
                    // Prevent form submission or other Enter key behaviors if it was a scan capture
                    if (e.target instanceof HTMLInputElement && timeDiff <= 50) {
                        e.preventDefault();
                    }
                }
                buffer.current = '';
                return;
            }

            // Capture only single character printable keys
            if (e.key.length === 1) {
                buffer.current += e.key;
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onScan, enabled]);
}
