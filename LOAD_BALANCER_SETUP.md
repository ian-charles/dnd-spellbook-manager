# Load Balancer Setup for quantitydust.com/spellbook

This guide explains how to configure Google Cloud Load Balancer to serve the D&D Spellbook Manager at `quantitydust.com/spellbook` alongside your existing Cloud Run service.

## Overview

You'll create a **path-based routing** configuration that:
- Routes `/spellbook/*` → D&D Spellbook Cloud Run service
- Routes all other paths → Your existing Cloud Run service
- Uses a single HTTPS load balancer with your SSL certificate
- Maintains a single public IP for quantitydust.com

## Prerequisites

- D&D Spellbook Manager deployed to Cloud Run (with `/spellbook` base path)
- Existing Cloud Run service for quantitydust.com
- Domain `quantitydust.com` pointing to a Google Cloud Load Balancer
- SSL certificate for quantitydust.com

## Step 1: Deploy with Subpath Support

First, redeploy the D&D Spellbook with the `/spellbook` base path:

```bash
./deploy-with-subpath.sh
```

This builds the app configured for the `/spellbook` subpath.

## Step 2: Create Serverless NEG for D&D Spellbook

A Network Endpoint Group (NEG) connects your Cloud Run service to the load balancer.

```bash
# Set variables
PROJECT_ID="fooszone"
REGION="us-central1"
SERVICE_NAME="dnd-spellbook"
NEG_NAME="dnd-spellbook-neg"

# Create the serverless NEG
gcloud compute network-endpoint-groups create ${NEG_NAME} \
    --region=${REGION} \
    --network-endpoint-type=serverless \
    --cloud-run-service=${SERVICE_NAME}
```

## Step 3: Create Backend Service

The backend service defines how traffic is routed to your Cloud Run service.

```bash
BACKEND_SERVICE_NAME="dnd-spellbook-backend"

# Create backend service
gcloud compute backend-services create ${BACKEND_SERVICE_NAME} \
    --global \
    --load-balancing-scheme=EXTERNAL_MANAGED

# Add the NEG to the backend service
gcloud compute backend-services add-backend ${BACKEND_SERVICE_NAME} \
    --global \
    --network-endpoint-group=${NEG_NAME} \
    --network-endpoint-group-region=${REGION}
```

## Step 4: Update URL Map for Path-Based Routing

You need to modify your **existing** URL map to add the `/spellbook` path matcher.

### Option A: Using Console (Recommended)

