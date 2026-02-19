import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

const Checkout = () => {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto text-center"
        >
          <h1 className="text-3xl font-bold text-foreground mb-4 font-playfair">{t('checkout')}</h1>
          <div className="liquid-glass rounded-2xl p-8">
            <p className="text-muted-foreground mb-6">{t('orderConfirmMsg')}</p>
            <a
              href="https://wa.me/201550190587?text=Can%20I%20Know%20more%20about%20Turkish%20doors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="golden" size="lg" className="rounded-xl">
                WhatsApp
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Checkout;
