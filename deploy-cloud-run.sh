#!/bin/bash

# Deploy D&D Spellbook Manager to Google Cloud Run
# Usage: ./deploy-cloud-run.sh

set -e

# Configuration
PROJECT_ID="fooszone"
SERVICE_NAME="dnd-spellbook"
REGION="us-central1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "=========================================="
echo "Deploying D&D Spellbook Manager"
echo "=========================================="
echo "Project ID: ${PROJECT_ID}"
echo "Service: ${SERVICE_NAME}"
echo "Region: ${REGION}"
echo "Image: ${IMAGE_NAME}"
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
echo "Building container image..."
gcloud builds submit --tag="${IMAGE_NAME}"

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
echo "To view logs:"
echo "  gcloud run logs read ${SERVICE_NAME} --region=${REGION}"
echo ""
echo "To update the service:"
echo "  ./deploy-cloud-run.sh"
echo ""
echo "To delete the service:"
echo "  gcloud run services delete ${SERVICE_NAME} --region=${REGION}"