1. Go to [Load Balancing](https://console.cloud.google.com/net-services/loadbalancing/list/loadBalancers) in GCP Console
2. Click on your existing load balancer for quantitydust.com
3. Click **Edit**
4. In the **Host and path rules** section:
   - Click **Add host and path rule**
   - **Hosts**: `quantitydust.com`, `www.quantitydust.com`
   - **Paths**: `/spellbook/*`
   - **Backend**: Select `dnd-spellbook-backend`
5. Ensure your default backend (for `/*`) points to your existing service
6. Click **Update**

### Option B: Using gcloud CLI

First, get your existing URL map name:

```bash
# List URL maps
gcloud compute url-maps list

# Export existing URL map configuration
URL_MAP_NAME="your-url-map-name"  # Replace with actual name
gcloud compute url-maps export ${URL_MAP_NAME} \
    --destination=url-map-config.yaml \
    --global
```

Edit `url-map-config.yaml` to add a path matcher for `/spellbook`:

```yaml
name: your-url-map-name
defaultService: https://www.googleapis.com/compute/v1/projects/fooszone/global/backendServices/your-default-backend
hostRules:
  - hosts:
      - quantitydust.com
      - www.quantitydust.com
    pathMatcher: path-matcher-1
pathMatchers:
  - name: path-matcher-1
    defaultService: https://www.googleapis.com/compute/v1/projects/fooszone/global/backendServices/your-default-backend
    pathRules:
      - paths:
          - /spellbook/*
        service: https://www.googleapis.com/compute/v1/projects/fooszone/global/backendServices/dnd-spellbook-backend
```

Import the updated configuration:

```bash
gcloud compute url-maps import ${URL_MAP_NAME} \
    --source=url-map-config.yaml \
    --global
```

## Step 5: Verify Configuration

After updating the load balancer:

1. Wait 2-5 minutes for changes to propagate
2. Test the endpoints:

```bash
# Test D&D Spellbook (should return HTML)
curl -I https://quantitydust.com/spellbook/

# Test existing service (should still work)
curl -I https://quantitydust.com/

# Test that assets load correctly
curl -I https://quantitydust.com/spellbook/assets/index-*.js
```

3. Visit in browser: `https://quantitydust.com/spellbook`

## Step 6: Monitor and Debug

### View Load Balancer Logs

```bash
# View backend service health
gcloud compute backend-services get-health dnd-spellbook-backend --global

# View Cloud Run service logs
gcloud run services logs read dnd-spellbook --region=us-central1
```

### Common Issues

#### 404 Not Found
- **Cause**: Path matcher not configured correctly
- **Fix**: Verify the path rule is `/spellbook/*` (with asterisk)

#### 502 Bad Gateway
- **Cause**: Cloud Run service not responding or base path mismatch
- **Fix**:
  - Check Cloud Run logs: `gcloud run services logs read dnd-spellbook`
  - Verify service deployed with `BASE_PATH=/spellbook`
  - Test Cloud Run directly: `curl https://dnd-spellbook-329000244472.us-central1.run.app/`

#### Assets 404 (CSS/JS not loading)
- **Cause**: Base path not configured correctly in Vite build
- **Fix**: Redeploy with `./deploy-with-subpath.sh` to ensure `BASE_PATH=/spellbook`

#### Redirect to Cloud Run URL
- **Cause**: Service worker or hard-coded URLs
- **Fix**: Clear browser cache and service workers

## Architecture Diagram

```
Internet
   │
   ▼
[Cloud Load Balancer - quantitydust.com]
   │
   ├─ Path: /spellbook/*  ──▶  [NEG] ──▶ [Cloud Run: dnd-spellbook]
   │                                        (BASE_PATH=/spellbook)
   │
   └─ Path: /*            ──▶  [NEG] ──▶ [Cloud Run: your-existing-service]
```

## Cost Estimate

**Additional costs for this setup:**
- Load Balancer (already exists): No additional cost
- Backend Service: No additional cost
- Network Endpoint Group: No additional cost
- Cloud Run (dnd-spellbook):
  - Free tier: 2 million requests/month, 360,000 GB-seconds/month
  - Beyond free tier: ~$0.40 per million requests
  - Estimate for low traffic: **$0-2/month**

## Updating the App

To deploy updates to the spellbook:

```bash
# Deploy with subpath support
./deploy-with-subpath.sh
```

The load balancer configuration doesn't need to change for updates.

## Rollback

To remove the spellbook from your domain:

```bash
# Remove path rule from URL map (use Console or gcloud export/import)

# Delete backend service
gcloud compute backend-services delete dnd-spellbook-backend --global

# Delete NEG
gcloud compute network-endpoint-groups delete dnd-spellbook-neg --region=us-central1

# Optionally delete Cloud Run service
gcloud run services delete dnd-spellbook --region=us-central1
```

## Security Considerations

- **HTTPS Only**: Load balancer should redirect HTTP → HTTPS
- **Cloud Run IAM**: Service is set to `--allow-unauthenticated` (public access)
- **CORS**: Not needed since same domain
- **CSP Headers**: Configured in nginx.conf

## Next Steps

1. Deploy with subpath: `./deploy-with-subpath.sh`
2. Create NEG and backend service (Step 2-3)
3. Update URL map for path routing (Step 4)
4. Test and verify (Step 5)
5. Monitor performance and costs

## Support

- [Cloud Load Balancing Docs](https://cloud.google.com/load-balancing/docs)
- [Cloud Run with Load Balancer](https://cloud.google.com/load-balancing/docs/https/setting-up-https-serverless)
- [Path-based routing](https://cloud.google.com/load-balancing/docs/https/url-map-concepts)
