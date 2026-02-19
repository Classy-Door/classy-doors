import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import companyLogo from '@/assets/company_logo.jpg';

const Login = () => {
  const { t, language } = useLanguage();
  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <div className="text-center mb-8">
            <img src={companyLogo} alt="Classy Door" className="w-16 h-16 rounded-xl mx-auto mb-4 object-cover" />
            <h1 className="text-3xl font-bold text-foreground font-playfair">{t('login')}</h1>
          </div>

          <div className="liquid-glass rounded-2xl p-8 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                {language === 'ar' ? 'البريد الإلكتروني أو رقم الهاتف' : 'Email or Phone Number'}
              </label>
              <div className="relative">
                <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  className="w-full bg-background/50 border border-border rounded-xl py-3 ps-11 pe-4 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                  placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني أو رقم هاتفك' : 'Enter your email or phone'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                {language === 'ar' ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  className="w-full bg-background/50 border border-border rounded-xl py-3 ps-11 pe-4 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                  placeholder={language === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
                />
              </div>
            </div>

            <Button variant="golden" size="lg" className="w-full rounded-xl">
              {t('login')}
              <ArrowIcon className="w-5 h-5" />
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {language === 'ar' ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
            <Link to="/signup" className="text-primary font-semibold hover:underline">
              {t('signup')}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
