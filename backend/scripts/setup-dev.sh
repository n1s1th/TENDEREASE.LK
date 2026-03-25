#!/bin/bash
echo "Setting up Dev environment..."
docker-compose up -d postgres redis rabbitmq keycloak
echo "Infrastructure started!"
