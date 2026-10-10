import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';

describe('LanguageContext & Persistence Logic', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = '';
    document.documentElement.dir = '';
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <LanguageProvider>{children}</LanguageProvider>
  );

  it('defaults to Arabic ("ar") with RTL direction', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });

    expect(result.current.language).toBe('ar');
    expect(result.current.dir).toBe('rtl');
    expect(document.documentElement.lang).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');
  });

  it('translates keys correctly in Arabic', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });

    expect(result.current.t('cart')).toBe('السلة');
    expect(result.current.t('shop')).toBe('المتجر');
  });

  it('switches to English ("en") with LTR direction and persists to localStorage', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });

    act(() => {
      result.current.setLanguage('en');
    });

    expect(result.current.language).toBe('en');
    expect(result.current.dir).toBe('ltr');
    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
    expect(result.current.t('cart')).toBe('Cart');
    expect(result.current.t('shop')).toBe('Shop');

    expect(localStorage.getItem('classy_door_lang')).toBe('en');
  });

  it('restores previously saved language from localStorage on mount', () => {
    localStorage.setItem('classy_door_lang', 'en');

    const { result } = renderHook(() => useLanguage(), { wrapper });

    expect(result.current.language).toBe('en');
    expect(result.current.dir).toBe('ltr');
    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
  });
});
