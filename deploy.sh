#!/bin/bash

echo "Starting project in docker"

docker-compose --project-name=blog-backend-dev2 build
docker-compose --project-name=blog-backend-dev2 down
docker-compose --project-name=blog-backend-dev2 up -d
