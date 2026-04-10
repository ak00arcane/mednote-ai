#!/bin/bash

# Build Docker image
docker build -t mednote-ai:latest \
  --build-arg VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY \
  .

# Run locally
docker run -p 3000:3000 mednote-ai:latest

# Or push to ECR (AWS Elastic Container Registry)
# aws ecr get-login-password --region us-east-1 | \
#   docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
# docker tag mednote-ai:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/mednote-ai:latest
# docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/mednote-ai:latest
