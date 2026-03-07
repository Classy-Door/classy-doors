import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertCircle, Camera, BadgeCheck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import WhatsAppButton from '@/components/WhatsAppButton';
import BarcodeScanner from '@/components/BarcodeScanner';

const SPECIAL_CODE = '999999';

const Verification = () => {
  const { t, language } = useLanguage();
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<'idle' | 'found' | 'not_found' | 'special'>('idle');
  const [foundDoor, setFoundDoor] = useState<Tables<'doors'> | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    const urlCode = searchParams.get('code');
    if (urlCode && urlCode.length >= 5) {
      handleVerify(urlCode);
    }
  }, []);

  const handleVerify = async (searchInput?: string) => {
    const input = searchInput || code;
    if (input.length < 5) return;
    setLoading(true);
    setResult('idle');

    // Special code check
    if (input.slice(0, 6) === SPECIAL_CODE) {
      setLoading(false);
      setFoundDoor(null);
      setResult('special');
      return;
    }

    const searchCode = input.slice(0, 5);
    const { data, error } = await supabase
      .from('doors')
      .select('*')
      .eq('unique_code', searchCode)
      .maybeSingle();
    setLoading(false);
    if (data && !error) {
      setFoundDoor(data);
      setResult('found');
    } else {
      setFoundDoor(null);
      setResult('not_found');
    }
  };

  const handleBarcodeScan = (scannedCode: string) => {
    setShowScanner(false);
    const cleaned = scannedCode.replace(/\D/g, '').slice(0, 6);
    if (cleaned.length >= 5) {
      handleVerify(cleaned);
    }
  };

  const tagLabel = (tag: string) => {
    const labels: Record<string, { ar: string; en: string }> = {
      special_promotion: { ar: 'عرض خاص', en: 'Special Promotion' },
      best_seller: { ar: 'الأكثر مبيعًا', en: 'Best Seller' },
      newly_added: { ar: 'مضاف حديثًا', en: 'Newly Added' },
      nothing: { ar: '', en: '' },
    };
    return labels[tag]?.[language] || '';
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center pt-20 pb-10">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto text-center">
          <ShieldCheck className="w-16 h-16 text-primary mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-foreground mb-2 font-playfair">{t('verifyDoor')}</h1>
          <p className="text-muted-foreground mb-8">{t('enterDoorCode')}</p>

          <div className="liquid-glass rounded-2xl p-6">
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => { setCode(e.target.value.replace(/\D/g, '')); setResult('idle'); setFoundDoor(null); }}
              placeholder="000000"
              dir="ltr"
              className="w-full text-center text-4xl font-bold tracking-[0.5em] bg-transparent border-b-2 border-border focus:border-primary outline-none py-4 text-foreground placeholder:text-muted-foreground/30"
            />
            <div className="flex gap-3 mt-6">
              <Button variant="golden" size="lg" className="flex-1 rounded-xl" onClick={() => handleVerify()} disabled={code.length !== 6 || loading}>
                {loading ? (language === 'ar' ? 'جارٍ البحث...' : 'Searching...') : t('verifyNow')}
              </Button>
              <Button variant="glass" size="lg" className="rounded-xl" onClick={() => setShowScanner(true)}>
                <Camera className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {result === 'found' && foundDoor && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
              <div className="liquid-glass rounded-2xl overflow-hidden">
                {foundDoor.photo_url && (
                  <div className="aspect-[3/4] max-h-[400px] overflow-hidden">
                    <img src={foundDoor.photo_url} alt={`Door ${foundDoor.door_number}`} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-6 space-y-3 text-start">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-foreground font-playfair">
                      {language === 'ar' ? `باب ${foundDoor.door_number}` : `Door ${foundDoor.door_number}`}
                    </h2>
                    {foundDoor.tag !== 'nothing' && (
                      <span className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-full font-bold">{tagLabel(foundDoor.tag)}</span>
                    )}
                  </div>
                  {foundDoor.description && <p className="text-sm text-muted-foreground">{foundDoor.description}</p>}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-muted rounded-xl p-3 text-center">
                      <p className="text-xs text-muted-foreground">{t('category')}</p>
                      <p className="text-sm font-bold text-foreground">{foundDoor.category}</p>
                    </div>
                    <div className="bg-muted rounded-xl p-3 text-center">
                      <p className="text-xs text-muted-foreground">{t('thickness')}</p>
                      <p className="text-sm font-bold text-foreground">{foundDoor.width} {language === 'ar' ? 'سم' : 'cm'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 justify-center">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    <p className="text-sm font-semibold text-primary">{t('doorFound')}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {result === 'special' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
              <div className="liquid-glass rounded-2xl overflow-hidden p-6 space-y-4 text-center">
                <BadgeCheck className="w-16 h-16 text-primary mx-auto" />
                <h2 className="text-2xl font-bold text-foreground font-playfair">
                  {language === 'ar' ? 'Classy Door' : 'Classy Door'}
                </h2>
                <p className="text-base font-semibold text-primary">
                  {language === 'ar'
                    ? 'هذا الباب مستورد بواسطة Classy Door وتركي ١٠٠٪'
                    : 'This Door is imported by Classy Door and 100% Turkish'}
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    {language === 'ar'
                      ? '✓ مصنوع من أجود المواد التركية'
                      : '✓ Made from the finest Turkish materials'}
                  </p>
                  <p>
                    {language === 'ar'
                      ? '✓ باب أمان مصفح بمعايير أوروبية'
                      : '✓ Armored security door with European standards'}
                  </p>
                  <p>
                    {language === 'ar'
                      ? '✓ ضمان الجودة من Classy Door'
                      : '✓ Quality guaranteed by Classy Door'}
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-2 justify-center">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <p className="text-sm font-semibold text-primary">
                    {language === 'ar' ? 'منتج أصلي موثق' : 'Verified Authentic Product'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {result === 'not_found' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-5 rounded-xl bg-destructive/10 border border-destructive/30">
              <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
              <p className="text-sm text-destructive font-semibold">{t('doorNotFound')}</p>
              <a href="https://wa.me/201550190587?text=كنت%20عايز%20أستفسر%20عن%20الأبواب%20المصفحة" target="_blank" rel="noopener noreferrer" className="inline-block mt-3">
                <Button variant="outline" size="sm">{t('contactUs')}</Button>
              </a>
            </motion.div>
          )}
        </motion.div>
      </div>

      {showScanner && (
        <BarcodeScanner
          language={language}
          onScan={handleBarcodeScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      <WhatsAppButton />
    </div>
  );
};

export default Verification;
