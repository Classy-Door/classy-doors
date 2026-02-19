import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Account = () => {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto text-center"
        >
          <User className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-foreground mb-4 font-playfair">{t('account')}</h1>
          <p className="text-muted-foreground mb-8">
            {language === 'ar' ? 'يرجى تسجيل الدخول لعرض حسابك' : 'Please log in to view your account'}
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/login">
              <Button variant="glass" size="lg">{t('login')}</Button>
            </Link>
            <Link to="/signup">
              <Button variant="golden" size="lg">{t('signup')}</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Account;
