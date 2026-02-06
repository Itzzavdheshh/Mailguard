# Security Configuration Guide

## Critical Security Settings for Production

### 1. ENCRYPTION_KEY (REQUIRED in Production)

Gmail refresh tokens are encrypted at rest using AES-256-GCM. A strong encryption key is **REQUIRED** in production.

#### Generate a secure encryption key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Add to `.env`:
```bash
ENCRYPTION_KEY=your_64_character_hex_string_here
```

**⚠️ WARNING**: 
- Never commit this key to version control
- Never reuse keys across environments
- Rotating this key will invalidate all existing encrypted refresh tokens
- Store securely (e.g., AWS Secrets Manager, Azure Key Vault)

---

### 2. Environment Variable Validation

The application validates all environment variables at startup:

**Required Variables:**
- `MONGO_URI` - MongoDB connection string
- `CLERK_SECRET_KEY` - Clerk authentication secret (starts with `sk_`)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GOOGLE_REDIRECT_URI` - OAuth callback URL
- `ML_SERVICE_URL` - ML service endpoint
- `ENCRYPTION_KEY` - **REQUIRED in production** (64 hex chars)

**Format Validation:**
- `CLERK_SECRET_KEY` must start with `sk_`
- `MONGO_URI` must start with `mongodb://` or `mongodb+srv://`
- `ML_SERVICE_URL` must start with `http://` or `https://`
- `ENCRYPTION_KEY` must be exactly 64 hexadecimal characters

---

### 3. Secrets Management Best Practices

#### Development:
```bash
# .env (gitignored)
ENCRYPTION_KEY=dev_key_here
CLERK_SECRET_KEY=sk_test_xxxxx
```

#### Production:
Use environment-specific secret management:

**Docker:**
```bash
# Pass via environment
docker run -e ENCRYPTION_KEY=$PRODUCTION_KEY mailguard-backend
```

**Kubernetes:**
```yaml
# Use secrets
apiVersion: v1
kind: Secret
metadata:
  name: mailguard-secrets
data:
  encryption-key: <base64-encoded-key>
```

**Cloud Platforms:**
- AWS: Secrets Manager or Parameter Store
- Azure: Key Vault
- GCP: Secret Manager

---

### 4. Token Security

**Gmail Tokens:**
- Access tokens stored in plaintext (short-lived, ~1 hour)
- Refresh tokens encrypted with AES-256-GCM
- Automatic token refresh handled securely
- Tokens scoped to minimum required permissions

**Clerk Tokens:**
- JWT tokens validated on every request
- Secret key never exposed to frontend
- Tokens expire automatically

---

### 5. Logging Security

**What we log:**
- Request methods, paths, status codes, response times
- Error messages and stack traces (dev only)

**What we DON'T log:**
- Authorization headers or tokens
- Password or secret values
- User email content
- Request bodies with sensitive data

**Production Configuration:**
```bash
NODE_ENV=production  # Minimal logging, no stack traces
```

---

### 6. Rate Limiting

Protects against abuse and API exhaustion:

| Endpoint | Limit | Window | Purpose |
|----------|-------|--------|---------|
| General API | 100 | 15 min | DoS protection |
| Gmail Fetch | 10 | 1 hour | API quota protection |
| Classification | 30 | 15 min | ML service protection |
| Bulk Operations | 5 | 1 hour | Abuse prevention |
| Admin Operations | 2 | 1 day | Resource protection |
| Feedback | 20 | 1 hour | Spam prevention |

---

### 7. HTTPS / TLS

**Production Requirements:**
- All API traffic must use HTTPS
- TLS 1.2 or higher
- Valid SSL certificate

**Configure reverse proxy (nginx):**
```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

---

### 8. Security Headers

Already configured via Helmet middleware:
- ✅ X-Content-Type-Options: nosniff
- ✅ X-Frame-Options: DENY
- ✅ X-XSS-Protection: 1; mode=block
- ✅ Strict-Transport-Security (HSTS)
- ✅ Content-Security-Policy

---

### 9. Database Security

**MongoDB Connection:**
```bash
# Use authentication
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/mailguard

# IP Whitelist in MongoDB Atlas
# Use connection pooling
# Enable audit logging
```

---

### 10. Security Checklist for Deployment

- [ ] Generate and set `ENCRYPTION_KEY` (64 hex chars)
- [ ] Rotate all secrets from development
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS with production frontend URL
- [ ] Set up secrets management (no hardcoded secrets)
- [ ] Enable MongoDB authentication and IP whitelist
- [ ] Configure rate limiting thresholds for your scale
- [ ] Set up monitoring and alerting
- [ ] Review and sanitize all logs
- [ ] Test OAuth flows with production URLs
- [ ] Verify Clerk webhooks are HTTPS

---

### 11. Incident Response

**If encryption key is compromised:**
1. Immediately rotate `ENCRYPTION_KEY`
2. Revoke all Gmail OAuth connections
3. Notify affected users to reconnect Gmail
4. Audit access logs for suspicious activity

**If Clerk secret is compromised:**
1. Rotate in Clerk dashboard immediately
2. Update `CLERK_SECRET_KEY` environment variable
3. Force user session invalidation
4. Review recent authentication attempts

---

### 12. Security Updates

**Regular Maintenance:**
```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update

# Review security advisories
npm audit fix
```

---

## Questions?

For security issues, contact: security@mailguard.example.com

**Do NOT** open public GitHub issues for security vulnerabilities.
