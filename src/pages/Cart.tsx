import { motion } from 'framer-motion';
import { ShoppingCart as CartIcon, Trash2, Plus, Minus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Cart = () => {
  const { t, language } = useLanguage();
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-20">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <CartIcon className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-foreground mb-4 font-playfair">{t('cart')}</h1>
          <p className="text-muted-foreground mb-6">{language === 'ar' ? 'سلة التسوق فارغة' : 'Your cart is empty'}</p>
          <Link to="/shop">
            <Button variant="golden" className="rounded-xl">{t('shopNow')}</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground mb-8 font-playfair">{t('cart')}</h1>

        <div className="space-y-4">
          {items.map((item, i) => (
            <motion.div key={item.door_id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-2xl p-4 shadow-md flex gap-4">
              {/* Thumbnail */}
              <div className="w-20 h-24 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                {item.photo_url ? (
                  <img src={item.photo_url} alt={`Door ${item.door_number}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <CartIcon className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-foreground">
                      {language === 'ar' ? `باب ${item.door_number}` : `Door ${item.door_number}`}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.category} · {item.width}{language === 'ar' ? 'سم' : 'cm'}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.door_id)} className="text-destructive hover:text-destructive/80">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Right qty */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{language === 'ar' ? 'يمين' : 'Right'}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.door_id, Math.max(0, item.quantity_right - 1), item.quantity_left)}
                      className="w-6 h-6 rounded-full bg-muted flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                    <span className="text-sm font-bold w-6 text-center">{item.quantity_right}</span>
                    <button onClick={() => updateQuantity(item.door_id, item.quantity_right + 1, item.quantity_left)}
                      className="w-6 h-6 rounded-full bg-muted flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                  </div>
                </div>

                {/* Left qty */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{language === 'ar' ? 'يسار' : 'Left'}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.door_id, item.quantity_right, Math.max(0, item.quantity_left - 1))}
                      className="w-6 h-6 rounded-full bg-muted flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                    <span className="text-sm font-bold w-6 text-center">{item.quantity_left}</span>
                    <button onClick={() => updateQuantity(item.door_id, item.quantity_right, item.quantity_left + 1)}
                      className="w-6 h-6 rounded-full bg-muted flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                  </div>
                </div>

                <p className="text-sm font-bold text-primary text-end">
                  {(item.price * (item.quantity_right + item.quantity_left)).toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Total & Checkout */}
        <div className="mt-8 bg-card rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <span className="text-lg font-bold text-foreground">{t('total')}</span>
            <span className="text-2xl font-bold text-primary">
              {totalPrice.toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
            </span>
          </div>
          <Link to="/checkout">
            <Button variant="golden" size="lg" className="w-full rounded-xl text-lg">
              {t('checkout')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
