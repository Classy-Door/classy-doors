import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe, LogOut, Shield, ShoppingCart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import companyLogo from '@/assets/company_logo.jpg';
import userLogo from '@/assets/userlogo.jpg';

const Header = () => {
  const { t, language, setLanguage } = useLanguage();
  const { user, profile, signOut, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { key: 'home', path: '/' },
    { key: 'shop', path: '/shop' },
    { key: 'verification', path: '/verification' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50" style={{ background: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}>
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

          {/* Cart Icon */}
          <Link
            to="/cart"
            className={`relative p-2 rounded-lg transition-all flex items-center justify-center ${
              isActive('/cart')
                ? 'bg-primary/15 text-primary'
                : 'text-foreground/70 hover:text-foreground hover:bg-primary/5'
            }`}
            title={t('cart')}
            aria-label={t('cart')}
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -end-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center shadow">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Link>

          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-foreground/70 hover:text-foreground hover:bg-primary/5 transition-all"
          >
            <Globe className="w-4 h-4" />
            {t('language')}
          </button>

          {/* Auth */}
          <div className="flex items-center gap-2 ms-2">
            {user ? (
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <Link to="/admin" className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-all" title="Admin">
                    <Shield className="w-5 h-5" />
                  </Link>
                )}
                <Link to="/account" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <img src={userLogo} alt="User" className="w-8 h-8 rounded-full object-cover" />
                  <span className="text-sm font-semibold text-foreground max-w-[120px] truncate">
                    {profile?.full_name || user.email}
                  </span>
                </Link>
                <button onClick={signOut} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">{t('login')}</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="glass" size="sm">{t('signup')}</Button>
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Mobile Nav Header Controls */}
        <div className="flex items-center gap-1 md:hidden">
          <Link
            to="/cart"
            className="relative p-2 text-foreground"
            title={t('cart')}
            aria-label={t('cart')}
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -end-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Link>
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-foreground">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
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

              <Link
                to="/cart"
                onClick={() => setMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                  isActive('/cart')
                    ? 'bg-primary/15 text-primary'
                    : 'text-foreground/70 hover:text-foreground'
                }`}
              >
                <span className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  {t('cart')}
                </span>
                {totalItems > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                    {totalItems}
                  </span>
                )}
              </Link>

              <button
                onClick={() => { setLanguage(language === 'ar' ? 'en' : 'ar'); setMenuOpen(false); }}
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm text-foreground/70 hover:text-foreground"
              >
                <Globe className="w-4 h-4" />
                {t('language')}
              </button>

              <div className="flex gap-2 pt-2 border-t border-border/30">
                {user ? (
                  <>
                    {isAdmin && (
                      <Link to="/admin" className="flex-1" onClick={() => setMenuOpen(false)}>
                        <Button variant="golden" className="w-full"><Shield className="w-4 h-4" /> Admin</Button>
                      </Link>
                    )}
                    <Link to="/account" className="flex-1" onClick={() => setMenuOpen(false)}>
                      <Button variant="glass" className="w-full">{t('account')}</Button>
                    </Link>
                    <Button variant="ghost" className="flex-1" onClick={() => { signOut(); setMenuOpen(false); }}>
                      {t('logout')}
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="flex-1" onClick={() => setMenuOpen(false)}>
                      <Button variant="ghost" className="w-full">{t('login')}</Button>
                    </Link>
                    <Link to="/signup" className="flex-1" onClick={() => setMenuOpen(false)}>
                      <Button variant="glass" className="w-full">{t('signup')}</Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
