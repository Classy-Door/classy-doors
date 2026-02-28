# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Classy Doors, please **do not** open a public GitHub issue. Instead, please report it responsibly to us.

### How to Report

**Email:** security@classydoors.com (or contact repository maintainers privately)

Please include:
- Description of the vulnerability
- Steps to reproduce (if applicable)
- Potential impact
- Suggested fix (if you have one)

### What to Expect

- We will acknowledge receipt of your report within 48 hours
- We will update you on the progress of fixing the vulnerability
- We will credit you in the security advisory (unless you prefer anonymity)
- We will work on a fix and release a patched version as soon as possible

## Supported Versions

| Version | Status       | Security Updates |
|---------|--------------|------------------|
| Latest  | Supported    | Yes              |
| Older   | Not Supported| No               |

## Security Best Practices

When using Classy Doors:

1. **Environment Variables** - Never commit `.env` files. Use `.env.example` as a template.
2. **API Keys** - Rotate Supabase keys regularly and never expose them in public repositories.
3. **Dependencies** - Keep all dependencies updated. Run `npm audit` regularly.
4. **Authentication** - Use strong passwords for user accounts.
5. **HTTPS** - Always use HTTPS in production.

## Known Security Measures

- Supabase API keys use read-only (anon) keys in the frontend
- Authentication is handled server-side with Supabase
- Password validation is enforced on signup
- Session persistence is managed securely

## Security Headers

We recommend configuring the following headers in production:
- `Strict-Transport-Security`
- `Content-Security-Policy`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `X-XSS-Protection`

## Questions?

For general security questions, feel free to open a discussion in the GitHub repository.
