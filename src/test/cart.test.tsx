import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { CartProvider, useCart, CartItem } from '@/contexts/CartContext';

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    profile: null,
    loading: false,
    isAdmin: false,
  }),
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
      update: () => ({
        eq: () => Promise.resolve({ error: null }),
      }),
    }),
  },
}));

describe('CartContext & Guest Cart Logic', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <CartProvider>{children}</CartProvider>
  );

  const sampleDoor: Omit<CartItem, 'quantity_right' | 'quantity_left'> = {
    door_id: 'door-123',
    door_number: '101',
    category: 'F',
    width: '10',
    price: 15000,
    photo_url: '/door.jpg',
  };

  it('initializes with an empty cart when localStorage is clean', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it('allows guests to add items and persists to localStorage', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(sampleDoor, 2, 1);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].door_id).toBe('door-123');
    expect(result.current.items[0].quantity_right).toBe(2);
    expect(result.current.items[0].quantity_left).toBe(1);
    expect(result.current.totalItems).toBe(3);
    expect(result.current.totalPrice).toBe(15000 * 3);

    const saved = localStorage.getItem('classy_doors_guest_cart');
    expect(saved).not.toBeNull();
    const parsed = JSON.parse(saved!);
    expect(parsed[0].door_id).toBe('door-123');
  });

  it('increments quantities when adding existing door item', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(sampleDoor, 1, 0);
    });
    act(() => {
      result.current.addToCart(sampleDoor, 1, 2);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity_right).toBe(2);
    expect(result.current.items[0].quantity_left).toBe(2);
    expect(result.current.totalItems).toBe(4);
    expect(result.current.totalPrice).toBe(15000 * 4);
  });

  it('updates quantity and removes item when both quantities reach zero', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(sampleDoor, 1, 1);
    });
    expect(result.current.items).toHaveLength(1);

    act(() => {
      result.current.updateQuantity('door-123', 0, 0);
    });
    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it('clears cart completely', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(sampleDoor, 2, 0);
    });
    expect(result.current.items).toHaveLength(1);

    act(() => {
      result.current.clearCart();
    });
    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
  });
});
