import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
  language: string;
}

const BarcodeScanner = ({ onScan, onClose, language }: BarcodeScannerProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const scanner = new Html5Qrcode('barcode-scanner-region');
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 280, height: 150 } },
      (decodedText) => {
        scanner.stop().catch(() => {});
        onScan(decodedText);
      },
      () => {} // ignore scan failures
    ).catch((err) => {
      setError(language === 'ar' ? 'لا يمكن الوصول إلى الكاميرا' : 'Cannot access camera');
      console.error('Scanner error:', err);
    });

    return () => {
      scanner.stop().catch(() => {});
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl p-4 w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">
            {language === 'ar' ? 'مسح الباركود' : 'Scan Barcode'}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-2xl leading-none">&times;</button>
        </div>
        
        {error ? (
          <p className="text-destructive text-sm text-center py-8">{error}</p>
        ) : (
          <p className="text-xs text-muted-foreground text-center">
            {language === 'ar' ? 'وجّه الكاميرا نحو الباركود' : 'Point camera at the barcode'}
          </p>
        )}

        <div id="barcode-scanner-region" className="rounded-xl overflow-hidden" />
      </div>
    </div>
  );
};

export default BarcodeScanner;
