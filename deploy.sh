#!/bin/bash

IMAGE_NAME="asset_management_api"
CONTAINER_NAME="asset_management_api"

# Check if the container exists
if [ "$(docker ps -a -q -f name=$CONTAINER_NAME)" ]; then
    echo "Stopping and removing existing container..."
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
fi

# Check if the image exists
if [ "$(docker images -q $IMAGE_NAME)" ]; then
    echo "Removing existing image..."
    docker rmi $IMAGE_NAME
fi

# Build the new image
echo "Building the Docker image..."
docker build -t $IMAGE_NAME .

# Run the new container
echo "Running the Docker container..."
docker run -d --name $CONTAINER_NAME \
  -p 8080:8080 \
  --restart always \
  -e DATABASE_URL=$DATABASE_URL \
  -e SECRET_ACCESS_TOKEN_KEY=$SECRET_ACCESS_TOKEN_KEY \
  -e SECRET_REFRESH_TOKEN_KEY=$SECRET_REFRESH_TOKEN_KEY \
  -e PORT=$PORT \
  -e DOMAINS=$DOMAINS \
  $IMAGE_NAME
