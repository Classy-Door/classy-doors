import { motion } from 'framer-motion';
import { ShoppingCart as CartIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

const Cart = () => {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto text-center"
        >
          <CartIcon className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-foreground mb-4 font-playfair">{t('cart')}</h1>
          <p className="text-muted-foreground">
            {language === 'ar' ? 'سلة التسوق فارغة' : 'Your cart is empty'}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Cart;
