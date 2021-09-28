#!/bin/bash

echo "Starting project in docker"

PROJECT_NAME=blog-backend

if [ ! -z "$1" ]
then
  PROJECT_NAME=$1
fi

echo "Docker container name: $PROJECT_NAME";
docker-compose --project-name=$PROJECT_NAME build
docker-compose --project-name=$PROJECT_NAME down
docker-compose --project-name=$PROJECT_NAME up -d
