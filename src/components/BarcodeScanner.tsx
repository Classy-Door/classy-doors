import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, ImagePlus } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
  language: string;
}

const BarcodeScanner = ({ onScan, onClose, language }: BarcodeScannerProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'camera' | 'idle'>('camera');

  useEffect(() => {
    if (mode !== 'camera') return;

    const scanner = new Html5Qrcode('barcode-scanner-region');
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 280, height: 150 } },
      (decodedText) => {
        scanner.stop().catch(() => {});
        onScan(decodedText);
      },
      () => {}
    ).catch((err) => {
      setError(language === 'ar' ? 'لا يمكن الوصول إلى الكاميرا' : 'Cannot access camera');
      console.error('Scanner error:', err);
    });

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [mode]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Stop camera if running
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => {});
    }
    setMode('idle');
    setError('');

    const scanner = new Html5Qrcode('barcode-scanner-region-file');
    try {
      const result = await scanner.scanFile(file, true);
      onScan(result);
    } catch {
      setError(language === 'ar' ? 'لم يتم العثور على باركود في الصورة' : 'No barcode found in the image');
    } finally {
      scanner.clear();
    }
  };

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
          <p className="text-destructive text-sm text-center py-4">{error}</p>
        ) : (
          <p className="text-xs text-muted-foreground text-center">
            {language === 'ar' ? 'وجّه الكاميرا نحو الباركود أو ارفع صورة' : 'Point camera at the barcode or upload an image'}
          </p>
        )}

        {mode === 'camera' && (
          <div id="barcode-scanner-region" className="rounded-xl overflow-hidden" />
        )}
        <div id="barcode-scanner-region-file" className="hidden" />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-foreground hover:bg-accent transition-colors text-sm font-medium"
        >
          <ImagePlus className="w-4 h-4" />
          {language === 'ar' ? 'رفع صورة باركود' : 'Upload Barcode Image'}
        </button>
      </div>
    </div>
  );
};

export default BarcodeScanner;
