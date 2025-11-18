#!/bin/bash

# Deploy D&D Spellbook Manager to Google Cloud Run
# This version builds locally and pushes to Artifact Registry
# Usage: ./deploy-local-build.sh

set -e

# Configuration
PROJECT_ID="fooszone"
SERVICE_NAME="dnd-spellbook"
REGION="us-central1"
REPOSITORY="cloud-run-images"
IMAGE_NAME="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${SERVICE_NAME}"

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
gcloud services enable artifactregistry.googleapis.com
gcloud services enable run.googleapis.com

# Create Artifact Registry repository if it doesn't exist
echo "Ensuring Artifact Registry repository exists..."
gcloud artifacts repositories describe "${REPOSITORY}" \
    --location="${REGION}" 2>/dev/null || \
gcloud artifacts repositories create "${REPOSITORY}" \
    --repository-format=docker \
    --location="${REGION}" \
    --description="Docker images for Cloud Run services"

# Configure Docker to use gcloud as credential helper
echo "Configuring Docker authentication..."
gcloud auth configure-docker ${REGION}-docker.pkg.dev --quiet

# Build the Docker image locally for AMD64 (Cloud Run requirement)
echo "Building Docker image locally for linux/amd64..."
docker buildx build --platform linux/amd64 -t "${IMAGE_NAME}:latest" --load .

# Push the image to Artifact Registry
echo "Pushing image to Artifact Registry..."
docker push "${IMAGE_NAME}:latest"

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy "${SERVICE_NAME}" \
    --image="${IMAGE_NAME}:latest" \
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

# Write production URL to .env.production for future builds
echo "Writing production URL to .env.production..."
cat > .env.production << ENV_EOF
# Production environment variables
# Generated automatically by deploy-local-build.sh
VITE_PRODUCTION_URL=${SERVICE_URL}
VITE_APP_VERSION=$(node -p "require('./package.json').version")
ENV_EOF

echo "=========================================="
echo "Deployment complete!"
echo "Service URL: ${SERVICE_URL}"
echo "=========================================="
echo ""
echo "To view logs:"
echo "  gcloud run logs read ${SERVICE_NAME} --region=${REGION}"
echo ""
echo "To update the service:"
echo "  ./deploy-local-build.sh"
echo ""
echo "To delete the service:"
echo "  gcloud run services delete ${SERVICE_NAME} --region=${REGION}"
