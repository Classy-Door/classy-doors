import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowLeft, ArrowRight, ChevronDown, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import ContactDialog from '@/components/ContactDialog';
import VerificationDialog from '@/components/VerificationDialog';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import heroImage from '@/assets/hero-door.jpg';
import WhatsAppButton from '@/components/WhatsAppButton';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0, 0, 0.2, 1] as const },
  }),
};

const Index = () => {
  const { t, language } = useLanguage();
  const [contactOpen, setContactOpen] = useState(false);
  const [doors, setDoors] = useState<Tables<'doors'>[]>([]);
  const [specialDoors, setSpecialDoors] = useState<Tables<'doors'>[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyOpen, setVerifyOpen] = useState(false);
  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  useEffect(() => {
    const fetchDoors = async () => {
      const { data } = await supabase
        .from('doors')
        .select('*')
        .eq('featured', true)
        .limit(3);
      if (data) setDoors(data);
    };
    const fetchSpecialDoors = async () => {
      const { data } = await supabase
        .from('doors')
        .select('*')
        .eq('tag', 'special_promotion')
        .limit(3);
      if (data) setSpecialDoors(data);
    };
    fetchDoors();
    fetchSpecialDoors();
  }, []);

  // Auto-open verification dialog from URL ?code=
  useEffect(() => {
    let urlCode = searchParams.get('code');
    if (!urlCode) {
      const params = new URLSearchParams(window.location.search);
      urlCode = params.get('code');
    }
    if (urlCode && urlCode.length >= 5) {
      setVerifyCode(urlCode.replace(/\D/g, '').slice(0, 6));
      setVerifyOpen(true);
      // Clean the URL
      searchParams.delete('code');
      setSearchParams(searchParams, { replace: true });
    }
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Turkish Door" className="w-full h-full object-cover" />
          <div className="hero-overlay absolute inset-0" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div initial="hidden" animate="visible" className="max-w-3xl mx-auto">
            <motion.div variants={fadeUp} custom={0} className="flex justify-center mb-6">
              <div className="flex items-center gap-2 liquid-glass px-4 py-2 rounded-full">
                <ShieldCheck className="w-5 h-5 text-secondary" />
                <span className="text-sm font-semibold text-background">
                  {language === 'ar' ? 'صنع في تركيا' : 'Made in Turkey'}
                </span>
              </div>
            </motion.div>

            <motion.h1 variants={fadeUp} custom={1} className="text-5xl md:text-7xl font-black text-background mb-4 font-playfair leading-tight">
              {t('heroTitle')}
            </motion.h1>

            <motion.p variants={fadeUp} custom={2} className="text-xl md:text-2xl text-background/80 mb-8 font-cairo">
              {t('heroSubtitle')}
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex gap-4 justify-center flex-wrap">
              <Link to="/shop">
                <Button variant="golden" size="lg" className="text-lg px-8 py-6 rounded-xl">
                  {t('shopNow')}
                  <ArrowIcon className="w-5 h-5" />
                </Button>
              </Link>
              <button onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}>
                <Button variant="glass" size="lg" className="text-lg px-8 py-6 rounded-xl text-background">
                  {t('aboutUs')}
                  <ChevronDown className="w-5 h-5" />
                </Button>
              </button>
            </motion.div>
          </motion.div>
        </div>

        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2" animate={{ y: [0, 12, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <ChevronDown className="w-8 h-8 text-background/50" />
        </motion.div>
      </section>

      {/* ABOUT US */}
      <section id="about" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8 justify-center">
              <div className="h-px flex-1 max-w-16 bg-secondary" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground font-playfair text-center">{t('aboutUs')}</h2>
              <div className="h-px flex-1 max-w-16 bg-secondary" />
            </div>
            <div className="liquid-glass rounded-2xl p-8 md:p-12">
              <p className="text-foreground/80 leading-loose text-lg text-center">{t('aboutText')}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SHOP PREVIEW */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-12 justify-center">
              <div className="h-px flex-1 max-w-16 bg-secondary" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground font-playfair text-center">{t('ourDoors')}</h2>
              <div className="h-px flex-1 max-w-16 bg-secondary" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {doors.length > 0 ? doors.map((door, i) => (
                <motion.div key={door.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all group">
                  <div className="aspect-[3/4] bg-muted overflow-hidden">
                    {door.photo_url ? (
                      <img src={door.photo_url} alt={`Door ${door.door_number}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShieldCheck className="w-16 h-16 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-bold text-foreground">
                      {language === 'ar' ? `باب ${door.door_number}` : `Door ${door.door_number}`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {door.price.toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
                    </p>
                  </div>
                </motion.div>
              )) : [1, 2, 3].map((i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all group">
                  <div className="aspect-[3/4] bg-muted flex items-center justify-center">
                    <ShieldCheck className="w-16 h-16 text-muted-foreground/30 group-hover:text-primary/40 transition-colors" />
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-bold text-foreground">{language === 'ar' ? `باب تركي ${i}` : `Turkish Door ${i}`}</p>
                    <p className="text-xs text-muted-foreground mt-1">{language === 'ar' ? 'قريبًا' : 'Coming Soon'}</p>
                  </div>
                </motion.div>
              ))}

              {/* View More */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4, duration: 0.5 }}>
                <Link to="/shop" className="h-full min-h-[320px] bg-primary/10 rounded-2xl flex flex-col items-center justify-center gap-4 border-2 border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/15 transition-all group">
                  <ArrowIcon className="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-lg font-bold text-primary">{t('viewMore')}</span>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SPECIAL OFFERS */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-12 justify-center">
              <div className="h-px flex-1 max-w-16 bg-secondary" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground font-playfair text-center">
                {language === 'ar' ? 'عروض خاصة' : 'Special Offers'}
              </h2>
              <div className="h-px flex-1 max-w-16 bg-secondary" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {specialDoors.length > 0 ? specialDoors.map((door, i) => (
                <motion.div key={door.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all group">
                  <div className="aspect-[3/4] bg-muted overflow-hidden">
                    {door.photo_url ? (
                      <img src={door.photo_url} alt={`Door ${door.door_number}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Sparkles className="w-16 h-16 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-bold text-foreground">
                      {language === 'ar' ? `باب ${door.door_number}` : `Door ${door.door_number}`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {door.price.toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
                    </p>
                  </div>
                </motion.div>
              )) : [1, 2, 3].map((i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all group">
                  <div className="aspect-[3/4] bg-muted flex items-center justify-center">
                    <Sparkles className="w-16 h-16 text-muted-foreground/30 group-hover:text-secondary/40 transition-colors" />
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-bold text-foreground">{language === 'ar' ? `عرض خاص ${i}` : `Special Offer ${i}`}</p>
                    <p className="text-xs text-muted-foreground mt-1">{language === 'ar' ? 'قريبًا' : 'Coming Soon'}</p>
                  </div>
                </motion.div>
              ))}

              {/* View More */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4, duration: 0.5 }}>
                <Link to="/shop?tag=special_promotion" className="h-full min-h-[320px] bg-secondary/10 rounded-2xl flex flex-col items-center justify-center gap-4 border-2 border-dashed border-secondary/30 hover:border-secondary/60 hover:bg-secondary/15 transition-all group">
                  <ArrowIcon className="w-10 h-10 text-secondary group-hover:scale-110 transition-transform" />
                  <span className="text-lg font-bold text-secondary">{t('viewMore')}</span>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* VERIFY YOUR DOOR */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="max-w-2xl mx-auto text-center">
            <div className="liquid-glass-dark rounded-2xl p-10 md:p-14">
              <ShieldCheck className="w-14 h-14 text-secondary mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-primary-foreground mb-4 font-playfair">{t('verifyDoor')}</h2>
              <p className="text-primary-foreground/70 mb-8 text-lg">{t('verifyDesc')}</p>
              <Link to="/verification">
                <Button variant="golden" size="lg" className="text-lg px-8 py-6 rounded-xl">
                  {t('verifyNow')}
                  <ArrowIcon className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CONTACT US */}
      <section id="contact" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground font-playfair mb-6">{t('contactUs')}</h2>
            <Button variant="glass" size="lg" className="text-lg px-8 py-6 rounded-xl" onClick={() => setContactOpen(true)}>
              {t('contactUs')}
              <MapPinIcon className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      <ContactDialog open={contactOpen} onClose={() => setContactOpen(false)} />
      <WhatsAppButton />
    </>
  );
};

const MapPinIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

export default Index;
