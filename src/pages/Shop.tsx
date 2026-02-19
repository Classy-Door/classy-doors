import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, ShoppingCart, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type DoorTag = 'special_promotion' | 'best_seller' | 'newly_added' | 'nothing';

const Shop = () => {
  const { t, language } = useLanguage();
  const [doors, setDoors] = useState<Tables<'doors'>[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterWidth, setFilterWidth] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoors = async () => {
      const { data } = await supabase.from('doors').select('*');
      if (data) setDoors(data);
    };
    fetchDoors();

    // Realtime subscription
    const channel = supabase
      .channel('doors-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'doors' }, () => {
        fetchDoors();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const filteredDoors = doors.filter((door) => {
    const matchesSearch =
      !searchQuery ||
      door.door_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      door.unique_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (door.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !filterCategory || door.category === filterCategory;
    const matchesWidth = !filterWidth || door.width === filterWidth;
    const matchesTag = !filterTag || door.tag === filterTag;
    return matchesSearch && matchesCategory && matchesWidth && matchesTag;
  });

  const tagLabel = (tag: DoorTag) => {
    const labels: Record<DoorTag, { ar: string; en: string }> = {
      special_promotion: { ar: 'عرض خاص', en: 'Special Promotion' },
      best_seller: { ar: 'الأكثر مبيعًا', en: 'Best Seller' },
      newly_added: { ar: 'مضاف حديثًا', en: 'Newly Added' },
      nothing: { ar: '', en: '' },
    };
    return labels[tag]?.[language] || '';
  };

  const tagColor = (tag: DoorTag) => {
    const colors: Record<DoorTag, string> = {
      special_promotion: 'bg-destructive',
      best_seller: 'bg-primary',
      newly_added: 'bg-secondary text-secondary-foreground',
      nothing: '',
    };
    return colors[tag] || '';
  };

  const hasActiveFilters = filterCategory || filterWidth || filterTag;

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <div className="liquid-glass rounded-2xl p-2 flex items-center gap-2">
            <Search className="w-5 h-5 text-muted-foreground ms-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'ar' ? 'ابحث بالاسم أو الكود...' : 'Search by name or code...'}
              className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground py-3 px-2"
            />
            <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="liquid-glass rounded-2xl p-6 space-y-4">
              {/* Category */}
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">{t('category')}</p>
                <div className="flex gap-2">
                  {['I', 'F'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(filterCategory === cat ? null : cat)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        filterCategory === cat
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {language === 'ar' ? `فئة ${cat}` : `Category ${cat}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Width */}
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">{t('thickness')}</p>
                <div className="flex gap-2">
                  {['10', '11'].map((w) => (
                    <button
                      key={w}
                      onClick={() => setFilterWidth(filterWidth === w ? null : w)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        filterWidth === w
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {w} {language === 'ar' ? 'سم' : 'cm'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tag */}
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">{t('tag')}</p>
                <div className="flex gap-2 flex-wrap">
                  {(['special_promotion', 'best_seller', 'newly_added'] as DoorTag[]).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        filterTag === tag
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {tagLabel(tag)}
                    </button>
                  ))}
                </div>
              </div>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setFilterCategory(null); setFilterWidth(null); setFilterTag(null); }}
                  className="text-destructive"
                >
                  <X className="w-4 h-4" />
                  {language === 'ar' ? 'مسح الفلاتر' : 'Clear Filters'}
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {/* Door Grid */}
        {filteredDoors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDoors.map((door, i) => (
              <motion.div
                key={door.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all group relative"
              >
                {/* Tag Banner */}
                {door.tag !== 'nothing' && (
                  <div className={`absolute top-3 start-3 z-10 ${tagColor(door.tag as DoorTag)} text-primary-foreground text-xs font-bold px-3 py-1 rounded-full`}>
                    {tagLabel(door.tag as DoorTag)}
                  </div>
                )}

                <div className="aspect-[3/4] bg-muted overflow-hidden">
                  {door.photo_url ? (
                    <img
                      src={door.photo_url}
                      alt={`Door ${door.door_number}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingCart className="w-16 h-16 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-base font-bold text-foreground">
                      {language === 'ar' ? `باب ${door.door_number}` : `Door ${door.door_number}`}
                    </p>
                    <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                      {door.category} · {door.width}{language === 'ar' ? 'سم' : 'cm'}
                    </span>
                  </div>

                  {door.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{door.description}</p>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <p className="text-lg font-bold text-primary">
                      {Number(door.price).toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
                    </p>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span>{language === 'ar' ? `يمين: ${door.quantity_right}` : `R: ${door.quantity_right}`}</span>
                      <span>{language === 'ar' ? `يسار: ${door.quantity_left}` : `L: ${door.quantity_left}`}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <ShoppingCart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">
              {searchQuery || hasActiveFilters
                ? (language === 'ar' ? 'لا توجد نتائج' : 'No results found')
                : (language === 'ar' ? 'سيتم إضافة الأبواب قريبًا' : 'Doors will be added soon')}
            </p>
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      <Link to="/cart" className="fixed bottom-6 end-6 z-40">
        <Button variant="golden" size="icon" className="w-14 h-14 rounded-full shadow-xl">
          <ShoppingCart className="w-6 h-6" />
        </Button>
      </Link>
    </div>
  );
};

export default Shop;
