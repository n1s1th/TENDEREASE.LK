#!/bin/bash

echo "Building all services..."

mvn clean install -DskipTests

echo "Build complete!"
