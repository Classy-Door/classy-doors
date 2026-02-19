import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, Lock, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import companyLogo from '@/assets/company_logo.jpg';

const Signup = () => {
  const { t, language } = useLanguage();
  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <div className="text-center mb-8">
            <img src={companyLogo} alt="Classy Door" className="w-16 h-16 rounded-xl mx-auto mb-4 object-cover" />
            <h1 className="text-3xl font-bold text-foreground font-playfair">{t('signup')}</h1>
          </div>

          <div className="liquid-glass rounded-2xl p-8 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
              </label>
              <div className="relative">
                <User className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  className="w-full bg-background/50 border border-border rounded-xl py-3 ps-11 pe-4 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                  placeholder={language === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
              </label>
              <div className="relative">
                <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  className="w-full bg-background/50 border border-border rounded-xl py-3 ps-11 pe-4 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                  placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
              </label>
              <div className="relative">
                <Phone className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="tel"
                  dir="ltr"
                  className="w-full bg-background/50 border border-border rounded-xl py-3 ps-11 pe-4 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                  placeholder="01XXXXXXXXX"
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
                  placeholder={language === 'ar' ? 'أدخل كلمة المرور' : 'Create a password'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                {language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
              </label>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  className="w-full bg-background/50 border border-border rounded-xl py-3 ps-11 pe-4 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                  placeholder={language === 'ar' ? 'أعد إدخال كلمة المرور' : 'Confirm your password'}
                />
              </div>
            </div>

            <Button variant="golden" size="lg" className="w-full rounded-xl">
              {t('signup')}
              <ArrowIcon className="w-5 h-5" />
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {language === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              {t('login')}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
