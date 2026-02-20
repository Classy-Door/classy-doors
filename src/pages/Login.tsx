import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import companyLogo from '@/assets/company_logo.jpg';

const Login = () => {
  const { t, language } = useLanguage();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resending, setResending] = useState(false);
  const [resolvedEmail, setResolvedEmail] = useState('');

  const handleLogin = async () => {
    if (!emailOrPhone || !password) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const { error } = await signIn({ emailOrPhone, password });
    setLoading(false);

    if (error) {
      const msg = error.message?.toLowerCase() || '';
      if (msg.includes('email not confirmed')) {
        // Resolve the email for resend (if they logged in with phone)
        let email = emailOrPhone;
        if (!emailOrPhone.includes('@')) {
          const { data } = await supabase.rpc('get_email_by_phone', { phone_input: emailOrPhone });
          if (data) email = data;
        }
        setResolvedEmail(email);
        setShowResend(true);
        toast({
          title: language === 'ar' ? 'تأكيد البريد' : 'Email Not Confirmed',
          description: language === 'ar'
            ? 'يجب تأكيد بريدك الإلكتروني أولاً. يمكنك إعادة إرسال رسالة التأكيد.'
            : 'You need to confirm your email first. You can resend the confirmation below.',
          variant: 'destructive',
        });
      } else {
        setShowResend(false);
        toast({
          title: language === 'ar' ? 'خطأ' : 'Error',
          description: language === 'ar'
            ? 'يرجى التحقق من البريد الإلكتروني/رقم الهاتف وكلمة المرور'
            : 'Please check your email/phone number and password',
          variant: 'destructive',
        });
      }
      return;
    }

    setShowResend(false);
    navigate('/');
  };

  const handleResend = async () => {
    if (!resolvedEmail) return;
    setResending(true);
    const { error } = await supabase.auth.resend({ type: 'signup', email: resolvedEmail });
    setResending(false);
    if (error) {
      toast({ title: language === 'ar' ? 'خطأ' : 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: language === 'ar' ? 'تم الإرسال' : 'Sent!', description: language === 'ar' ? 'تم إرسال رسالة التأكيد. تحقق من بريدك الإلكتروني.' : 'Confirmation email sent. Check your inbox.' });
      setShowResend(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto">
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
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full bg-background/50 border border-border rounded-xl py-3 ps-11 pe-4 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                  placeholder={language === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
                />
              </div>
            </div>

            <Button
              variant="golden"
              size="lg"
              className="w-full rounded-xl"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? (language === 'ar' ? 'جاري الدخول...' : 'Signing in...') : t('login')}
              <ArrowIcon className="w-5 h-5" />
            </Button>

            {showResend && (
              <Button
                variant="outline"
                size="lg"
                className="w-full rounded-xl"
                onClick={handleResend}
                disabled={resending}
              >
                <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
                {resending
                  ? (language === 'ar' ? 'جاري الإرسال...' : 'Sending...')
                  : (language === 'ar' ? 'إعادة إرسال رسالة التأكيد' : 'Resend Confirmation Email')}
              </Button>
            )}
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
