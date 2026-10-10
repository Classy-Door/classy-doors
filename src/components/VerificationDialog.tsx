import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertCircle, BadgeCheck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

const SPECIAL_CODE = '999999';

interface VerificationDialogProps {
  open: boolean;
  onClose: () => void;
  code: string;
}

const VerificationDialog = ({ open, onClose, code }: VerificationDialogProps) => {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<'idle' | 'found' | 'not_found' | 'special'>('idle');
  const [foundDoor, setFoundDoor] = useState<Tables<'doors'> | null>(null);

  const tagLabel = (tag: string) => {
    const labels: Record<string, { ar: string; en: string }> = {
      special_promotion: { ar: 'عرض خاص', en: 'Special Promotion' },
      best_seller: { ar: 'الأكثر مبيعًا', en: 'Best Seller' },
      newly_added: { ar: 'مضاف حديثًا', en: 'Newly Added' },
      nothing: { ar: '', en: '' },
    };
    return labels[tag]?.[language] || '';
  };

  useEffect(() => {
    const cleanCode = code ? code.trim() : '';
    if (!open || !cleanCode || cleanCode.length < 3) return;

    const verify = async () => {
      setLoading(true);
      setResult('idle');

      if (cleanCode === SPECIAL_CODE || cleanCode.slice(0, 6) === SPECIAL_CODE) {
        setLoading(false);
        setFoundDoor(null);
        setResult('special');
        return;
      }

      // Exact match first
      let { data, error } = await supabase
        .from('doors')
        .select('*')
        .eq('unique_code', cleanCode)
        .maybeSingle();

      // Fallback to 5-char prefix if longer
      if (!data && cleanCode.length > 5) {
        const fallback = await supabase
          .from('doors')
          .select('*')
          .eq('unique_code', cleanCode.slice(0, 5))
          .maybeSingle();
        data = fallback.data;
        error = fallback.error;
      }

      setLoading(false);
      if (data && !error) {
        setFoundDoor(data);
        setResult('found');
      } else {
        setFoundDoor(null);
        setResult('not_found');
      }
    };

    verify();
  }, [open, code]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0 rounded-2xl border-0">
        <DialogTitle className="sr-only">
          {language === 'ar' ? 'التحقق من الباب' : 'Door Verification'}
        </DialogTitle>

        {loading && (
          <div className="p-10 text-center">
            <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">{language === 'ar' ? 'جارٍ البحث...' : 'Searching...'}</p>
          </div>
        )}

        {result === 'found' && foundDoor && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            {foundDoor.photo_url && (
              <div className="aspect-[3/4] max-h-[350px] overflow-hidden">
                <img src={foundDoor.photo_url} alt={`Door ${foundDoor.door_number}`} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-6 space-y-3">
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
          </motion.div>
        )}

        {result === 'special' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-6 space-y-4 text-center">
            <BadgeCheck className="w-16 h-16 text-primary mx-auto" />
            <h2 className="text-2xl font-bold text-foreground font-playfair">Classy Door</h2>
            <p className="text-base font-semibold text-primary">
              {language === 'ar'
                ? 'هذا الباب مستورد بواسطة Classy Door وتركي ١٠٠٪'
                : 'This Door is imported by Classy Door and 100% Turkish'}
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>{language === 'ar' ? '✓ مصنوع من أجود المواد التركية' : '✓ Made from the finest Turkish materials'}</p>
              <p>{language === 'ar' ? '✓ باب أمان مصفح بمعايير أوروبية' : '✓ Armored security door with European standards'}</p>
              <p>{language === 'ar' ? '✓ ضمان الجودة من Classy Door' : '✓ Quality guaranteed by Classy Door'}</p>
            </div>
            <div className="flex items-center gap-2 pt-2 justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <p className="text-sm font-semibold text-primary">
                {language === 'ar' ? 'منتج أصلي موثق' : 'Verified Authentic Product'}
              </p>
            </div>
          </motion.div>
        )}

        {result === 'not_found' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 text-center space-y-3">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
            <p className="text-sm text-destructive font-semibold">{t('doorNotFound')}</p>
            <a href="https://wa.me/201550190587?text=كنت%20عايز%20أستفسر%20عن%20الأبواب%20المصفحة" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">{t('contactUs')}</Button>
            </a>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VerificationDialog;
