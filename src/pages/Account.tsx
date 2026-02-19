import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Package, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import userLogo from '@/assets/userlogo.jpg';

const Account = () => {
  const { t, language } = useLanguage();
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: '', phone: '', address: '' });
  const [orders, setOrders] = useState<any[]>([]);
  const [showPastOrders, setShowPastOrders] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [loading, user]);

  useEffect(() => {
    if (profile) {
      setForm({ full_name: profile.full_name, phone: profile.phone, address: profile.address || '' });
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).then(({ data }) => {
        if (data) setOrders(data);
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    const { error } = await supabase.from('profiles').update({
      full_name: form.full_name,
      phone: form.phone,
      address: form.address,
    }).eq('id', user.id);

    if (!error) {
      await refreshProfile();
      setEditing(false);
      toast({ title: language === 'ar' ? 'تم الحفظ' : 'Saved', description: language === 'ar' ? 'تم تحديث بياناتك' : 'Your profile has been updated' });
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-primary/15 text-primary';
      case 'done': return 'bg-green-100 text-green-700';
      default: return 'bg-secondary/50 text-secondary-foreground';
    }
  };

  const statusLabel = (status: string) => {
    const labels: Record<string, Record<string, string>> = {
      pending: { ar: 'في انتظار التأكيد', en: 'Pending Confirmation' },
      confirmed: { ar: 'مؤكد', en: 'Confirmed' },
      done: { ar: 'مكتمل', en: 'Done' },
    };
    return labels[status]?.[language] || status;
  };

  if (loading || !user) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-pulse text-muted-foreground">...</div></div>;
  }

  const currentOrder = orders.find(o => o.status !== 'done');
  const pastOrders = orders.filter(o => o.status === 'done');

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          {/* Profile Card */}
          <div className="liquid-glass rounded-2xl p-8 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <img src={userLogo} alt="User" className="w-20 h-20 rounded-full object-cover" />
              <div>
                <h1 className="text-2xl font-bold text-foreground font-playfair">{profile?.full_name}</h1>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
              </div>
            </div>

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-foreground">{language === 'ar' ? 'الاسم' : 'Name'}</label>
                  <input value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                    className="w-full bg-background/50 border border-border rounded-xl py-2 px-4 mt-1 text-foreground outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground">{t('phone')}</label>
                  <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} dir="ltr"
                    className="w-full bg-background/50 border border-border rounded-xl py-2 px-4 mt-1 text-foreground outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground">{language === 'ar' ? 'العنوان' : 'Address'}</label>
                  <input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                    className="w-full bg-background/50 border border-border rounded-xl py-2 px-4 mt-1 text-foreground outline-none focus:border-primary" />
                </div>
                <div className="flex gap-2">
                  <Button variant="golden" onClick={handleSave}>{language === 'ar' ? 'حفظ' : 'Save'}</Button>
                  <Button variant="ghost" onClick={() => setEditing(false)}>{language === 'ar' ? 'إلغاء' : 'Cancel'}</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm"><User className="w-4 h-4 text-muted-foreground" /> {profile?.full_name}</div>
                <div className="flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-muted-foreground" /> {profile?.address || (language === 'ar' ? 'لم يتم إضافة عنوان' : 'No address added')}</div>
                <div className="flex items-center gap-2 text-sm" dir="ltr"><span className="text-muted-foreground">📱</span> {profile?.phone}</div>
                <Button variant="glass" size="sm" onClick={() => setEditing(true)}>
                  {language === 'ar' ? 'تعديل البيانات' : 'Edit Profile'}
                </Button>
              </div>
            )}
          </div>

          {/* Current Order */}
          {currentOrder && (
            <div className="liquid-glass rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">{t('currentOrder')}</h2>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor(currentOrder.status)}`}>
                  {statusLabel(currentOrder.status)}
                </span>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>{language === 'ar' ? 'الإجمالي' : 'Total'}: {currentOrder.total} {language === 'ar' ? 'ج.م' : 'EGP'}</p>
                <p>{new Date(currentOrder.created_at).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</p>
              </div>
            </div>
          )}

          {/* Past Orders Button */}
          <Button variant="glass" className="w-full rounded-xl" onClick={() => setShowPastOrders(!showPastOrders)}>
            <Package className="w-4 h-4" />
            {t('pastOrders')} ({pastOrders.length})
          </Button>

          {showPastOrders && pastOrders.length > 0 && (
            <div className="mt-4 space-y-3">
              {pastOrders.map(order => (
                <div key={order.id} className="bg-card rounded-xl p-4 border border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold">{order.total} {language === 'ar' ? 'ج.م' : 'EGP'}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor(order.status)}`}>
                      {statusLabel(order.status)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(order.created_at).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Account;
