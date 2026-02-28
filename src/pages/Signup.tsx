import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import companyLogo from '@/assets/company_logo.jpg';

const Signup = () => {
  const { t, language } = useLanguage();
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  const updateForm = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSignup = async () => {
    if (form.password !== form.confirmPassword) {
      toast({ title: language === 'ar' ? 'خطأ' : 'Error', description: language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (form.password.length < 6) {
      toast({ title: language === 'ar' ? 'خطأ' : 'Error', description: language === 'ar' ? 'كلمة المرور يجب أن تكون ٦ أحرف على الأقل' : 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }

    // Check phone and email uniqueness
    setLoading(true);
    const [{ data: phoneExists }, { data: emailExists }] = await Promise.all([
      supabase.rpc('check_phone_exists', { phone_input: form.phone }),
      supabase.rpc('check_email_exists', { email_input: form.email }),
    ]);
    if (phoneExists) {
      setLoading(false);
      toast({ title: language === 'ar' ? 'خطأ' : 'Error', description: language === 'ar' ? 'رقم الهاتف مستخدم بالفعل' : 'This phone number is already registered', variant: 'destructive' });
      return;
    }
    if (emailExists) {
      setLoading(false);
      toast({ title: language === 'ar' ? 'خطأ' : 'Error', description: language === 'ar' ? 'هذا البريد الإلكتروني مستخدم بالفعل' : 'This email is already registered', variant: 'destructive' });
      return;
    }
    const { error } = await signUp({
      email: form.email,
      password: form.password,
      fullName: form.fullName,
      phone: form.phone,
    });
    setLoading(false);

    if (error) {
      const msg = error.message?.toLowerCase() || '';
      if (msg.includes('already registered') || msg.includes('already been registered')) {
        toast({
          title: language === 'ar' ? 'خطأ' : 'Error',
          description: language === 'ar' ? 'هذا البريد الإلكتروني مستخدم بالفعل' : 'This email is already registered',
          variant: 'destructive',
        });
      } else {
        toast({
          title: language === 'ar' ? 'خطأ' : 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
      return;
    }

    setEmailSent(true);
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto text-center">
            <div className="liquid-glass rounded-2xl p-10">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4 font-playfair">
                {language === 'ar' ? 'تحقق من بريدك الإلكتروني' : 'Check Your Email'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {language === 'ar'
                  ? `لقد أرسلنا رسالة تأكيد إلى ${form.email}. يرجى التحقق من بريدك الإلكتروني لتأكيد حسابك.`
                  : `We've sent a confirmation email to ${form.email}. Please check your inbox to verify your account.`}
              </p>
              <Link to="/login">
                <Button variant="golden" size="lg" className="rounded-xl">
                  {t('login')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <img src={companyLogo} alt="Classy Door" className="w-16 h-16 rounded-xl mx-auto mb-4 object-cover" />
            <h1 className="text-3xl font-bold text-foreground font-playfair">{t('signup')}</h1>
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 2 && <div className={`w-12 h-0.5 ${step > 1 ? 'bg-primary' : 'bg-muted'}`} />}
              </div>
            ))}
          </div>

          <div className="liquid-glass rounded-2xl p-8 space-y-5">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                  </label>
                  <div className="relative">
                    <User className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={(e) => updateForm('fullName', e.target.value)}
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
                      value={form.email}
                      onChange={(e) => updateForm('email', e.target.value)}
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
                      value={form.phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                        updateForm('phone', val);
                      }}
                      maxLength={11}
                      className="w-full bg-background/50 border border-border rounded-xl py-3 ps-11 pe-4 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                      placeholder="01XXXXXXXXX"
                    />
                  </div>
                </div>

                <Button
                  variant="golden"
                  size="lg"
                  className="w-full rounded-xl"
                  onClick={() => {
                    if (!form.fullName || !form.email || !form.phone) {
                      toast({
                        title: language === 'ar' ? 'خطأ' : 'Error',
                        description: language === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill in all fields',
                        variant: 'destructive',
                      });
                      return;
                    }
                    if (form.phone.length !== 11 || !form.phone.startsWith('01')) {
                      toast({
                        title: language === 'ar' ? 'خطأ' : 'Error',
                        description: language === 'ar' ? 'رقم الهاتف يجب أن يكون ١١ رقم ويبدأ بـ 01' : 'Phone number must be 11 digits and start with 01',
                        variant: 'destructive',
                      });
                      return;
                    }
                    setStep(2);
                  }}
                >
                  {language === 'ar' ? 'التالي' : 'Next'}
                  <ArrowIcon className="w-5 h-5" />
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    {language === 'ar' ? 'العنوان (اختياري)' : 'Address (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => updateForm('address', e.target.value)}
                    className="w-full bg-background/50 border border-border rounded-xl py-3 px-4 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                    placeholder={language === 'ar' ? 'أدخل عنوانك' : 'Enter your address'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    {language === 'ar' ? 'كلمة المرور' : 'Password'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => updateForm('password', e.target.value)}
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
                      value={form.confirmPassword}
                      onChange={(e) => updateForm('confirmPassword', e.target.value)}
                      className="w-full bg-background/50 border border-border rounded-xl py-3 ps-11 pe-4 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                      placeholder={language === 'ar' ? 'أعد إدخال كلمة المرور' : 'Confirm your password'}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="flex-1 rounded-xl"
                    onClick={() => setStep(1)}
                  >
                    {language === 'ar' ? 'السابق' : 'Back'}
                  </Button>
                  <Button
                    variant="golden"
                    size="lg"
                    className="flex-1 rounded-xl"
                    onClick={handleSignup}
                    disabled={loading}
                  >
                    {loading
                      ? (language === 'ar' ? 'جاري الإنشاء...' : 'Creating...')
                      : t('signup')}
                  </Button>
                </div>
              </>
            )}
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
