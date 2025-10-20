# 🚀 E2E DevSecOps Project - Location-Based Service

> End-to-end DevSecOps implementation: From Infrastructure as Code (Terraform) to Kubernetes Deployment and NestJS Application.

## 📖 Table of Contents

- [Overview](#-overview)
- [Project Architecture](#-project-architecture)
- [Quick Start](#-quick-start)
- [Infrastructure (Terraform)](#-infrastructure-terraform)
- [Kubernetes Deployment](#-kubernetes-deployment)
- [Application (NestJS)](#-application-nestjs)
- [Complete Deployment Guide](#-complete-deployment-guide)
- [Cost Estimation](#-cost-estimation)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Overview

- **Infrastructure Layer**: AWS infrastructure provisioning với Terraform
- **Orchestration Layer**: Kubernetes deployment với best practices
- **Application Layer**: Location-Based Service API built với NestJS

### Tech Stack Overview

| Layer                | Technologies                                    |
| -------------------- | ----------------------------------------------- |
| **Infrastructure**   | Terraform, AWS (VPC, EKS, RDS, ElastiCache)    |
| **Orchestration**    | Kubernetes, Helm, AWS Load Balancer Controller |
| **Application**      | NestJS, TypeScript, TypeORM, JWT               |
| **Database**         | MySQL 8.0, Redis                               |
| **Security**         | IAM, Security Groups, Secrets, JWT, Bcrypt     |
| **Monitoring**       | CloudWatch, Kubernetes Metrics Server          |
| **Documentation**    | Swagger/OpenAPI                                |

### Key Features

✅ **Infrastructure as Code**: AWS infrastructure was manage by Terraform  
✅ **Kubernetes Native**: Deployment uses Kubernetes manifests with HPA, health checks  
✅ **Production-Ready**: Multi-AZ, Auto-scaling, Backup, Monitoring  
✅ **Security First**: Private subnets, Encryption at rest, IAM roles, JWT authentication  
✅ **Developer Friendly**: Docker Compose cho local development, Swagger docs  
✅ **Cost Optimized**: Configurable instance types, auto-scaling policies  

---

## 🏗️ Project Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Developer                               │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Terraform   │  │  Kubernetes  │  │   NestJS     │         │
│  │  (Infra)     │  │  (Deploy)    │  │   (App)      │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                        AWS Cloud                                │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    VPC (10.0.0.0/16)                    │   │
│  │                                                         │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │              Public Subnets                      │  │   │
│  │  │  ┌─────────────┐  ┌────────────┐  ┌─────────┐  │  │   │
│  │  │  │   Internet  │  │    NAT     │  │ Bastion │  │  │   │
│  │  │  │   Gateway   │  │  Gateway   │  │  Host   │  │  │   │
│  │  │  └─────────────┘  └────────────┘  └─────────┘  │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                        ▼                               │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │              Private Subnets                     │  │   │
│  │  │                                                  │  │   │
│  │  │  ┌────────────────────────────────────────────┐ │  │   │
│  │  │  │      EKS Cluster (Kubernetes)              │ │  │   │
│  │  │  │  ┌──────────────────────────────────────┐  │ │  │   │
│  │  │  │  │     Location-Based Service Pods      │  │ │  │   │
│  │  │  │  │  - NestJS API (Auto-scaling 1-3)     │  │ │  │   │
│  │  │  │  │  - Swagger Docs                      │  │ │  │   │
│  │  │  │  │  - JWT Authentication                │  │ │  │   │
│  │  │  │  └──────────────────────────────────────┘  │ │  │   │
│  │  │  └────────────────────────────────────────────┘ │  │   │
│  │  │                                                  │  │   │
│  │  │  ┌────────────────┐  ┌──────────────────────┐  │  │   │
│  │  │  │   RDS MySQL    │  │  ElastiCache Redis   │  │  │   │
│  │  │  │  (db.t3.micro) │  │  (cache.t3.micro)    │  │  │   │
│  │  │  │  - Encrypted   │  │  - Encrypted         │  │  │   │
│  │  │  │  - Automated   │  │  - Auto Failover     │  │  │   │
│  │  │  │    Backups     │  │  - Snapshots         │  │  │   │
│  │  │  └────────────────┘  └──────────────────────┘  │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Request Flow

```
┌──────────┐
│  Client  │
└────┬─────┘
     │ HTTPS
     ▼
┌──────────────────────┐
│   AWS ALB/Ingress    │  ← Kubernetes Ingress Controller
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Kubernetes Service  │  ← ClusterIP Service
└──────┬───────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│      Application Pods (1-3)          │
│  ┌────────────────────────────────┐  │
│  │  NestJS API                    │  │
│  │  - JWT Guard                   │  │
│  │  - Validation                  │  │
│  │  - Business Logic              │  │
│  └────────┬───────────────┬───────┘  │
└───────────┼───────────────┼──────────┘
            │               │
    ┌───────▼──────┐   ┌───▼──────────┐
    │  MySQL RDS   │   │ Redis Cache  │
    │  - Stores    │   │ - Sessions   │
    │  - Users     │   │ - Bloom      │
    │  - Locations │   │   Filter     │
    └──────────────┘   └──────────────┘
```

### Data Flow

```
Developer Workflow:
──────────────────
1. Write Code (NestJS)
2. Build Docker Image
3. Deploy to Kubernetes (kubectl apply)
4. Terraform manages Infrastructure
5. Monitor with CloudWatch + K8s Metrics

User Request Flow:
──────────────────
1. Client sends HTTPS request
2. ALB routes to Kubernetes Ingress
3. Ingress routes to Service
4. Service load-balances to Pods
5. Pod processes request:
   - Validates JWT token
   - Checks Redis cache
   - Queries MySQL if needed
   - Returns response
```

---

## 🚀 Quick Start

### Prerequisites

- [Terraform](https://www.terraform.io/downloads.html) >= 1.0
- [AWS CLI](https://aws.amazon.com/cli/) configured
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Docker](https://docs.docker.com/get-docker/)
- [Node.js](https://nodejs.org/) >= 18.x
- AWS Account with appropriate permissions

### 1. Clone Repository

```bash
git clone <repository-url>
cd e2e-devsecops
```

### 2. Deploy Infrastructure

```bash
cd infra-terraform

# Configure variables
cp example.env .env
# Edit .env with your settings

# Initialize and deploy
terraform init
terraform plan -var-file="envs/dev.tfvars"
terraform apply -var-file="envs/dev.tfvars"

# Configure kubectl
aws eks update-kubeconfig --region ap-southeast-1 --name dev-eks-cluster
```

⏱️ **Deployment time**: ~20-25 minutes

### 3. Deploy Application to Kubernetes

```bash
cd ../k8s-simple

# Update ConfigMap with RDS/Redis endpoints
# Edit base/configmap.yaml

# Deploy
kubectl apply -f base/

# Verify
kubectl get pods -n lbs-dev
kubectl get svc -n lbs-dev
kubectl get ingress -n lbs-dev
```

### 4. Access Application

```bash
# Get ALB DNS
kubectl get ingress lbs-ingress -n lbs-dev

# Access Swagger docs
open http://<ALB-DNS>/api/docs
```

---

## 🏗️ Infrastructure (Terraform)

### Overview

Terraform module manage AWS infrastructure

### Components

| Component       | Description                          | Instance Type | Cost/Month |
| --------------- | ------------------------------------ | ------------- | ---------- |
| **VPC**         | Network isolation với public/private subnets | -             | Free       |
| **EKS**         | Kubernetes control plane             | -             | $73        |
| **Worker Nodes**| EC2 instances for K8s workloads      | t3.medium     | $30        |
| **RDS MySQL**   | Managed database with backups        | db.t3.micro   | $15        |
| **ElastiCache** | Redis cluster with replication       | cache.t3.micro| $20        |
| **Bastion**     | Secure SSH access to private resources | t3.micro      | $7         |
| **NAT Gateway** | Internet access for private subnets  | -             | $64        |

**Total**: ~$218/month for development environment

### Directory Structure

```
infra-terraform/
├── main.tf              # Root module
├── variables.tf         # Input variables
├── outputs.tf           # Output values
├── backend.tf           # S3 backend config
├── envs/
│   └── dev.tfvars      # Environment-specific config
└── modules/
    ├── vpc/            # VPC, subnets, routing
    ├── eks/            # EKS cluster, node groups
    ├── rds/            # MySQL database
    ├── redis/          # ElastiCache Redis
    ├── bastion/        # Bastion host
    └── data/           # Data sources
```

### Key Features

✅ **Multi-AZ Deployment**: High availability across availability zones  
✅ **Private Subnets**: All workloads run in private subnets  
✅ **Encryption**: At-rest encryption for RDS and Redis  
✅ **Auto-Scaling**: EKS node groups with auto-scaling  
✅ **Backup**: Automated daily backups for RDS and Redis  
✅ **IAM Roles**: IRSA (IAM Roles for Service Accounts) enabled  
✅ **Security Groups**: Least-privilege network access  

### Configuration

Create `infra-terraform/.env` from `example.env`:

```hcl
# Project
project_name = "e2e-app"
environment  = "dev"
aws_region   = "ap-southeast-1"

# Network
vpc_cidr_block  = "10.0.0.0/16"
azs             = ["ap-southeast-1a", "ap-southeast-1b"]

# EKS
eks_cluster_name          = "dev-eks-cluster"
eks_node_instance_type    = "t3.medium"
eks_node_desired_capacity = 1
eks_node_min_capacity     = 1
eks_node_max_capacity     = 3

# RDS
rds_instance_class  = "db.t3.micro"
rds_database_name   = "devappdb"
rds_master_username = "admin"
rds_master_password = "ChangeMe123!SecurePassword"

# Redis
redis_node_type       = "cache.t3.micro"
redis_num_cache_nodes = 2
```

### Deployment

```bash
cd infra-terraform

# Initialize
terraform init

# Plan
terraform plan -var-file="envs/dev.tfvars"

# Apply
terraform apply -var-file="envs/dev.tfvars"

# Get outputs
terraform output
terraform output eks_cluster_endpoint
terraform output rds_endpoint
terraform output redis_primary_endpoint
```

### Outputs

After deployment, you'll get:

```bash
vpc_id                 = "vpc-xxxxx"
eks_cluster_name       = "dev-eks-cluster"
eks_cluster_endpoint   = "https://xxxxx.eks.amazonaws.com"
rds_endpoint           = "dev-mysql.xxxxx.rds.amazonaws.com:3306"
redis_primary_endpoint = "dev-redis.xxxxx.cache.amazonaws.com:6379"
bastion_public_ip      = "13.xxx.xxx.xxx"
```

### Destroy

```bash
# Destroy all resources
terraform destroy -var-file="envs/dev.tfvars"
```

⚠️ **Warning**: This will delete all data unless you have snapshots enabled.

### Learn More

📚 For detailed documentation, see [Infrastructure Documentation](infra-terraform/README.md)

---

## ☸️ Kubernetes Deployment

### Overview

Kubernetes manifests deploy Location-Based Service to EKS cluster with auto-scaling and health checks.

### Components

| Resource         | Description                                    | Purpose                |
| ---------------- | ---------------------------------------------- | ---------------------- |
| **Namespace**    | `lbs-dev` - Isolated environment               | Resource isolation     |
| **ConfigMap**    | Non-sensitive configuration                    | DB/Redis endpoints     |
| **Secret**       | Sensitive data (passwords, JWT secret)         | Credentials            |
| **Deployment**   | Application pods with init containers          | Run application        |
| **Service**      | ClusterIP service exposing pods                | Internal networking    |
| **Ingress**      | AWS ALB for external access                    | HTTP routing           |
| **HPA**          | Horizontal Pod Autoscaler                      | Auto-scaling (1-3)     |

### Directory Structure

```
k8s-simple/
├── base/
│   ├── namespace.yaml      # Namespace definition
│   ├── configmap.yaml      # App configuration
│   ├── secret.yaml         # Credentials (base64)
│   ├── deployment.yaml     # Application deployment
│   ├── service.yaml        # Service definition
│   ├── ingress.yaml        # ALB ingress
│   └── hpa.yaml           # Auto-scaling config
├── overlays/
│   └── dev/               # Dev-specific overrides
└── DEPLOY-GUIDE.md        # Step-by-step guide
```

### Key Features

✅ **Init Containers**: Wait for RDS/Redis before app starts  
✅ **Health Checks**: Liveness and Readiness probes  
✅ **Resource Limits**: CPU and memory constraints  
✅ **Auto-Scaling**: HPA scales based on CPU (70%) and Memory (80%)  
✅ **Rolling Updates**: Zero-downtime deployments  
✅ **AWS ALB Integration**: Automatic load balancer creation  

### Configuration

#### 1. Update ConfigMap (`base/configmap.yaml`)

```yaml
data:
  # Update with Terraform outputs
  DB_HOST: "<rds_endpoint>"
  REDIS_URL: "redis://<redis_endpoint>:6379"
```

#### 2. Update Secret (`base/secret.yaml`)

```bash
# Generate base64 encoded values
echo -n "admin" | base64
echo -n "your-db-password" | base64
echo -n "$(openssl rand -base64 32)" | base64  # JWT secret

# Update secret.yaml with encoded values
```

#### 3. Build and Push Docker Image

```bash
cd app-nestjs

# Build
docker build -t <your-registry>/location-based-service:dev-latest .

# Push to registry (ECR, Docker Hub, etc.)
docker push <your-registry>/location-based-service:dev-latest
```

#### 4. Update Deployment Image (`base/deployment.yaml`)

```yaml
containers:
  - name: app
    image: <your-registry>/location-based-service:dev-latest
```

### Deployment

```bash
cd k8s-simple

# Install prerequisites (if not already installed)
# 1. Metrics Server for HPA
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# 2. AWS Load Balancer Controller
# Follow guide in DEPLOY-GUIDE.md

# Deploy application
kubectl apply -f base/

# Verify
kubectl get all -n lbs-dev
kubectl get pods -n lbs-dev
kubectl logs -f deployment/lbs-app -n lbs-dev
```

### Accessing the Application

```bash
# Get ALB DNS name
kubectl get ingress lbs-ingress -n lbs-dev

# Output:
# NAME          CLASS   HOSTS                  ADDRESS                                          
# lbs-ingress   alb     api.lbs-dev.local      k8s-lbsdev-xxxxx.elb.amazonaws.com

# Access via ALB DNS
curl http://k8s-lbsdev-xxxxx.elb.amazonaws.com/health

# Or configure DNS and access via domain
curl http://api.lbs-dev.local/api/docs
```

### Monitoring

```bash
# Watch pods
kubectl get pods -n lbs-dev --watch

# View logs
kubectl logs -f deployment/lbs-app -n lbs-dev

# Check HPA status
kubectl get hpa -n lbs-dev
kubectl describe hpa lbs-hpa -n lbs-dev

# Check resource usage
kubectl top pods -n lbs-dev
kubectl top nodes
```

### Scaling

```bash
# Manual scaling
kubectl scale deployment lbs-app -n lbs-dev --replicas=3

# HPA automatic scaling based on:
# - CPU > 70% → Scale up
# - Memory > 80% → Scale up
# - Low usage for 5 min → Scale down

# Test autoscaling
hey -z 2m -c 50 http://api.lbs-dev.local/api/stores
```

### Learn More

📚 [Detailed Kubernetes Documentation](k8s-simple/README.md)  
📖 [Step-by-Step Deployment Guide](k8s-simple/DEPLOY-GUIDE.md)

---

## 💻 Application (NestJS)

### Overview

Location-Based Service Search System - RESTful API built with NestJS, TypeORM, MySQL, and Redis.

### Features

#### 🔐 Authentication & Authorization
- JWT-based authentication
- Refresh token mechanism
- Password reset with email
- Role-based access control

#### 📍 Location-Based Search
- Search stores by user's current location
- Radius-based filtering (km)
- Distance calculation using Haversine formula
- Sort by distance, rating, or name
- Store category filtering

#### ⭐ User Favorites
- Save favorite stores
- Manage favorite lists
- Quick access to preferred locations

#### 🏪 Store Management
- CRUD operations for stores
- Store categorization
- Geolocation data storage
- Advanced search and filtering

#### 🚀 Performance
- Redis caching for frequent queries
- Bloom filter for efficient lookups
- Connection pooling
- Query optimization

### Tech Stack

```
Framework:      NestJS v11
Language:       TypeScript
Database:       MySQL 8.0
ORM:            TypeORM
Cache:          Redis Stack
Auth:           JWT (Passport)
Validation:     class-validator
Documentation:  Swagger/OpenAPI
Testing:        Jest
Container:      Docker
```

### Directory Structure

```
app-nestjs/
├── src/
│   ├── app.module.ts              # Root module
│   ├── main.ts                    # Entry point
│   ├── common/                    # Shared utilities
│   │   ├── constants/            # Constants
│   │   ├── filters/              # Exception filters
│   │   ├── guards/               # Auth guards
│   │   ├── interceptors/         # Logging, transform
│   │   └── utils/                # Helper functions
│   ├── config/                    # Configuration
│   │   ├── config.service.ts     # Environment config
│   │   └── typeorm.config.ts     # Database config
│   ├── migrations/                # Database migrations
│   ├── models/                    # Shared models
│   │   ├── interfaces/           # TypeScript interfaces
│   │   └── pagination/           # Pagination models
│   └── modules/
│       ├── auth/                 # Authentication
│       ├── users/                # User management
│       ├── stores/               # Store management
│       ├── user-current-location/ # Location tracking
│       ├── user-favorites/       # Favorites
│       ├── user-token/           # Token management
│       ├── shared/               # Shared services
│       │   ├── email.service.ts   # Email sender
│       │   ├── redis.service.ts   # Redis client
│       │   └── bloom-filter.service.ts # Bloom filter
│       └── seeder/               # Database seeding
├── test/                          # E2E tests
├── docker-compose.yml             # Local dev setup
├── Dockerfile                     # Production image
└── package.json
```

### API Endpoints

#### Authentication

```bash
POST   /auth/register          # Register new user
POST   /auth/login             # Login and get JWT
POST   /auth/refresh-token     # Refresh access token
POST   /auth/forgot-password   # Request password reset
POST   /auth/reset-password    # Reset password with token
```

#### Stores

```bash
GET    /api/stores             # List all stores (paginated)
GET    /api/stores/:id         # Get store details
POST   /api/stores             # Create store (admin)
PUT    /api/stores/:id         # Update store (admin)
DELETE /api/stores/:id         # Delete store (admin)
POST   /api/stores/search      # Search stores by location
```

#### User Locations

```bash
GET    /api/user-current-location        # Get user location
POST   /api/user-current-location        # Save location
PUT    /api/user-current-location/:id    # Update location
```

#### Favorites

```bash
GET    /api/user-favorites               # List favorites
POST   /api/user-favorites               # Add favorite
DELETE /api/user-favorites/:id           # Remove favorite
```

### Environment Variables

Create `app-nestjs/.env`:

```bash
# Database
DB_TYPE=mysql
DB_HOST=localhost  # or RDS endpoint
DB_PORT=3306
DB_USERNAME=admin
DB_PASSWORD=your-password
DB_NAME=nestjs_dev

# Redis
REDIS_URL=redis://localhost:6379  # or ElastiCache endpoint

# JWT
JWT_SECRET_KEY=your-secret-key-here
JWT_ACCESS_TOKEN_EXPIRES_TIME=15m
JWT_REFRESH_TOKEN_EXPIRES_TIME=7d

# Email (for password reset)
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_USER_NAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# App
BASE_URL=http://localhost:3000
NODE_ENV=development
RUN_SEEDER=false
```

### Local Development

#### Using Docker Compose (Recommended)

```bash
cd app-nestjs

# Start all services (app, MySQL, Redis)
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

Application will be available at:
- API: http://localhost:3000
- Swagger: http://localhost:3000/api/docs

#### Using Node.js

```bash
cd app-nestjs

# Install dependencies
npm install

# Setup database (MySQL and Redis must be running)
npm run migration:run

# Start development server
npm run start:dev

# With database seeding
npm run start:dev:seed
```

### Database Management

```bash
# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Generate new migration
npm run migration:generate --name=AddUserProfile

# Seed database
RUN_SEEDER=true npm run start:dev
```

Default seeded users:
- `admin@example.com` / `password123`
- `user1@example.com` / `password123`

### Testing

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

### Building for Production

```bash
# Build
npm run build

# Run production build
npm run start:prod

# Or use Docker
docker build -t location-based-service:latest .
docker run -p 3000:3000 --env-file .env location-based-service:latest
```

### API Documentation

Interactive Swagger documentation is available at `/api/docs`:

**Local**: http://localhost:3000/api/docs

#### How to use Swagger:

1. Click "Authorize" button
2. Register via `/auth/register` or login via `/auth/login`
3. Copy the `accessToken` from response
4. Paste in Authorization value: `Bearer <your-token>`
5. Now you can test protected endpoints

### Learn More

📚 For detailed documentation, see [Application Documentation](app-nestjs/README.md)

---

## 🚢 Complete Deployment Guide

### Step-by-Step: From Zero to Production

#### Phase 1: Infrastructure Setup (20-25 minutes)

```bash
# 1. Clone repository
git clone <repo-url>
cd e2e-devsecops/infra-terraform

# 2. Configure AWS credentials
aws configure

# 3. Create SSH key for EC2
aws ec2 create-key-pair \
  --key-name terraform \
  --region ap-southeast-1 \
  --query 'KeyMaterial' \
  --output text > ~/.ssh/terraform.pem
chmod 400 ~/.ssh/terraform.pem

# 4. Configure Terraform variables
cp example.env .env
# Edit .env with your settings

# 5. Deploy infrastructure
terraform init
terraform plan -var-file="envs/dev.tfvars"
terraform apply -var-file="envs/dev.tfvars"

# 6. Save outputs
terraform output > ../outputs.txt
terraform output eks_cluster_endpoint
terraform output rds_endpoint
terraform output redis_primary_endpoint
```

#### Phase 2: Configure Kubernetes (5 minutes)

```bash
# 1. Configure kubectl
aws eks update-kubeconfig \
  --region ap-southeast-1 \
  --name dev-eks-cluster

# 2. Verify connection
kubectl get nodes
kubectl cluster-info

# 3. Install Metrics Server (for HPA)
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# 4. Install AWS Load Balancer Controller
# Follow detailed guide in k8s-simple/DEPLOY-GUIDE.md
```

#### Phase 3: Build and Push Application (10 minutes)

```bash
cd ../app-nestjs

# 1. Build Docker image
docker build -t <your-registry>/location-based-service:v1.0.0 .

# 2. Test locally (optional)
docker-compose up -d
curl http://localhost:3000/health

# 3. Push to registry
# For AWS ECR:
aws ecr get-login-password --region ap-southeast-1 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com

docker tag location-based-service:v1.0.0 \
  <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com/lbs:v1.0.0

docker push <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com/lbs:v1.0.0

# Or Docker Hub:
docker push <your-dockerhub-username>/location-based-service:v1.0.0
```

#### Phase 4: Deploy to Kubernetes (5 minutes)

```bash
cd ../k8s-simple

# 1. Update ConfigMap with Terraform outputs
# Edit base/configmap.yaml:
#   DB_HOST: "<rds_endpoint_from_terraform>"
#   REDIS_URL: "redis://<redis_endpoint_from_terraform>:6379"

# 2. Create and encode secrets
echo -n "admin" | base64                    # DB username
echo -n "your-db-password" | base64         # DB password
echo -n "$(openssl rand -base64 32)" | base64  # JWT secret

# Edit base/secret.yaml with encoded values

# 3. Update deployment image
# Edit base/deployment.yaml:
#   image: <your-registry>/location-based-service:v1.0.0

# 4. Deploy
kubectl apply -f base/

# 5. Verify deployment
kubectl get pods -n lbs-dev
kubectl get svc -n lbs-dev
kubectl get ingress -n lbs-dev

# 6. Wait for ALB to be provisioned (2-3 minutes)
kubectl get ingress lbs-ingress -n lbs-dev --watch

# 7. Get ALB DNS
ALB_DNS=$(kubectl get ingress lbs-ingress -n lbs-dev \
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
echo "Application URL: http://$ALB_DNS"
echo "Swagger Docs: http://$ALB_DNS/api/docs"
```

#### Phase 5: Verify and Test (5 minutes)

```bash
# 1. Check pod logs
kubectl logs -f deployment/lbs-app -n lbs-dev

# 2. Test health endpoint
curl http://$ALB_DNS/health

# 3. Access Swagger UI
open http://$ALB_DNS/api/docs

# 4. Test API
# Register user
curl -X POST http://$ALB_DNS/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'

# Login
curl -X POST http://$ALB_DNS/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Use the accessToken for subsequent requests
```

#### Phase 6: Configure DNS (Optional)

```bash
# Create Route53 record (or use your DNS provider)
aws route53 change-resource-record-sets \
  --hosted-zone-id <your-zone-id> \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "api.yourdomain.com",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [{"Value": "'$ALB_DNS'"}]
      }
    }]
  }'

# Now you can access via custom domain
open https://api.yourdomain.com/api/docs
```

### Production Checklist

Before going to production, ensure:

- [ ] Change all default passwords
- [ ] Enable Multi-AZ for RDS and Redis
- [ ] Configure HTTPS/TLS on ALB
- [ ] Set up CloudWatch alarms
- [ ] Enable EKS control plane logging
- [ ] Configure backup retention policies
- [ ] Set up monitoring and alerting
- [ ] Review security group rules
- [ ] Enable WAF on ALB (optional)
- [ ] Configure custom domain with Route53
- [ ] Set up CI/CD pipeline
- [ ] Document disaster recovery procedures

---

## 💰 Cost Estimation

### Development Environment

| Resource          | Type           | Quantity | Cost/Month | Notes                    |
| ----------------- | -------------- | -------- | ---------- | ------------------------ |
| EKS Control Plane | -              | 1        | $73        | Fixed cost               |
| EC2 Worker Nodes  | t3.medium      | 1        | $30        | On-demand                |
| RDS MySQL         | db.t3.micro    | 1        | $15        | Single-AZ                |
| ElastiCache Redis | cache.t3.micro | 2 nodes  | $20        | Multi-AZ replication     |
| Bastion Host      | t3.micro       | 1        | $7         | 24/7 running             |
| NAT Gateway       | -              | 2        | $64        | 2 AZs, $32 each          |
| ALB               | -              | 1        | $16        | Application Load Balancer|
| Data Transfer     | -              | ~100GB   | $9         | Outbound data            |
| **Total**         |                |          | **~$234**  | **~$8/day**              |

### Production Environment

| Resource           | Type           | Quantity | Cost/Month | Notes                    |
| ------------------ | -------------- | -------- | ---------- | ------------------------ |
| EKS Control Plane  | -              | 1        | $73        | Fixed cost               |
| EC2 Worker Nodes   | t3.large       | 3        | $180       | Auto-scaling 2-5         |
| RDS MySQL Multi-AZ | db.t3.small    | 1        | $60        | Multi-AZ, 100GB storage  |
| ElastiCache Multi-AZ| cache.t3.small | 3 nodes  | $75        | Multi-AZ cluster         |
| Bastion Host       | t3.small       | 1        | $15        | 24/7 running             |
| NAT Gateway        | -              | 2        | $64        | 2 AZs                    |
| ALB                | -              | 1        | $16        | With WAF +$5             |
| Data Transfer      | -              | ~500GB   | $45        | Outbound data            |
| CloudWatch Logs    | -              | ~50GB    | $3         | Log retention            |
| **Total**          |                |          | **~$531**  | **~$18/day**             |

### Cost Optimization Tips

💡 **Development**:
- Destroy infrastructure when not in use: `terraform destroy`
- Use single NAT Gateway instead of 2 (save $32/month)
- Stop/start EKS worker nodes during off-hours
- Use t3.micro for all services

💡 **Production**:
- Use Reserved Instances (save up to 72%)
- Use Savings Plans for compute
- Enable auto-scaling to match demand
- Use Spot Instances for non-critical workloads
- Optimize RDS storage (use gp3 instead of gp2)
- Set up CloudWatch alarms for cost anomalies

💡 **Both**:
- Delete unused EBS volumes
- Remove old snapshots
- Clean up unused Elastic IPs
- Use S3 Lifecycle policies for logs
- Monitor with AWS Cost Explorer

### Monthly Cost Breakdown

```
Development ($234/month):
├── Compute (EKS + EC2)      $103 (44%)
├── Data (RDS + Redis)       $35  (15%)
├── Networking (NAT + ALB)   $80  (34%)
└── Other (Bastion + Data)   $16  (7%)

Production ($531/month):
├── Compute (EKS + EC2)      $253 (48%)
├── Data (RDS + Redis)       $135 (25%)
├── Networking (NAT + ALB)   $80  (15%)
└── Other (Bastion + Data)   $63  (12%)
```

---

## 🔧 Troubleshooting

### Infrastructure Issues

#### Terraform Apply Fails

```bash
# Clear cache and retry
rm -rf .terraform .terraform.lock.hcl
terraform init
terraform apply -var-file="envs/dev.tfvars"

# Check AWS credentials
aws sts get-caller-identity

# Verify service quotas
aws service-quotas list-service-quotas \
  --service-code ec2 \
  --query 'Quotas[?QuotaName==`EC2-VPC Elastic IPs`]'
```

#### Cannot Connect to EKS

```bash
# Update kubeconfig
aws eks update-kubeconfig \
  --region ap-southeast-1 \
  --name dev-eks-cluster

# Verify cluster status
aws eks describe-cluster \
  --name dev-eks-cluster \
  --region ap-southeast-1

# Check IAM permissions
aws sts get-caller-identity
```

#### Nodes Not Joining Cluster

```bash
# Check node group status
aws eks describe-nodegroup \
  --cluster-name dev-eks-cluster \
  --nodegroup-name <nodegroup-name>

# Check VPC configuration
# Ensure private subnets have NAT Gateway route

# View node logs (from bastion)
ssh -i ~/.ssh/terraform.pem ec2-user@<node-ip>
sudo journalctl -u kubelet -f
```

### Kubernetes Issues

#### Pods Stuck in Pending

```bash
# Check pod events
kubectl describe pod <pod-name> -n lbs-dev

# Common causes:
# 1. Insufficient resources
kubectl get nodes
kubectl describe node <node-name>

# 2. Image pull errors
kubectl describe pod <pod-name> -n lbs-dev | grep -A 5 Events

# 3. PVC issues
kubectl get pvc -n lbs-dev
```

#### Pods CrashLoopBackOff

```bash
# View logs
kubectl logs <pod-name> -n lbs-dev
kubectl logs <pod-name> -n lbs-dev --previous

# Check init containers
kubectl logs <pod-name> -n lbs-dev -c wait-for-rds
kubectl logs <pod-name> -n lbs-dev -c wait-for-redis

# Common causes:
# 1. Wrong DB credentials
# 2. Network connectivity to RDS/Redis
# 3. Application error on startup
```

#### Cannot Access ALB

```bash
# Check ingress status
kubectl get ingress -n lbs-dev
kubectl describe ingress lbs-ingress -n lbs-dev

# Check AWS Load Balancer Controller
kubectl get deployment -n kube-system aws-load-balancer-controller
kubectl logs -n kube-system deployment/aws-load-balancer-controller

# Check ALB in AWS Console
aws elbv2 describe-load-balancers \
  --query 'LoadBalancers[?contains(LoadBalancerName, `k8s-lbsdev`)]'

# Test target health
aws elbv2 describe-target-health \
  --target-group-arn <target-group-arn>
```

#### HPA Not Scaling

```bash
# Check HPA status
kubectl get hpa -n lbs-dev
kubectl describe hpa lbs-hpa -n lbs-dev

# Check Metrics Server
kubectl get deployment metrics-server -n kube-system
kubectl logs -n kube-system deployment/metrics-server

# Check pod metrics
kubectl top pods -n lbs-dev
kubectl top nodes

# If metrics unavailable, reinstall Metrics Server
kubectl delete -n kube-system deployment/metrics-server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

### Application Issues

#### Cannot Connect to Database

```bash
# Test from within cluster
kubectl run -it --rm debug --image=mysql:8.0 --restart=Never -n lbs-dev -- \
  mysql -h <rds-endpoint> -u admin -p

# Check security groups
# Ensure EKS security group can access RDS security group on port 3306

# Check RDS status
aws rds describe-db-instances \
  --db-instance-identifier dev-lbs-mysql
```

#### Cannot Connect to Redis

```bash
# Test from within cluster
kubectl run -it --rm debug --image=redis:7 --restart=Never -n lbs-dev -- \
  redis-cli -h <redis-endpoint> -p 6379 ping

# Check ElastiCache status
aws elasticache describe-cache-clusters \
  --cache-cluster-id dev-lbs-redis \
  --show-cache-node-info
```

#### 500 Internal Server Error

```bash
# Check application logs
kubectl logs -f deployment/lbs-app -n lbs-dev

# Check environment variables
kubectl exec -it deployment/lbs-app -n lbs-dev -- env | grep DB

# Check ConfigMap and Secret
kubectl get configmap app-config -n lbs-dev -o yaml
kubectl get secret app-secret -n lbs-dev -o yaml
```

### Performance Issues

#### High CPU Usage

```bash
# Check current usage
kubectl top pods -n lbs-dev
kubectl top nodes

# Check HPA metrics
kubectl get hpa -n lbs-dev --watch

# Scale manually if needed
kubectl scale deployment lbs-app -n lbs-dev --replicas=3

# Check application profiling
kubectl exec -it deployment/lbs-app -n lbs-dev -- npm run profile
```

#### Slow Database Queries

```bash
# Enable slow query log in RDS
aws rds modify-db-instance \
  --db-instance-identifier dev-lbs-mysql \
  --cloudwatch-logs-export-configuration '{"EnableLogTypes":["slowquery"]}'

# Check CloudWatch Logs
aws logs tail /aws/rds/instance/dev-lbs-mysql/slowquery --follow

# Check connection pool
kubectl logs deployment/lbs-app -n lbs-dev | grep "connection pool"
```

### Getting Help

1. **AWS Support**: https://console.aws.amazon.com/support
2. **Kubernetes Docs**: https://kubernetes.io/docs
3. **NestJS Docs**: https://docs.nestjs.com
4. **GitHub Issues**: Create an issue in this repository

---

## 📚 Additional Resources

### Documentation

- [AWS EKS Best Practices](https://aws.github.io/aws-eks-best-practices/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Kubernetes Documentation](https://kubernetes.io/docs/home/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)

### Tutorials

- [EKS Workshop](https://www.eksworkshop.com/)
- [Terraform AWS Examples](https://github.com/terraform-aws-modules)
- [NestJS Samples](https://github.com/nestjs/nest/tree/master/sample)

### Tools

- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [Terraform Cheat Sheet](https://acloudguru.com/blog/engineering/the-ultimate-terraform-cheatsheet)
- [Docker Compose CLI](https://docs.docker.com/compose/reference/)

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

### Development Workflow

1. Fork the repository
2. Create a feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Make your changes
4. Test thoroughly
   ```bash
   # Test Terraform
   cd infra-terraform
   terraform validate
   terraform fmt -recursive
   
   # Test Kubernetes
   kubectl apply -f k8s-simple/base/ --dry-run=client
   
   # Test Application
   cd app-nestjs
   npm test
   npm run test:e2e
   ```
5. Commit with meaningful messages
   ```bash
   git commit -m "feat: add amazing feature"
   ```
6. Push to your fork
   ```bash
   git push origin feature/amazing-feature
   ```
7. Open a Pull Request

### Coding Standards

- **Terraform**: Use `terraform fmt` before committing
- **Kubernetes**: Follow [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)
- **TypeScript**: Follow [NestJS Style Guide](https://docs.nestjs.com/techniques/logger)
- **Commits**: Follow [Conventional Commits](https://www.conventionalcommits.org/)

### Pull Request Checklist

- [ ] Code follows project conventions
- [ ] All tests pass
- [ ] Documentation updated
- [ ] CHANGELOG updated (if applicable)
- [ ] No secrets in code
- [ ] Terraform plan succeeds
- [ ] Kubernetes manifests validate

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Your Name** - *Initial work* - [GitHub](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- AWS for excellent cloud services
- Terraform for infrastructure as code
- Kubernetes community for orchestration platform
- NestJS team for amazing framework
- All contributors to this project

---

## 📞 Support

For questions and support:

- 📧 Email: your-email@example.com
- 💬 GitHub Issues: [Create an issue](https://github.com/yourrepo/issues)
- 📖 Documentation: See individual component READMEs
- 🐛 Bug Reports: Use GitHub Issues with bug template

---

**Made with ❤️ for DevSecOps**

*Last Updated: October 2025*
