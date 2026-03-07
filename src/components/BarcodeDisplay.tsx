import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { Download } from 'lucide-react';

interface BarcodeDisplayProps {
  code: string;
  label?: string;
  showDownload?: boolean;
  width?: number;
  height?: number;
}

const BarcodeDisplay = ({ code, label, showDownload = false, width = 2, height = 60 }: BarcodeDisplayProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && code) {
      try {
        JsBarcode(svgRef.current, code, {
          format: 'CODE128',
          width,
          height,
          displayValue: false,
          fontSize: 14,
          margin: 10,
          background: '#ffffff',
          lineColor: '#000000',
        });
      } catch {
        // invalid barcode value
      }
    }
  }, [code, width, height]);

  const handleDownload = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx?.scale(2, 2);
      ctx?.drawImage(img, 0, 0);
      const link = document.createElement('a');
      link.download = `barcode-${label || code}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  if (!code) return null;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="bg-white rounded-lg p-2">
        <svg ref={svgRef} />
      </div>
      {showDownload && (
        <button
          onClick={handleDownload}
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-semibold"
        >
          <Download className="w-3 h-3" />
          Download
        </button>
      )}
    </div>
  );
};

export default BarcodeDisplay;
