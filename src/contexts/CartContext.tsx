import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface CartItem {
  door_id: string;
  door_number: string;
  photo_url: string | null;
  price: number;
  category: string;
  width: string;
  quantity_right: number;
  quantity_left: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity_right' | 'quantity_left'>, right: number, left: number) => void;
  removeFromCart: (doorId: string) => void;
  updateQuantity: (doorId: string, right: number, left: number) => void;
  clearCart: () => void;
  totalPrice: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_CART_KEY = 'classy_doors_guest_cart';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(GUEST_CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const { user } = useAuth();
  const { toast } = useToast();

  // Load cart from Supabase profile when logged in, or localStorage for guests
  useEffect(() => {
    if (!user) {
      try {
        const saved = localStorage.getItem(GUEST_CART_KEY);
        setItems(saved ? JSON.parse(saved) : []);
      } catch {
        setItems([]);
      }
      return;
    }

    const load = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('cart_data')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Failed to load cart data:', error);
        return;
      }

      const remoteCart = (data?.cart_data && Array.isArray(data.cart_data))
        ? (data.cart_data as unknown as CartItem[])
        : [];

      // Check if guest cart had items to merge
      let guestCart: CartItem[] = [];
      try {
        const saved = localStorage.getItem(GUEST_CART_KEY);
        if (saved) {
          guestCart = JSON.parse(saved);
          localStorage.removeItem(GUEST_CART_KEY);
        }
      } catch {
        // ignore
      }

      if (guestCart.length > 0) {
        const mergedMap = new Map<string, CartItem>();
        remoteCart.forEach(i => mergedMap.set(i.door_id, { ...i }));
        guestCart.forEach(g => {
          if (mergedMap.has(g.door_id)) {
            const existing = mergedMap.get(g.door_id)!;
            existing.quantity_right += g.quantity_right;
            existing.quantity_left += g.quantity_left;
          } else {
            mergedMap.set(g.door_id, { ...g });
          }
        });
        const finalCart = Array.from(mergedMap.values());
        setItems(finalCart);
        await supabase.from('profiles').update({ cart_data: finalCart as any }).eq('id', user.id);
      } else {
        setItems(remoteCart);
      }
    };
    load();
  }, [user]);

  // Persist cart to Supabase for authenticated users, localStorage for guests
  const persist = useCallback(async (newItems: CartItem[]) => {
    if (user) {
      await supabase.from('profiles').update({ cart_data: newItems as any }).eq('id', user.id);
    } else {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(newItems));
    }
  }, [user]);

  const addToCart = (item: Omit<CartItem, 'quantity_right' | 'quantity_left'>, right: number, left: number) => {
    setItems(prev => {
      const existing = prev.find(i => i.door_id === item.door_id);
      let updated: CartItem[];
      if (existing) {
        updated = prev.map(i => i.door_id === item.door_id
          ? { ...i, quantity_right: i.quantity_right + right, quantity_left: i.quantity_left + left }
          : i
        );
      } else {
        updated = [...prev, { ...item, quantity_right: right, quantity_left: left }];
      }
      persist(updated);
      return updated;
    });
    toast({ title: '✓', description: 'Added to cart' });
  };

  const removeFromCart = (doorId: string) => {
    setItems(prev => {
      const updated = prev.filter(i => i.door_id !== doorId);
      persist(updated);
      return updated;
    });
  };

  const updateQuantity = (doorId: string, right: number, left: number) => {
    if (right <= 0 && left <= 0) return removeFromCart(doorId);
    setItems(prev => {
      const updated = prev.map(i => i.door_id === doorId ? { ...i, quantity_right: right, quantity_left: left } : i);
      persist(updated);
      return updated;
    });
  };

  const clearCart = () => {
    setItems([]);
    persist([]);
  };

  const totalPrice = items.reduce((sum, i) => sum + i.price * (i.quantity_right + i.quantity_left), 0);
  const totalItems = items.reduce((sum, i) => sum + i.quantity_right + i.quantity_left, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalPrice, totalItems }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
