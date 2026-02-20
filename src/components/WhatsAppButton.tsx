import { MessageCircle } from 'lucide-react';

const WHATSAPP_URL = 'https://wa.me/201550190587?text=Can%20I%20Know%20more%20about%20Turkish%20doors';

const WhatsAppButton = () => {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 start-6 z-40 w-14 h-14 bg-[#25D366] hover:bg-[#1ebe57] text-white rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-110"
      aria-label="WhatsApp"
    >
      <svg viewBox="0 0 32 32" className="w-7 h-7 fill-white">
        <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16.004c0 3.502 1.14 6.746 3.072 9.378L1.062 31.16l5.964-1.966A15.921 15.921 0 0016.004 32C24.826 32 32 24.826 32 16.004 32 7.176 24.826 0 16.004 0zm9.318 22.612c-.39 1.1-1.932 2.012-3.174 2.278-.852.18-1.962.322-5.702-1.226-4.786-1.98-7.864-6.832-8.102-7.148-.228-.316-1.918-2.554-1.918-4.872s1.214-3.456 1.644-3.928c.39-.428.924-.626 1.234-.626.15 0 .284.008.406.014.43.018.644.042.928.716.354.844 1.218 2.962 1.322 3.178.106.216.212.502.074.796-.128.3-.234.434-.45.682-.216.248-.422.44-.638.71-.198.234-.42.484-.178.932.242.448 1.076 1.774 2.312 2.874 1.59 1.416 2.93 1.854 3.348 2.058.418.204.662.172.906-.102.252-.284 1.078-1.254 1.366-1.684.282-.43.57-.358.956-.214.39.144 2.472 1.166 2.896 1.378.424.214.706.32.81.498.104.178.104 1.034-.286 2.134z" />
      </svg>
    </a>
  );
};

export default WhatsAppButton;
