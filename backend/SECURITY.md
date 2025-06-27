# Security Guide for KolaboLab

## API Key Management

### ⚠️ CRITICAL: Immediate Actions Required

If you've accidentally exposed an API key:

1. **Revoke the exposed key immediately**
   - Go to your service provider (e.g., Resend, Cloudinary)
   - Delete/revoke the exposed API key
   - Generate a new one

2. **Check for unauthorized usage**
   - Review usage logs for any unauthorized activity
   - Monitor billing for unexpected charges

3. **Update your applications**
   - Replace the old key with the new key in all environments
   - Restart your applications

### Environment Variables Setup

#### 1. Local Development

```bash
# Copy the template
cp .env.local .env

# Edit with your actual values
nano .env
```

#### 2. Production Deployment

**For Vercel:**
```bash
# Set environment variables via CLI
vercel env add RESEND_API_KEY production
vercel env add JWT_SECRET production
# ... add all required variables
```

**For other platforms:**
- Use your platform's environment variable management
- Never store secrets in code or config files

### Security Best Practices

#### 1. API Key Guidelines

- **Never commit API keys** to version control
- **Use different keys** for different environments (dev/staging/prod)
- **Rotate keys regularly** (every 3-6 months)
- **Use least privilege** - only grant necessary permissions
- **Monitor usage** - watch for unexpected activity

#### 2. Environment Variable Security

```typescript
// ✅ Good: Validate environment variables
const apiKey = process.env.RESEND_API_KEY;
if (!apiKey || apiKey === 're_your_secure_api_key_here') {
  throw new Error('RESEND_API_KEY not properly configured');
}

// ❌ Bad: Using default/placeholder values in production
const apiKey = process.env.RESEND_API_KEY || 're_default_key';
```

#### 3. Git Security

Add to `.gitignore`:
```
# Environment files
.env
.env.local
.env.*.local

# API keys and secrets
secrets/
*.key
*.pem
```

#### 4. Code Review Checklist

Before committing:
- [ ] No API keys in code
- [ ] No hardcoded secrets
- [ ] Environment variables properly validated
- [ ] Sensitive data properly sanitized in logs

### Service-Specific Setup

#### Resend Email Service

1. **Create API Key:**
   - Go to [Resend API Keys](https://resend.com/api-keys)
   - Create a new key with appropriate permissions
   - Copy the key (starts with `re_`)

2. **Set Environment Variable:**
   ```bash
   RESEND_API_KEY=re_your_actual_key_here
   ```

3. **Verify Setup:**
   ```typescript
   // The service will log initialization status
   // Check logs for "Resend email service initialized successfully"
   ```

#### JWT Secrets

Generate secure JWT secrets:

```bash
# Generate JWT secret (64 bytes)
openssl rand -hex 64

# Generate refresh token secret (different from main secret)
openssl rand -hex 64
```

### Monitoring and Alerts

#### 1. Set up monitoring for:
- Unusual API usage patterns
- Failed authentication attempts
- Unexpected billing changes
- Error rate spikes

#### 2. Log Security Events:
- Authentication attempts
- API key usage
- Configuration changes
- Failed requests

### Incident Response

If you suspect a security breach:

1. **Immediate Actions:**
   - Revoke all potentially compromised keys
   - Change all passwords
   - Review access logs

2. **Assessment:**
   - Determine scope of exposure
   - Check for unauthorized access
   - Review billing/usage for anomalies

3. **Recovery:**
   - Generate new secrets
   - Update all systems
   - Implement additional monitoring

4. **Prevention:**
   - Review security practices
   - Update access controls
   - Improve monitoring

### Support

For security concerns:
- Create a private issue in the repository
- Email: security@kolabolab.com
- For critical issues, follow responsible disclosure

### Resources

- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Resend Security Best Practices](https://resend.com/docs/security)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)