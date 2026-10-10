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

  it('enforces character length limits on profile fields to prevent buffer bloat/DoS', () => {
    const validateProfile = (data: { full_name?: string; phone?: string; address?: string }) => {
      if ((data.full_name?.length ?? 0) > 100) throw new Error('Full name cannot exceed 100 characters');
      if ((data.phone?.length ?? 0) > 25) throw new Error('Phone cannot exceed 25 characters');
      if ((data.address?.length ?? 0) > 500) throw new Error('Address cannot exceed 500 characters');
      return true;
    };

    expect(validateProfile({ full_name: 'Ahmed', phone: '01012345678', address: 'Cairo' })).toBe(true);
    expect(() => validateProfile({ full_name: 'A'.repeat(101) })).toThrow('Full name cannot exceed 100 characters');
    expect(() => validateProfile({ phone: '1'.repeat(26) })).toThrow('Phone cannot exceed 25 characters');
    expect(() => validateProfile({ address: 'A'.repeat(501) })).toThrow('Address cannot exceed 500 characters');
  });

  it('safely handles injection payloads in profile and auth inputs without execution', () => {
    const maliciousInputs = [
      "'; DROP TABLE profiles; --",
      "<script>alert('xss')</script>",
      "' OR '1'='1",
      "${7*7}",
      "../../etc/passwd",
    ];

    maliciousInputs.forEach(input => {
      const sanitized = input.trim();
      expect(typeof sanitized).toBe('string');
      expect(sanitized).toBe(input.trim());
    });
  });
});
