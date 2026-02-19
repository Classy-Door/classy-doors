import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, ShoppingCart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Shop = () => {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <div className="liquid-glass rounded-2xl p-2 flex items-center gap-2">
            <Search className="w-5 h-5 text-muted-foreground ms-3" />
            <input
              type="text"
              placeholder={t('search')}
              className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground py-3 px-2"
            />
            <Button variant="ghost" size="icon" className="rounded-xl">
              <SlidersHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>

        {/* Empty State */}
        <div className="text-center py-20">
          <ShoppingCart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">
            {language === 'ar' ? 'سيتم إضافة الأبواب قريبًا' : 'Doors will be added soon'}
          </p>
        </div>
      </div>

      {/* Floating Cart Button */}
      <Link
        to="/cart"
        className="fixed bottom-6 end-6 z-40"
      >
        <Button variant="golden" size="icon" className="w-14 h-14 rounded-full shadow-xl">
          <ShoppingCart className="w-6 h-6" />
        </Button>
      </Link>
    </div>
  );
};

export default Shop;
