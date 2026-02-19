import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import companyLogo from '@/assets/company_logo.jpg';

const Header = () => {
  const { t, language, setLanguage } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { key: 'home', path: '/' },
    { key: 'shop', path: '/shop' },
    { key: 'verification', path: '/verification' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 liquid-glass">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img src={companyLogo} alt="Classy Door" className="w-10 h-10 rounded-lg object-cover" />
          <span className="text-xl font-bold text-foreground font-playfair">
            {t('classyDoor')}
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.key}
              to={link.path}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                isActive(link.path)
                  ? 'bg-primary/15 text-primary'
                  : 'text-foreground/70 hover:text-foreground hover:bg-primary/5'
              }`}
            >
              {t(link.key)}
            </Link>
          ))}

          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-foreground/70 hover:text-foreground hover:bg-primary/5 transition-all"
          >
            <Globe className="w-4 h-4" />
            {t('language')}
          </button>

          {/* Auth Buttons */}
          <div className="flex items-center gap-2 ms-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">{t('login')}</Button>
            </Link>
            <Link to="/signup">
              <Button variant="glass" size="sm">{t('signup')}</Button>
            </Link>
          </div>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-foreground"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden liquid-glass border-t border-border/30 overflow-hidden"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.key}
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                    isActive(link.path)
                      ? 'bg-primary/15 text-primary'
                      : 'text-foreground/70 hover:text-foreground'
                  }`}
                >
                  {t(link.key)}
                </Link>
              ))}

              <button
                onClick={() => { setLanguage(language === 'ar' ? 'en' : 'ar'); setMenuOpen(false); }}
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm text-foreground/70 hover:text-foreground"
              >
                <Globe className="w-4 h-4" />
                {t('language')}
              </button>

              <div className="flex gap-2 pt-2 border-t border-border/30">
                <Link to="/login" className="flex-1" onClick={() => setMenuOpen(false)}>
                  <Button variant="ghost" className="w-full">{t('login')}</Button>
                </Link>
                <Link to="/signup" className="flex-1" onClick={() => setMenuOpen(false)}>
                  <Button variant="glass" className="w-full">{t('signup')}</Button>
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
