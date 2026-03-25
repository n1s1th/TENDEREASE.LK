#!/bin/bash
echo "Building all docker images..."
# Examples for building images for each service
echo "Building API Gateway..."
docker build -t tenderease/api-gateway ./api-gateway
echo "Building Eureka Server..."
docker build -t tenderease/eureka-server ./eureka-server
echo "Building User Service..."
docker build -t tenderease/user-service ./user-service
# Add other services below
echo "Docker builds complete!"
