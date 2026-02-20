import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Phone, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

interface ContactDialogProps {
  open: boolean;
  onClose: () => void;
}

const locations = [
  {
    key: 'shorouk',
    phones: ['01550190587', '01022230829'],
    mapUrl: 'https://maps.app.goo.gl/ueqAAXEpUpWn4yPJ8?g_st=ac',
    embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1727!2d31.6278!3d30.1581!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14581e537b95a8f3%3A0x6e7220116cfdc80d!2sHardwood%20%D9%85%D8%B5%D9%81%D8%AD!5e0!3m2!1sar!2seg!4v1700000000000',
    descriptionAr: 'تقاطع طريق اسماعيلية الصحراوى مع الإقليمى',
    descriptionEn: 'Intersection of Ismailia Desert Road and Regional Road',
  },
  {
    key: 'giza',
    phones: ['01022230831', '01140039220'],
    mapUrl: 'https://maps.app.goo.gl/oaRguJP9kqHA1yun7?g_st=ac',
    embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1733!2d31.1305!3d29.9760!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x145846e2c1a1a1a1%3A0x1234567890abcdef!2sKafr%20Al%20Manfi%20Sakara%20Rd!5e0!3m2!1sar!2seg!4v1700000000000',
    descriptionAr: 'نزلة الطريق السياحى - الدائري',
    descriptionEn: 'Tourist Road Exit - Ring Road',
  },
];

const ContactDialog = ({ open, onClose }: ContactDialogProps) => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { key: 'shorouk', label: t('shorouk') },
    { key: 'giza', label: t('giza') },
    { key: 'comingSoon', label: t('comingSoon') },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-popover rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h2 className="text-xl font-bold text-foreground">{t('contactUs')}</h2>
                <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-border">
                {tabs.map((tab, i) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(i)}
                    className={`flex-1 py-3 text-sm font-semibold transition-all ${
                      activeTab === i
                        ? 'text-primary border-b-2 border-primary bg-primary/5'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="p-5 min-h-[200px]">
                {activeTab < 2 ? (
                  <div className="space-y-4">
                    {/* Map */}
                    <a
                      href={locations[activeTab].mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-colors group"
                    >
                      <iframe
                        src={locations[activeTab].embedUrl}
                        className="w-full h-40 pointer-events-none"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={locations[activeTab].key}
                      />
                    </a>

                    {/* Address */}
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                      <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <p className="text-sm text-foreground">
                        {language === 'ar' ? locations[activeTab].descriptionAr : locations[activeTab].descriptionEn}
                      </p>
                    </div>

                    {/* Phones */}
                    <div className="space-y-2">
                      {locations[activeTab].phones.map((phone) => (
                        <a
                          key={phone}
                          href={`tel:${phone}`}
                          className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-primary/5 transition-colors"
                        >
                          <Phone className="w-5 h-5 text-primary shrink-0" />
                          <span className="text-sm font-semibold text-foreground" dir="ltr">{phone}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 gap-3">
                    <Clock className="w-10 h-10 text-secondary" />
                    <p className="text-muted-foreground text-center">{t('comingSoonDesc')}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ContactDialog;
