import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Save, Trash2, Edit2, X, Upload } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';

type Door = Tables<'doors'>;

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
  const [doors, setDoors] = useState<Door[]>([]);
  const [editingDoor, setEditingDoor] = useState<Partial<Door> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchDoors = async () => {
    const { data } = await supabase.from('doors').select('*').order('created_at', { ascending: false });
    if (data) setDoors(data);
  };

  useEffect(() => { fetchDoors(); }, []);

  if (authLoading) return <div className="min-h-screen bg-background pt-20 flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (!isAdmin) return <Navigate to="/" replace />;

  const handleEdit = (door: Door) => {
    setEditingDoor({ ...door });
    setIsNew(false);
  };

  const handleNew = () => {
    setEditingDoor({ ...emptyDoor });
    setIsNew(true);
  };

  const handleCancel = () => {
    setEditingDoor(null);
    setIsNew(false);
  };

  const handlePhotoUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}.${ext}`;
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
        door_number: editingDoor.door_number || '',
        unique_code: editingDoor.unique_code || '',
        price: Number(editingDoor.price) || 0,
        category: editingDoor.category || 'I',
        width: editingDoor.width || '10',
        tag: editingDoor.tag || 'nothing',
        description: editingDoor.description || '',
        in_stock: editingDoor.in_stock ?? true,
        photo_url: editingDoor.photo_url || '',
      });
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: '✓', description: 'Door created' });
        handleCancel();
        fetchDoors();
      }
    } else {
      const { error } = await supabase.from('doors').update({
        door_number: editingDoor.door_number,
        unique_code: editingDoor.unique_code,
        price: Number(editingDoor.price),
        category: editingDoor.category,
        width: editingDoor.width,
        tag: editingDoor.tag,
        description: editingDoor.description,
        in_stock: editingDoor.in_stock,
        photo_url: editingDoor.photo_url,
      }).eq('id', editingDoor.id!);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: '✓', description: 'Door updated' });
        handleCancel();
        fetchDoors();
      }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا الباب؟' : 'Are you sure you want to delete this door?')) return;
    const { error } = await supabase.from('doors').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '✓', description: 'Door deleted' });
      fetchDoors();
    }
  };

  const updateField = (field: string, value: any) => {
    setEditingDoor(prev => prev ? { ...prev, [field]: value } : prev);
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground font-playfair">
            {language === 'ar' ? 'لوحة التحكم' : 'Admin Panel'}
          </h1>
          <Button variant="golden" onClick={handleNew} className="rounded-xl">
            <Plus className="w-4 h-4" />
            {language === 'ar' ? 'باب جديد' : 'New Door'}
          </Button>
        </div>

        {/* Edit/Create Form */}
        {editingDoor && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 shadow-lg mb-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                {isNew ? (language === 'ar' ? 'إضافة باب جديد' : 'Add New Door') : (language === 'ar' ? 'تعديل الباب' : 'Edit Door')}
              </h2>
              <button onClick={handleCancel} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-foreground block mb-1">
                  {language === 'ar' ? 'رقم الباب' : 'Door Number'}
                </label>
                <input value={editingDoor.door_number || ''} onChange={(e) => updateField('door_number', e.target.value)}
                  className="w-full bg-muted rounded-xl px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground block mb-1">
                  {language === 'ar' ? 'الكود الفريد' : 'Unique Code'}
                </label>
                <input value={editingDoor.unique_code || ''} onChange={(e) => updateField('unique_code', e.target.value)} maxLength={5}
                  className="w-full bg-muted rounded-xl px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground block mb-1">
                  {language === 'ar' ? 'السعر (ج.م)' : 'Price (EGP)'}
                </label>
                <input type="number" value={editingDoor.price || 0} onChange={(e) => updateField('price', Number(e.target.value))}
                  className="w-full bg-muted rounded-xl px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground block mb-1">
                  {language === 'ar' ? 'الفئة' : 'Category'}
                </label>
                <select value={editingDoor.category || 'I'} onChange={(e) => updateField('category', e.target.value)}
                  className="w-full bg-muted rounded-xl px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary">
                  <option value="I">I</option>
                  <option value="F">F</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground block mb-1">
                  {language === 'ar' ? 'السُمك' : 'Width'}
                </label>
                <select value={editingDoor.width || '10'} onChange={(e) => updateField('width', e.target.value)}
                  className="w-full bg-muted rounded-xl px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary">
                  <option value="10">10 cm</option>
                  <option value="11">11 cm</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground block mb-1">
                  {language === 'ar' ? 'العلامة' : 'Tag'}
                </label>
                <select value={editingDoor.tag || 'nothing'} onChange={(e) => updateField('tag', e.target.value)}
                  className="w-full bg-muted rounded-xl px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary">
                  <option value="nothing">{language === 'ar' ? 'بدون' : 'None'}</option>
                  <option value="special_promotion">{language === 'ar' ? 'عرض خاص' : 'Special Promotion'}</option>
                  <option value="best_seller">{language === 'ar' ? 'الأكثر مبيعًا' : 'Best Seller'}</option>
                  <option value="newly_added">{language === 'ar' ? 'مضاف حديثًا' : 'Newly Added'}</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-foreground block mb-1">
                  {language === 'ar' ? 'الوصف' : 'Description'}
                </label>
                <textarea value={editingDoor.description || ''} onChange={(e) => updateField('description', e.target.value)} rows={3}
                  className="w-full bg-muted rounded-xl px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary resize-none" />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground block mb-1">
                  {language === 'ar' ? 'الحالة' : 'Stock Status'}
                </label>
                <select value={editingDoor.in_stock ? 'true' : 'false'} onChange={(e) => updateField('in_stock', e.target.value === 'true')}
                  className="w-full bg-muted rounded-xl px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary">
                  <option value="true">{language === 'ar' ? 'متوفر' : 'In Stock'}</option>
                  <option value="false">{language === 'ar' ? 'غير متوفر' : 'Out of Stock'}</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground block mb-1">
                  {language === 'ar' ? 'صورة الباب' : 'Door Photo'}
                </label>
                <div className="flex items-center gap-3">
                  {editingDoor.photo_url && (
                    <img src={editingDoor.photo_url} alt="Door" className="w-16 h-20 rounded-lg object-cover" />
                  )}
                  <label className="flex items-center gap-2 px-4 py-3 bg-muted rounded-xl cursor-pointer hover:bg-muted/80 transition-colors">
                    <Upload className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{uploading ? (language === 'ar' ? 'جاري الرفع...' : 'Uploading...') : (language === 'ar' ? 'رفع صورة' : 'Upload')}</span>
                    <input type="file" accept="image/*" className="hidden" disabled={uploading}
                      onChange={(e) => { if (e.target.files?.[0]) handlePhotoUpload(e.target.files[0]); }} />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="golden" className="rounded-xl" onClick={handleSave} disabled={saving || !editingDoor.unique_code}>
                <Save className="w-4 h-4" />
                {saving ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ' : 'Save')}
              </Button>
              <Button variant="ghost" className="rounded-xl" onClick={handleCancel}>
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Door List */}
        <div className="space-y-3">
          {doors.map((door) => (
            <motion.div key={door.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-card rounded-2xl p-4 shadow-md flex items-center gap-4">
              <div className="w-16 h-20 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                {door.photo_url ? (
                  <img src={door.photo_url} alt={`Door ${door.door_number}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 text-xs">No img</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-foreground">{door.category}-{door.door_number}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${door.in_stock ? 'bg-primary/20 text-primary' : 'bg-destructive/20 text-destructive'}`}>
                    {door.in_stock ? (language === 'ar' ? 'متوفر' : 'In Stock') : (language === 'ar' ? 'غير متوفر' : 'Out of Stock')}
                  </span>
                  {door.tag !== 'nothing' && (
                    <span className="text-xs bg-secondary/20 text-secondary-foreground px-2 py-0.5 rounded-full">{door.tag}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'كود' : 'Code'}: {door.unique_code} · {Number(door.price).toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'} · {door.width}cm
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => handleEdit(door)} className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(door.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}

          {doors.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">{language === 'ar' ? 'لا توجد أبواب' : 'No doors yet'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
