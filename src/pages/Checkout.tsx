import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Checkout = () => {
  const { t, language } = useLanguage();
  const { items, totalPrice, clearCart } = useCart();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handleConfirmOrder = async () => {
    if (!user || !profile) {
      toast({ title: language === 'ar' ? 'يجب تسجيل الدخول' : 'Please log in', variant: 'destructive' });
      navigate('/login');
      return;
    }
    if (items.length === 0) return;

    setSubmitting(true);
    try {
      // Create order
      const { data: order, error: orderErr } = await supabase.from('orders').insert({
        user_id: user.id,
        total: totalPrice,
        phone: profile.phone || '',
        email: profile.email || '',
      }).select().single();

      if (orderErr || !order) throw orderErr;

      // Create order items
      const orderItems = items.flatMap(item => {
        const entries = [];
        if (item.quantity_right > 0) {
          entries.push({ order_id: order.id, door_id: item.door_id, quantity: item.quantity_right, price: item.price, direction: 'right' as const });
        }
        if (item.quantity_left > 0) {
          entries.push({ order_id: order.id, door_id: item.door_id, quantity: item.quantity_left, price: item.price, direction: 'left' as const });
        }
        return entries;
      });

      if (orderItems.length > 0) {
        const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
        if (itemsErr) throw itemsErr;
      }

      clearCart();
      setOrderPlaced(true);
    } catch (err: any) {
      toast({ title: language === 'ar' ? 'حدث خطأ' : 'Error', description: err?.message || 'Something went wrong', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-20">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto text-center px-4">
          <CheckCircle className="w-20 h-20 text-primary mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-foreground mb-4 font-playfair">
            {language === 'ar' ? 'تم تأكيد طلبك!' : 'Order Confirmed!'}
          </h1>
          <div className="bg-card rounded-2xl p-6 shadow-lg mb-6">
            <p className="text-muted-foreground mb-6">{t('orderConfirmMsg')}</p>
            <a href="https://wa.me/201550190587?text=Can%20I%20Know%20more%20about%20my%20order" target="_blank" rel="noopener noreferrer">
              <Button variant="golden" size="lg" className="rounded-xl w-full mb-3">
                WhatsApp
              </Button>
            </a>
            <Link to="/shop">
              <Button variant="outline" size="lg" className="rounded-xl w-full">
                {language === 'ar' ? 'العودة للمتجر' : 'Back to Shop'}
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-20">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4 font-playfair">{t('checkout')}</h1>
          <p className="text-muted-foreground mb-6">{language === 'ar' ? 'لا توجد منتجات' : 'No items to checkout'}</p>
          <Link to="/shop"><Button variant="golden" className="rounded-xl">{t('shopNow')}</Button></Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground mb-8 font-playfair">{t('checkout')}</h1>

        {/* Order Summary */}
        <div className="bg-card rounded-2xl p-6 shadow-lg space-y-4 mb-6">
          <h2 className="font-bold text-foreground text-lg">{language === 'ar' ? 'ملخص الطلب' : 'Order Summary'}</h2>
          {items.map(item => (
            <div key={item.door_id} className="flex items-center justify-between text-sm border-b border-border pb-2">
              <div>
                <p className="font-semibold text-foreground">
                  {language === 'ar' ? `باب ${item.door_number}` : `Door ${item.door_number}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.quantity_right > 0 && `${language === 'ar' ? 'يمين' : 'R'}: ${item.quantity_right}`}
                  {item.quantity_right > 0 && item.quantity_left > 0 && ' · '}
                  {item.quantity_left > 0 && `${language === 'ar' ? 'يسار' : 'L'}: ${item.quantity_left}`}
                </p>
              </div>
              <span className="font-bold text-primary">
                {(item.price * (item.quantity_right + item.quantity_left)).toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2">
            <span className="text-lg font-bold text-foreground">{t('total')}</span>
            <span className="text-2xl font-bold text-primary">
              {totalPrice.toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
            </span>
          </div>
        </div>

        {/* Info message */}
        <div className="bg-card rounded-2xl p-6 shadow-lg mb-6">
          <p className="text-muted-foreground text-center">{t('orderConfirmMsg')}</p>
        </div>

        <Button variant="golden" size="lg" className="w-full rounded-xl text-lg" disabled={submitting} onClick={handleConfirmOrder}>
          {submitting
            ? (language === 'ar' ? 'جارٍ التأكيد...' : 'Confirming...')
            : t('confirmOrder')}
        </Button>
      </div>
    </div>
  );
};

export default Checkout;
