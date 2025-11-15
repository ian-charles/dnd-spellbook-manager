#!/bin/bash

# Deploy D&D Spellbook Manager to Cloud Run with subpath support
# This version builds with BASE_PATH=/spellbook for use behind a load balancer
# Usage: ./deploy-with-subpath.sh

set -e

# Configuration
PROJECT_ID="fooszone"
SERVICE_NAME="dnd-spellbook"
REGION="us-central1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"
BASE_PATH="/spellbook"

echo "=========================================="
echo "Deploying D&D Spellbook Manager"
echo "=========================================="
echo "Project ID: ${PROJECT_ID}"
echo "Service: ${SERVICE_NAME}"
echo "Region: ${REGION}"
echo "Image: ${IMAGE_NAME}"
echo "Base Path: ${BASE_PATH}"
echo "=========================================="

# Set the active project
echo "Setting active GCP project..."
gcloud config set project "${PROJECT_ID}"

# Enable required APIs
echo "Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build and push the container image using Cloud Build
# Pass BASE_PATH as a build arg
echo "Building container image with BASE_PATH=${BASE_PATH}..."
gcloud builds submit \
    --config=cloudbuild.yaml \
    --substitutions=_BASE_PATH="${BASE_PATH}",_IMAGE_NAME="${IMAGE_NAME}"

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy "${SERVICE_NAME}" \
    --image="${IMAGE_NAME}" \
    --platform=managed \
    --region="${REGION}" \
    --allow-unauthenticated \
    --memory=256Mi \
    --cpu=1 \
    --port=8080 \
    --max-instances=10 \
    --timeout=60

# Get the service URL
SERVICE_URL=$(gcloud run services describe "${SERVICE_NAME}" \
    --region="${REGION}" \
    --format='value(status.url)')

echo "=========================================="
echo "Deployment complete!"
echo "Service URL: ${SERVICE_URL}"
echo "=========================================="
echo ""
echo "IMPORTANT: This service is configured for BASE_PATH=${BASE_PATH}"
echo "It should be accessed via a load balancer at:"
echo "  https://quantitydust.com${BASE_PATH}"
echo ""
echo "Next steps:"
echo "  1. Set up a load balancer with path-based routing"
echo "  2. Route /spellbook/* to this Cloud Run service"
echo "  3. Ensure your existing service handles other paths"
echo ""
echo "To view logs:"
echo "  gcloud run logs read ${SERVICE_NAME} --region=${REGION}"
