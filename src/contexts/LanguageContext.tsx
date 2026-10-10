import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'ar' | 'en';

type Translations = Record<string, string>;

const ar: Translations = {
  classyDoor: 'كلاسي دور',
  home: 'الرئيسية',
  shop: 'المتجر',
  verification: 'التحقق',
  account: 'حسابي',
  login: 'تسجيل الدخول',
  signup: 'إنشاء حساب',
  logout: 'تسجيل الخروج',
  heroTitle: 'أبواب تركية فاخرة',
  heroSubtitle: 'أمان. أناقة. جودة لا مثيل لها.',
  shopNow: 'تسوق الآن',
  aboutUs: 'من نحن',
  aboutText: 'منذ أكثر من عشرين عامًا، نعمل في مجال الأبواب لفترة كافية لنرى ما ينجح وما يفشل. عندما كان السوق مليئًا بالأبواب الخشبية والأبواب المعدنية الصينية الهشة، كان العملاء مجبرين على الاختيار بين الأناقة والأمان. بدأنا من هناك أيضًا، لكننا أدركنا بسرعة أن الناس يستحقون الأفضل. بدلاً من اتباع الاتجاه السائد، بحثنا عن حل أقوى ووجدناه في أبواب الأمان التركية، منتج يجمع بين المتانة والتصميم العصري والقدرة على تحمل التكاليف. إحضار هذه الأبواب إلى سوقنا غيّر كل شيء. اليوم، في عام ٢٠٢٦، يرتبط اسمنا بأبواب تحمي المنازل وترتقي بالمساحات وتكسب ثقة العملاء. قصتنا بسيطة. لم نقبل أبدًا بما هو متاح. بنينا سمعتنا على إيجاد ما هو أفضل.',
  viewMore: 'عرض المزيد',
  verifyDoor: 'تحقق من بابك',
  verifyDesc: 'هل لديك باب وتريد التحقق من أنه من إنتاجنا؟',
  verifyNow: 'تحقق الآن',
  contactUs: 'تواصل معنا',
  shorouk: 'الشروق',
  giza: 'الجيزة',
  comingSoon: 'قريبًا',
  comingSoonDesc: 'المزيد من الفروع قريبًا! تابعونا على وسائل التواصل الاجتماعي.',
  cart: 'السلة',
  checkout: 'إتمام الشراء',
  search: 'بحث',
  filter: 'تصفية',
  category: 'الفئة',
  thickness: 'السُمك',
  tag: 'العلامة',
  addToCart: 'أضف إلى السلة',
  specialPromotion: 'عرض خاص',
  bestSeller: 'الأكثر مبيعًا',
  newlyAdded: 'مضاف حديثًا',
  total: 'الإجمالي',
  confirmOrder: 'تأكيد الطلب',
  orderConfirmMsg: 'سيتواصل فريق خدمة العملاء معك في أقرب وقت بخصوص طلبك. يمكنك أيضًا التواصل معنا عبر واتساب.',
  enterDoorCode: 'أدخل رمز الباب المكون من ٦ أرقام',
  doorFound: 'تم العثور على الباب',
  doorNotFound: 'قد يكون هذا الرمز غير صحيح أو حدث خطأ ما. يرجى التواصل معنا.',
  pastOrders: 'الطلبات السابقة',
  currentOrder: 'الطلب الحالي',
  pendingConfirmation: 'في انتظار التأكيد',
  confirmed: 'مؤكد',
  done: 'مكتمل',
  language: 'English',
  allRightsReserved: 'جميع الحقوق محفوظة',
  verifyYourDoor: 'تحقق من بابك',
  ourDoors: 'أبوابنا',
  phone: 'الهاتف',
};

const en: Translations = {
  classyDoor: 'Classy Door',
  home: 'Home',
  shop: 'Shop',
  verification: 'Verification',
  account: 'Account',
  login: 'Log In',
  signup: 'Sign Up',
  logout: 'Log Out',
  heroTitle: 'Premium Turkish Doors',
  heroSubtitle: 'Security. Elegance. Unmatched Quality.',
  shopNow: 'Shop Now',
  aboutUs: 'About Us',
  aboutText: "For more than twenty years, we've been in the door business long enough to see what works and what fails. When the market was filled with wooden doors and fragile Chinese imported metal doors, customers were forced to choose between style and security. We started there too, but quickly realized people deserved better. Instead of following the trend, we searched for a stronger solution and found it in Turkish security doors, a product that combined durability, modern design, and real affordability. Bringing these doors to our market changed everything. Today, in 2026, our name is associated with doors that protect homes, elevate spaces, and earn customer trust. Our story is simple. We never settled for what was available. We built our reputation on finding what was better.",
  viewMore: 'View More',
  verifyDoor: 'Verify Your Door',
  verifyDesc: 'Already have a door and want to verify it is from us?',
  verifyNow: 'Verify Now',
  contactUs: 'Contact Us',
  shorouk: 'Shorouk',
  giza: 'Giza',
  comingSoon: 'Coming Soon',
  comingSoonDesc: 'More locations coming soon! Stay tuned to our socials.',
  cart: 'Cart',
  checkout: 'Checkout',
  search: 'Search',
  filter: 'Filter',
  category: 'Category',
  thickness: 'Thickness',
  tag: 'Tag',
  addToCart: 'Add to Cart',
  specialPromotion: 'Special Promotion',
  bestSeller: 'Best Seller',
  newlyAdded: 'Newly Added',
  total: 'Total',
  confirmOrder: 'Confirm Order',
  orderConfirmMsg: 'Our customer service team will contact you as soon as possible regarding your order. You can also reach out to us through WhatsApp.',
  enterDoorCode: 'Enter your 6-digit door code',
  doorFound: 'Door Found',
  doorNotFound: 'This code may be incorrect or something went wrong. Please contact us.',
  pastOrders: 'Past Orders',
  currentOrder: 'Current Order',
  pendingConfirmation: 'Pending Confirmation',
  confirmed: 'Confirmed',
  done: 'Done',
  language: 'العربية',
  allRightsReserved: 'All Rights Reserved',
  verifyYourDoor: 'Verify Your Door',
  ourDoors: 'Our Doors',
  phone: 'Phone',
};

const translations = { ar, en };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'classy_door_lang';

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved === 'ar' || saved === 'en') return saved;
    } catch {
      // ignore
    }
    return 'ar';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  };

  const t = (key: string) => translations[language][key] || key;
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [language, dir]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
