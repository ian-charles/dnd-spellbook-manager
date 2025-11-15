# Custom Subdomain Setup: spellbook.quantitydust.com

This guide explains how to map `spellbook.quantitydust.com` to your Cloud Run service.

## Overview

Using a subdomain is simpler than path-based routing because:
- No load balancer needed
- Direct Cloud Run domain mapping
- Automatic SSL certificate provisioning
- No need to rebuild with BASE_PATH

## Option 1: Using GCP Console (Recommended)

### Step 1: Map Domain in Cloud Run

1. Go to [Cloud Run Services](https://console.cloud.google.com/run?project=fooszone)
2. Click on **dnd-spellbook** service
3. Click **"MANAGE CUSTOM DOMAINS"** at the top
4. Click **"ADD MAPPING"**
5. Select the service: **dnd-spellbook**
6. Enter domain: **spellbook.quantitydust.com**
7. Click **"CONTINUE"**

GCP will show you DNS records to add.

### Step 2: Add DNS Records

You'll need to add these records to your DNS provider (wherever `quantitydust.com` is hosted):

**For domain verification (A or CNAME):**
- GCP will provide specific records for domain ownership verification

**For the subdomain (CNAME):**
```
Type:  CNAME
Name:  spellbook
Value: ghs.googlehosted.com.
TTL:   3600 (or auto)
```

**Or (A record alternative):**
```
Type:  A
Name:  spellbook
Value: <IP addresses provided by GCP>
TTL:   3600 (or auto)
```

### Step 3: Wait for Propagation

- DNS propagation: 5-60 minutes
- SSL certificate provisioning: 15-60 minutes
- Check status in Cloud Run Console under "MANAGE CUSTOM DOMAINS"

### Step 4: Verify

Once the certificate is provisioned:
```bash
curl -I https://spellbook.quantitydust.com
```

## Option 2: Using gcloud CLI

### Step 1: Verify Domain Ownership

First, verify you own `quantitydust.com`:

```bash
# This will provide verification instructions
gcloud domains verify quantitydust.com
```

### Step 2: Map Domain

```bash
gcloud beta run domain-mappings create \
    --service dnd-spellbook \
    --domain spellbook.quantitydust.com \
    --region us-central1
```

This command will output DNS records you need to add.

### Step 3: Add DNS Records

Add the DNS records shown in the output to your DNS provider.

### Step 4: Check Status

```bash
# Check domain mapping status
gcloud beta run domain-mappings describe \
    spellbook.quantitydust.com \
    --region us-central1

# View service details
gcloud run services describe dnd-spellbook \
    --region us-central1
```

## Common DNS Providers

### Cloudflare
1. Log in to Cloudflare Dashboard
2. Select your domain `quantitydust.com`
3. Go to **DNS** → **Records**
4. Click **Add record**
5. Add CNAME: `spellbook` → `ghs.googlehosted.com`
6. **Important**: Set Proxy status to **DNS only** (gray cloud, not orange)
7. Save

### Google Domains
1. Go to [Google Domains](https://domains.google.com)
2. Select `quantitydust.com`
3. Click **DNS** in the left menu
4. Scroll to **Custom resource records**
5. Add CNAME: `spellbook` → `ghs.googlehosted.com.`
6. Save

### Namecheap
1. Log in to Namecheap
2. Go to Domain List → Manage `quantitydust.com`
3. Go to **Advanced DNS**
4. Add New Record:
   - Type: CNAME Record
   - Host: `spellbook`
   - Value: `ghs.googlehosted.com`
   - TTL: Automatic
5. Save

### GoDaddy
1. Log in to GoDaddy
2. Go to My Products → DNS
3. Select `quantitydust.com`
4. Click **Add** under Records
5. Add CNAME:
   - Type: CNAME
   - Name: `spellbook`
   - Value: `ghs.googlehosted.com`
   - TTL: 1 hour
6. Save

## Troubleshooting

### Domain mapping stuck in "Pending"
- **Cause**: DNS records not propagated or incorrect
- **Fix**:
  - Verify DNS records are correct: `dig spellbook.quantitydust.com`
  - Wait up to 60 minutes for DNS propagation
  - Check GCP Console for specific error messages

### SSL certificate not provisioning
- **Cause**: Domain ownership not verified or CNAME not pointing correctly
- **Fix**:
  - Ensure CNAME points to `ghs.googlehosted.com`
  - If using Cloudflare, disable proxy (DNS only mode)
  - Wait up to 60 minutes for certificate provisioning

### "ERR_SSL_VERSION_OR_CIPHER_MISMATCH"
- **Cause**: Certificate still provisioning
- **Fix**: Wait 15-60 minutes, then try again

### DNS not resolving
```bash
# Check DNS propagation
dig spellbook.quantitydust.com

# Expected output should show CNAME to ghs.googlehosted.com
# or A records pointing to Google's IPs
```

### Test without SSL (temporary)
```bash
# Check if service is mapped (HTTP only, will redirect to HTTPS once cert is ready)
curl -I http://spellbook.quantitydust.com
```

## Updating the Service

When you deploy updates, the domain mapping remains intact:

```bash
# Just deploy normally
./deploy-cloud-run.sh

# Domain spellbook.quantitydust.com automatically serves new version
```

## Remove Domain Mapping

If you want to remove the custom domain:

```bash
gcloud beta run domain-mappings delete \
    spellbook.quantitydust.com \
    --region us-central1
```

Or use the GCP Console: Cloud Run → Manage Custom Domains → Delete mapping

## Security Considerations

- **HTTPS Only**: Cloud Run automatically redirects HTTP to HTTPS
- **Auto SSL**: Google manages SSL certificate renewal
- **CORS**: Not needed for subdomain (same-origin if main site is also on quantitydust.com)

## Cost

- **Domain Mapping**: Free
- **SSL Certificate**: Free (Google-managed)
- **DNS Queries**: Depends on your DNS provider (typically free/included)
- **Cloud Run**: Same as before (~$0-2/month for low traffic)

## Benefits of Subdomain vs Subpath

✅ **Subdomain (spellbook.quantitydust.com)**:
- Simpler setup (no load balancer needed)
- Free SSL certificate
- No BASE_PATH configuration needed
- Independent scaling and deployment
- Easier to move to different infrastructure later

❌ **Subpath (quantitydust.com/spellbook)**:
- Requires load balancer setup
- More complex BASE_PATH configuration
- Shared domain means tighter coupling
- Additional load balancer costs

## Next Steps

1. Choose your preferred method (Console or CLI)
2. Map the domain in Cloud Run
3. Add DNS records at your DNS provider
4. Wait for DNS propagation and SSL provisioning
5. Visit https://spellbook.quantitydust.com

Your app is already deployed and ready - no rebuild needed!
