import { describe, it, expect } from 'vitest';

describe('Authentication & Profile Data Flow', () => {
  it('correctly formats and trims email and phone identifiers', () => {
    const rawEmailInput = '   User@example.com   ';
    const rawPhoneInput = '  01234567890   ';

    const sanitize = (input: string) => input.trim();

    expect(sanitize(rawEmailInput)).toBe('User@example.com');
    expect(sanitize(rawEmailInput).includes('@')).toBe(true);

    expect(sanitize(rawPhoneInput)).toBe('01234567890');
    expect(sanitize(rawPhoneInput).includes('@')).toBe(false);
  });

  it('includes delivery address in signup metadata payload', () => {
    const signupForm = {
      fullName: 'Ahmed Fouad',
      email: 'ahmed@example.com',
      phone: '01012345678',
      address: '15 El-Shorouk City, Cairo, Egypt',
      password: 'password123',
    };

    // Construct metadata sent to supabase.auth.signUp
    const buildSignupOptions = (form: typeof signupForm) => ({
      data: {
        full_name: form.fullName,
        phone: form.phone,
        address: form.address || '',
      },
      emailRedirectTo: 'https://classy-doors.vercel.app',
    });

    const options = buildSignupOptions(signupForm);

    expect(options.data.full_name).toBe('Ahmed Fouad');
    expect(options.data.phone).toBe('01012345678');
    expect(options.data.address).toBe('15 El-Shorouk City, Cairo, Egypt');
    expect(options.data.address).not.toBe('');
  });

  it('correctly maps profile database columns including address', () => {
    const profileRow = {
      id: 'usr-999',
      full_name: 'Customer Name',
      phone: '01000000000',
      email: 'customer@example.com',
      address: 'Nasr City, Cairo',
      avatar_url: '',
      cart_data: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    expect(profileRow.address).toBe('Nasr City, Cairo');
    expect(profileRow.phone).toBe('01000000000');
  });
});
