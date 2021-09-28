#!/bin/bash

echo "Creating environment file"

# application environments
echo "DATABASE_HOST=$DATABASE_HOST" > .env
echo "DATABASE_PORT=$DATABASE_PORT" >> .env
echo "DATABASE_NAME=$DATABASE_NAME" >> .env
echo "CORS=$CORS" >> .env
echo "ORIGINS=$ORIGINS" >> .env
echo "NODE_ENV=$NODE_ENV" >> .env
echo "SITE_URL=$SITE_URL" >> .env
echo "API_URL=$API_URL" >> .env

# docker configurations
echo "BLOG_RESOURCES=$BLOG_RESOURCES" >> .env

# secrets
echo "JWT_SECRET=$JWT_SECRET" >> .env
echo "ADMIN_JWT_SECRET=$ADMIN_JWT_SECRET" >> .env
echo "SECRET1=$SECRET" >> .env
echo "SECRET2=$SECRET" >> .env

# integration with 3th parties
echo "GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID" >> .env
echo "GITHUB_CLIENT_SECRET=$GITHUB_CLIENT_SECRET" >> .env
