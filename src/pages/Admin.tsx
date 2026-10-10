import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Save, Trash2, Edit2, X, Upload, Package, DoorOpen, Star, Sparkles, Barcode } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import BarcodeDisplay from '@/components/BarcodeDisplay';
import { Navigate } from 'react-router-dom';

type Door = Tables<'doors'>;
type Order = Tables<'orders'>;
type OrderItem = Tables<'order_items'>;

const emptyDoor = {
  door_number: '',
  unique_code: '',
  price: 0,
  category: 'I' as const,
  width: '10' as const,
  tag: 'nothing' as const,
  description: '',
  in_stock: true,
  photo_url: '',
};

const Admin = () => {
  const { language } = useLanguage();
  const { isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'doors' | 'orders'>('doors');
  const [showBarcode, setShowBarcode] = useState<string | null>(null);

  // Door state
  const [doors, setDoors] = useState<Door[]>([]);
  const [editingDoor, setEditingDoor] = useState<Partial<Door> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Order state
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'done' | 'canceled'>('all');

  const fetchDoors = async () => {
    const { data } = await supabase.from('doors').select('*').order('created_at', { ascending: false });
    if (data) setDoors(data);
  };

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) setOrders((data as any[]).filter((o: any) => !o.hidden));
  };

  const fetchOrderItems = async (orderId: string) => {
    if (orderItems[orderId]) return;
    const { data } = await supabase.from('order_items').select('*').eq('order_id', orderId);
    if (data) setOrderItems(prev => ({ ...prev, [orderId]: data }));
  };

  useEffect(() => { fetchDoors(); fetchOrders(); }, []);

  if (authLoading) return <div className="min-h-screen bg-background pt-20 flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (!isAdmin) return <Navigate to="/" replace />;

  const handleToggleOrder = (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
      fetchOrderItems(orderId);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: 'pending' | 'confirmed' | 'done' | 'canceled') => {
    setUpdatingOrder(orderId);
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '✓', description: language === 'ar' ? 'تم تحديث الحالة' : 'Status updated' });
      fetchOrders();
    }
    setUpdatingOrder(null);
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا الطلب؟' : 'Are you sure you want to delete this order?')) return;
    setUpdatingOrder(orderId);
    const { error } = await supabase.from('orders').update({ hidden: true } as any).eq('id', orderId);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '✓', description: language === 'ar' ? 'تم حذف الطلب' : 'Order deleted' });
      setOrders(prev => prev.filter(o => o.id !== orderId));
      if (expandedOrder === orderId) setExpandedOrder(null);
    }
    setUpdatingOrder(null);
  };

  // Door handlers (kept as-is)
  const handleEdit = (door: Door) => { setEditingDoor({ ...door }); setIsNew(false); };
  const handleNew = () => { setEditingDoor({ ...emptyDoor }); setIsNew(true); };
  const handleCancel = () => { setEditingDoor(null); setIsNew(false); };

  const handlePhotoUpload = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: language === 'ar' ? 'يرجى تحميل صورة فقط' : 'Please upload an image file', variant: 'destructive' });
      return;
    }
    const rawExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'avif'];
    if (!allowedExts.includes(rawExt)) {
      toast({ title: 'Invalid format', description: language === 'ar' ? 'الصيغ المسموح بها: JPG, PNG, WEBP' : 'Allowed formats: JPG, PNG, WEBP', variant: 'destructive' });
      return;
    }
    setUploading(true);
    const fileName = `${Date.now()}.${rawExt}`;
    const { error } = await supabase.storage.from('door-photos').upload(fileName, file);
    if (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from('door-photos').getPublicUrl(fileName);
    setEditingDoor(prev => prev ? { ...prev, photo_url: urlData.publicUrl } : prev);
    setUploading(false);
  };

  const handleSave = async () => {
    if (!editingDoor) return;
    setSaving(true);
    if (isNew) {
      const { error } = await supabase.from('doors').insert({
        door_number: editingDoor.door_number || '', unique_code: editingDoor.unique_code || '',
        price: Number(editingDoor.price) || 0, category: editingDoor.category || 'I',
        width: editingDoor.width || '10', tag: editingDoor.tag || 'nothing',
        description: editingDoor.description || '', in_stock: editingDoor.in_stock ?? true,
        photo_url: editingDoor.photo_url || '',
      });
      if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
      else { toast({ title: '✓', description: 'Door created' }); handleCancel(); fetchDoors(); }
    } else {
      const { error } = await supabase.from('doors').update({
        door_number: editingDoor.door_number, unique_code: editingDoor.unique_code,
        price: Number(editingDoor.price), category: editingDoor.category,
        width: editingDoor.width, tag: editingDoor.tag,
        description: editingDoor.description, in_stock: editingDoor.in_stock,
        photo_url: editingDoor.photo_url,
      }).eq('id', editingDoor.id!);
      if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
      else { toast({ title: '✓', description: 'Door updated' }); handleCancel(); fetchDoors(); }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا الباب؟' : 'Are you sure you want to delete this door?')) return;
    const { error } = await supabase.from('doors').delete().eq('id', id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: '✓', description: 'Door deleted' }); fetchDoors(); }
  };

  const updateField = (field: string, value: any) => {
    setEditingDoor(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const statusLabel = (status: string) => {
    const map: Record<string, { ar: string; en: string; cls: string }> = {
      pending: { ar: 'في الانتظار', en: 'Pending', cls: 'bg-yellow-500/20 text-yellow-700' },
      confirmed: { ar: 'مؤكد', en: 'Confirmed', cls: 'bg-blue-500/20 text-blue-700' },
      done: { ar: 'مكتمل', en: 'Done', cls: 'bg-primary/20 text-primary' },
      canceled: { ar: 'ملغي', en: 'Canceled', cls: 'bg-destructive/20 text-destructive' },
    };
    const s = map[status] || map.pending;
    return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.cls}`}>{language === 'ar' ? s.ar : s.en}</span>;
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground font-playfair">
            {language === 'ar' ? 'لوحة التحكم' : 'Admin Panel'}
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <Button variant={activeTab === 'doors' ? 'golden' : 'glass'} className="rounded-xl" onClick={() => setActiveTab('doors')}>
            <DoorOpen className="w-4 h-4" />
            {language === 'ar' ? 'الأبواب' : 'Doors'}
          </Button>
          <Button variant={activeTab === 'orders' ? 'golden' : 'glass'} className="rounded-xl" onClick={() => setActiveTab('orders')}>
            <Package className="w-4 h-4" />
            {language === 'ar' ? 'الطلبات' : 'Orders'}
          </Button>
        </div>

        {/* DOORS TAB */}
        {activeTab === 'doors' && (
          <>
            <div className="flex justify-end mb-6">
              <Button variant="golden" onClick={handleNew} className="rounded-xl">
                <Plus className="w-4 h-4" />
                {language === 'ar' ? 'باب جديد' : 'New Door'}
              </Button>
            </div>

            {editingDoor && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 shadow-lg mb-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground">
                    {isNew ? (language === 'ar' ? 'إضافة باب جديد' : 'Add New Door') : (language === 'ar' ? 'تعديل الباب' : 'Edit Door')}
                  </h2>
                  <button onClick={handleCancel} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-foreground block mb-1">{language === 'ar' ? 'رقم الباب' : 'Door Number'}</label>
                    <input value={editingDoor.door_number || ''} onChange={(e) => updateField('door_number', e.target.value)} className="w-full bg-muted rounded-xl px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground block mb-1">{language === 'ar' ? 'الكود الفريد' : 'Unique Code'}</label>
                    <input value={editingDoor.unique_code || ''} onChange={(e) => updateField('unique_code', e.target.value)} maxLength={5} className="w-full bg-muted rounded-xl px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground block mb-1">{language === 'ar' ? 'السعر (ج.م)' : 'Price (EGP)'}</label>
                    <input type="number" value={editingDoor.price || 0} onChange={(e) => updateField('price', Number(e.target.value))} className="w-full bg-muted rounded-xl px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground block mb-1">{language === 'ar' ? 'الفئة' : 'Category'}</label>
                    <select value={editingDoor.category || 'I'} onChange={(e) => updateField('category', e.target.value)} className="w-full bg-muted rounded-xl px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary">
                      <option value="I">I</option><option value="F">F</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground block mb-1">{language === 'ar' ? 'السُمك' : 'Width'}</label>
                    <select value={editingDoor.width || '10'} onChange={(e) => updateField('width', e.target.value)} className="w-full bg-muted rounded-xl px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary">
                      <option value="10">10 cm</option><option value="11">11 cm</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground block mb-1">{language === 'ar' ? 'العلامة' : 'Tag'}</label>
                    <select value={editingDoor.tag || 'nothing'} onChange={(e) => updateField('tag', e.target.value)} className="w-full bg-muted rounded-xl px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary">
                      <option value="nothing">{language === 'ar' ? 'بدون' : 'None'}</option>
                      <option value="special_promotion">{language === 'ar' ? 'عرض خاص' : 'Special Promotion'}</option>
                      <option value="best_seller">{language === 'ar' ? 'الأكثر مبيعًا' : 'Best Seller'}</option>
                      <option value="newly_added">{language === 'ar' ? 'مضاف حديثًا' : 'Newly Added'}</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-foreground block mb-1">{language === 'ar' ? 'الوصف' : 'Description'}</label>
                    <textarea value={editingDoor.description || ''} onChange={(e) => updateField('description', e.target.value)} rows={3} className="w-full bg-muted rounded-xl px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary resize-none" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground block mb-1">{language === 'ar' ? 'الحالة' : 'Stock Status'}</label>
                    <select value={editingDoor.in_stock ? 'true' : 'false'} onChange={(e) => updateField('in_stock', e.target.value === 'true')} className="w-full bg-muted rounded-xl px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary">
                      <option value="true">{language === 'ar' ? 'متوفر' : 'In Stock'}</option>
                      <option value="false">{language === 'ar' ? 'غير متوفر' : 'Out of Stock'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground block mb-1">{language === 'ar' ? 'صورة الباب' : 'Door Photo'}</label>
                    <div className="flex items-center gap-3">
                      {editingDoor.photo_url && <img src={editingDoor.photo_url} alt="Door" className="w-16 h-20 rounded-lg object-cover" />}
                      <label className="flex items-center gap-2 px-4 py-3 bg-muted rounded-xl cursor-pointer hover:bg-muted/80 transition-colors">
                        <Upload className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{uploading ? (language === 'ar' ? 'جاري الرفع...' : 'Uploading...') : (language === 'ar' ? 'رفع صورة' : 'Upload')}</span>
                        <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => { if (e.target.files?.[0]) handlePhotoUpload(e.target.files[0]); }} />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Barcode Preview */}
                {editingDoor.unique_code && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-foreground block mb-1">{language === 'ar' ? 'الباركود' : 'Barcode'}</label>
                    <BarcodeDisplay code={editingDoor.unique_code} label={`${editingDoor.category || 'I'}-${editingDoor.door_number || ''}`} showDownload />
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button variant="golden" className="rounded-xl" onClick={handleSave} disabled={saving || !editingDoor.unique_code}>
                    <Save className="w-4 h-4" />
                    {saving ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ' : 'Save')}
                  </Button>
                  <Button variant="ghost" className="rounded-xl" onClick={handleCancel}>{language === 'ar' ? 'إلغاء' : 'Cancel'}</Button>
                </div>
              </motion.div>
            )}

            {/* Homepage Selection Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-card rounded-2xl p-4 shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-bold text-foreground text-sm">{language === 'ar' ? 'أبوابنا (الصفحة الرئيسية)' : 'Our Doors (Homepage)'}</span>
                </div>
                <p className="text-xs text-muted-foreground">{doors.filter(d => d.featured).length}/3 {language === 'ar' ? 'مختار' : 'selected'}</p>
              </div>
              <div className="bg-card rounded-2xl p-4 shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-secondary" />
                  <span className="font-bold text-foreground text-sm">{language === 'ar' ? 'عروض خاصة (الصفحة الرئيسية)' : 'Special Offers (Homepage)'}</span>
                </div>
                <p className="text-xs text-muted-foreground">{doors.filter(d => d.tag === 'special_promotion').length}/3 {language === 'ar' ? 'مختار' : 'selected'}</p>
              </div>
            </div>

            <div className="space-y-3">
              {doors.map((door) => (
                <motion.div key={door.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-2xl p-4 shadow-md flex flex-wrap items-center gap-4">
                  <div className="w-16 h-20 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                    {door.photo_url ? <img src={door.photo_url} alt={`Door ${door.door_number}`} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 text-xs">No img</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-foreground">{door.category}-{door.door_number}</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${door.in_stock ? 'bg-primary/20 text-primary' : 'bg-destructive/20 text-destructive'}`}>
                        {door.in_stock ? (language === 'ar' ? 'متوفر' : 'In Stock') : (language === 'ar' ? 'غير متوفر' : 'Out of Stock')}
                      </span>
                      {door.tag !== 'nothing' && <span className="text-xs bg-secondary/20 text-secondary-foreground px-2 py-0.5 rounded-full">{door.tag}</span>}
                      {door.featured && <span className="text-xs bg-yellow-500/20 text-yellow-700 px-2 py-0.5 rounded-full flex items-center gap-1"><Star className="w-3 h-3" />{language === 'ar' ? 'مميز' : 'Featured'}</span>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' ? 'كود' : 'Code'}: {door.unique_code} · {Number(door.price).toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'} · {door.width}cm
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={async () => {
                        if (!door.featured && doors.filter(d => d.featured).length >= 3) {
                          toast({ title: language === 'ar' ? 'خطأ' : 'Error', description: language === 'ar' ? 'الحد الأقصى ٣ أبواب في قسم أبوابنا' : 'Maximum 3 doors for Our Doors section', variant: 'destructive' });
                          return;
                        }
                        await supabase.from('doors').update({ featured: !door.featured }).eq('id', door.id);
                        fetchDoors();
                      }}
                      className={`p-2 rounded-lg transition-colors ${door.featured ? 'bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/30' : 'hover:bg-muted text-muted-foreground'}`}
                      title={language === 'ar' ? 'أبوابنا' : 'Our Doors'}
                    >
                      <Star className="w-4 h-4" />
                    </button>
                    <button
                      onClick={async () => {
                        const isPromo = door.tag === 'special_promotion';
                        if (!isPromo && doors.filter(d => d.tag === 'special_promotion').length >= 3) {
                          toast({ title: language === 'ar' ? 'خطأ' : 'Error', description: language === 'ar' ? 'الحد الأقصى ٣ أبواب في العروض الخاصة' : 'Maximum 3 doors for Special Offers', variant: 'destructive' });
                          return;
                        }
                        await supabase.from('doors').update({ tag: isPromo ? 'nothing' : 'special_promotion' }).eq('id', door.id);
                        fetchDoors();
                      }}
                      className={`p-2 rounded-lg transition-colors ${door.tag === 'special_promotion' ? 'bg-secondary/20 text-secondary hover:bg-secondary/30' : 'hover:bg-muted text-muted-foreground'}`}
                      title={language === 'ar' ? 'عرض خاص' : 'Special Offer'}
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                    <button onClick={() => setShowBarcode(showBarcode === door.id ? null : door.id)} className={`p-2 rounded-lg transition-colors ${showBarcode === door.id ? 'bg-primary/20 text-primary' : 'hover:bg-muted text-muted-foreground'}`} title={language === 'ar' ? 'باركود' : 'Barcode'}>
                      <Barcode className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleEdit(door)} className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(door.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  {showBarcode === door.id && (
                    <div className="w-full mt-3 pt-3 border-t border-border">
                      <BarcodeDisplay code={door.unique_code} label={`${door.category}-${door.door_number}`} showDownload />
                    </div>
                  )}
                </motion.div>
              ))}
              {doors.length === 0 && <div className="text-center py-20"><p className="text-muted-foreground">{language === 'ar' ? 'لا توجد أبواب' : 'No doors yet'}</p></div>}
            </div>
          </>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-3">
            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap mb-4">
              {(['all', 'pending', 'confirmed', 'done', 'canceled'] as const).map((s) => {
                const labels: Record<string, { ar: string; en: string }> = {
                  all: { ar: 'الكل', en: 'All' },
                  pending: { ar: 'في الانتظار', en: 'Pending' },
                  confirmed: { ar: 'مؤكد', en: 'Confirmed' },
                  done: { ar: 'مكتمل', en: 'Done' },
                  canceled: { ar: 'ملغي', en: 'Canceled' },
                };
                return (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                      statusFilter === s
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {language === 'ar' ? labels[s].ar : labels[s].en}
                  </button>
                );
              })}
            </div>

            {orders.filter(o => statusFilter === 'all' || o.status === statusFilter).map((order) => (
              <motion.div key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-2xl shadow-md overflow-hidden">
                <button onClick={() => handleToggleOrder(order.id)} className="w-full p-4 flex items-center gap-4 text-start hover:bg-muted/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-bold text-foreground">#{order.order_number}</p>
                      {statusLabel(order.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.email} · {order.phone}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {Number(order.total).toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'} · {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <X className={`w-4 h-4 text-muted-foreground transition-transform ${expandedOrder === order.id ? 'rotate-0' : 'rotate-45'}`} />
                </button>

                {expandedOrder === order.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="border-t border-border px-4 pb-4">
                    {/* Order items */}
                    <div className="mt-3 space-y-2">
                      {(orderItems[order.id] || []).map((item) => (
                        <div key={item.id} className="flex items-center justify-between bg-muted/50 rounded-xl px-4 py-2">
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {language === 'ar' ? `باب ${item.door_number}` : `Door ${item.door_number}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {language === 'ar' ? 'اتجاه' : 'Direction'}: {item.direction} · {language === 'ar' ? 'كمية' : 'Qty'}: {item.quantity}
                            </p>
                          </div>
                          <p className="text-sm font-bold text-foreground">
                            {Number(item.price).toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
                          </p>
                        </div>
                      ))}
                      {!orderItems[order.id] && <p className="text-sm text-muted-foreground py-2">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>}
                      {orderItems[order.id]?.length === 0 && <p className="text-sm text-muted-foreground py-2">{language === 'ar' ? 'لا توجد عناصر' : 'No items in order'}</p>}
                    </div>

                    {/* Status update buttons */}
                    <div className="mt-4 flex gap-2 flex-wrap">
                      {order.status !== 'pending' && order.status !== 'canceled' && (
                        <Button size="sm" variant="outline" className="rounded-xl" disabled={updatingOrder === order.id} onClick={() => handleUpdateStatus(order.id, 'pending')}>
                          {language === 'ar' ? 'في الانتظار' : 'Pending'}
                        </Button>
                      )}
                      {order.status !== 'confirmed' && order.status !== 'canceled' && (
                        <Button size="sm" variant="secondary" className="rounded-xl" disabled={updatingOrder === order.id} onClick={() => handleUpdateStatus(order.id, 'confirmed')}>
                          {language === 'ar' ? 'تأكيد' : 'Confirm'}
                        </Button>
                      )}
                      {order.status !== 'done' && order.status !== 'canceled' && (
                        <Button size="sm" variant="golden" className="rounded-xl" disabled={updatingOrder === order.id} onClick={() => handleUpdateStatus(order.id, 'done')}>
                          {language === 'ar' ? 'مكتمل' : 'Done'}
                        </Button>
                      )}
                      {order.status !== 'canceled' && (
                        <Button size="sm" variant="destructive" className="rounded-xl" disabled={updatingOrder === order.id} onClick={() => handleUpdateStatus(order.id, 'canceled' as any)}>
                          {language === 'ar' ? 'إلغاء' : 'Cancel'}
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="rounded-xl border-destructive text-destructive hover:bg-destructive/10" disabled={updatingOrder === order.id} onClick={() => handleDeleteOrder(order.id)}>
                        <Trash2 className="w-3 h-3" />
                        {language === 'ar' ? 'حذف' : 'Delete'}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
            {orders.filter(o => statusFilter === 'all' || o.status === statusFilter).length === 0 && <div className="text-center py-20"><p className="text-muted-foreground">{language === 'ar' ? 'لا توجد طلبات' : 'No orders found'}</p></div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
