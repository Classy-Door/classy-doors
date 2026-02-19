import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

const Verification = () => {
  const { t, language } = useLanguage();
  const [code, setCode] = useState('');
  const [result, setResult] = useState<'idle' | 'not_found'>('idle');

  const handleVerify = () => {
    if (code.length >= 5) {
      // Take first 5 digits from the right
      const searchCode = code.slice(-6, -1) || code.slice(0, 5);
      // Will search database once connected
      setResult('not_found');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto text-center"
        >
          <ShieldCheck className="w-16 h-16 text-primary mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-foreground mb-2 font-playfair">{t('verifyDoor')}</h1>
          <p className="text-muted-foreground mb-8">{t('enterDoorCode')}</p>

          <div className="liquid-glass rounded-2xl p-6">
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => { setCode(e.target.value.replace(/\D/g, '')); setResult('idle'); }}
              placeholder="000000"
              dir="ltr"
              className="w-full text-center text-4xl font-bold tracking-[0.5em] bg-transparent border-b-2 border-border focus:border-primary outline-none py-4 text-foreground placeholder:text-muted-foreground/30"
            />

            <Button
              variant="golden"
              size="lg"
              className="w-full mt-6 rounded-xl"
              onClick={handleVerify}
              disabled={code.length < 6}
            >
              {t('verifyNow')}
            </Button>
          </div>

          {result === 'not_found' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-xl bg-accent/10 border border-accent/30"
            >
              <p className="text-sm text-accent font-semibold">{t('doorNotFound')}</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Verification;
