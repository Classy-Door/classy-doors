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

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load cart from Supabase profile
  useEffect(() => {
    if (!user) {
      setItems([]);
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

      if (data?.cart_data && Array.isArray(data.cart_data)) {
        setItems(data.cart_data as unknown as CartItem[]);
      }
    };
    load();
  }, [user]);

  // Persist cart to Supabase
  const persist = useCallback(async (newItems: CartItem[]) => {
    if (!user) return;
    await supabase.from('profiles').update({ cart_data: newItems as any }).eq('id', user.id);
  }, [user]);

  const addToCart = (item: Omit<CartItem, 'quantity_right' | 'quantity_left'>, right: number, left: number) => {
    if (!user) {
      toast({ title: 'Please log in', description: 'You need to log in to add items to your cart.', variant: 'destructive' });
      return;
    }
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
