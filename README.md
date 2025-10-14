# E2E DevSecOps Infrastructure

> End-to-end DevSecOps infrastructure on AWS using Terraform, featuring EKS, RDS MySQL, Redis, and comprehensive security configurations.

## 🏗️ Architecture Overview

This project provisions a complete, production-ready infrastructure on AWS including:

- **VPC**: Multi-AZ Virtual Private Cloud with public and private subnets
- **EKS**: Elastic Kubernetes Service cluster with managed node groups
- **RDS MySQL**: Managed relational database with encryption and automated backups
- **Redis**: ElastiCache Redis cluster for caching and session management
- **Security**: Private subnets, security groups, IAM roles, and encryption

## 📋 Table of Contents

- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [Deployment](#-deployment)
- [Outputs](#-outputs)
- [Cost Estimation](#-cost-estimation)
- [Security](#-security)
- [Monitoring](#-monitoring)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

## ✨ Features

### Networking

- ✅ VPC with configurable CIDR blocks
- ✅ Multi-AZ deployment (2 availability zones)
- ✅ Public and private subnets
- ✅ NAT Gateways for private subnet internet access
- ✅ Internet Gateway for public access

### Kubernetes (EKS)

- ✅ EKS 1.33 cluster with managed control plane
- ✅ Managed node groups with auto-scaling
- ✅ IRSA (IAM Roles for Service Accounts) enabled
- ✅ AWS Load Balancer Controller ready
- ✅ Essential addons: CoreDNS, kube-proxy, VPC CNI, Pod Identity Agent
- ✅ Private worker nodes with SSH access
- ✅ ON_DEMAND capacity for production reliability

### Database (RDS MySQL)

- ✅ MySQL 8.0.35 with automated storage scaling
- ✅ Encryption at rest
- ✅ Automated daily backups (7-day retention)
- ✅ CloudWatch logs integration
- ✅ Private subnet deployment
- ✅ Security group with VPC-only access
- ✅ Optional Multi-AZ for high availability

### Cache (Redis)

- ✅ ElastiCache Redis 7.0 with replication
- ✅ Automatic failover support
- ✅ Encryption at rest
- ✅ Automated snapshots (5-day retention)
- ✅ Private subnet deployment
- ✅ Security group with VPC-only access
- ✅ Optional encryption in transit

### Security

- ✅ Private subnets for all workloads (EKS, RDS, Redis)
- ✅ Security groups with least-privilege access
- ✅ Encryption at rest for all data stores
- ✅ IAM roles and policies with minimal permissions
- ✅ IRSA for Kubernetes pod-level IAM
- ✅ VPC flow logs ready

## 🔧 Prerequisites

### Required Tools

- [Terraform](https://www.terraform.io/downloads.html) >= 1.0
- [AWS CLI](https://aws.amazon.com/cli/) configured with credentials
- [kubectl](https://kubernetes.io/docs/tasks/tools/) for EKS management
- [Helm](https://helm.sh/) (optional, for installing charts)

### AWS Requirements

- AWS Account with appropriate permissions
- SSH key pair named `terraform` in `ap-southeast-1` region
- Sufficient service quotas for:
  - 1 VPC
  - 1 EKS cluster
  - 1 RDS instance
  - 1 ElastiCache cluster
  - 2 NAT Gateways
  - 2 Elastic IPs

### Create SSH Key (if not exists)

```bash
aws ec2 create-key-pair \
  --key-name terraform \
  --region ap-southeast-1 \
  --query 'KeyMaterial' \
  --output text > ~/.ssh/terraform.pem

chmod 400 ~/.ssh/terraform.pem
```

## 🚀 Quick Start

### 1. Clone and Navigate

```bash
git clone <repository-url>
cd e2e-devsecops/terraform
```

### 2. Configure Variables

Copy and edit the environment configuration:

```bash
cp envs/dev.tfvars envs/prod.tfvars  # Create your own environment
```

Edit `envs/dev.tfvars` with your settings:

```hcl
# Project Configuration
project_name = "e2e-app"
environment  = "dev"

# RDS Password (REQUIRED - change this!)
rds_master_password = "ChangeMe123!SecurePassword"
```

### 3. Initialize Terraform

```bash
terraform init
```

### 4. Plan Deployment

```bash
terraform plan -var-file="envs/dev.tfvars"
```

### 5. Deploy Infrastructure

```bash
terraform apply -var-file="envs/dev.tfvars"
```

⏱️ **Deployment Time**: ~20-25 minutes

### 6. Configure kubectl

```bash
aws eks update-kubeconfig \
  --region ap-southeast-1 \
  --name dev-eks-cluster
```

### 7. Verify Deployment

```bash
# Check Terraform outputs
terraform output

# Verify EKS cluster
kubectl get nodes
kubectl get pods -A

# Test database connectivity (from within VPC)
mysql -h $(terraform output -raw rds_address) -u admin -p

# Test Redis connectivity (from within VPC)
redis-cli -h $(terraform output -raw redis_primary_endpoint) -p 6379
```

## 📁 Project Structure

```
e2e-devsecops/
├── README.md                    # This file
├── terraform/
│   ├── main.tf                  # Root module - orchestrates all modules
│   ├── variables.tf             # Input variables
│   ├── outputs.tf               # Output values
│   ├── backend.tf               # Terraform backend configuration
│   ├── terraform.tfvars         # Basic project configuration
│   │
│   ├── envs/
│   │   └── dev.tfvars          # Environment-specific configuration
│   │
│   └── modules/
│       ├── vpc/                # VPC module
│       │   ├── main.tf
│       │   ├── variables.tf
│       │   └── outputs.tf
│       │
│       ├── eks/                # EKS cluster module
│       │   ├── main.tf
│       │   ├── iam.tf          # IAM roles and policies
│       │   ├── variables.tf
│       │   └── outputs.tf
│       │
│       ├── rds/                # RDS MySQL module
│       │   ├── main.tf
│       │   ├── variables.tf
│       │   └── outputs.tf
│       │
│       ├── redis/              # Redis ElastiCache module
│       │   ├── main.tf
│       │   ├── variables.tf
│       │   └── outputs.tf
│       │
│       └── data/               # Data sources
│           ├── main.tf
│           ├── variables.tf
│           └── outputs.tf
```

## ⚙️ Configuration

### Key Variables

#### Project Settings

```hcl
project_name = "e2e-app"        # Project identifier
environment  = "dev"            # Environment (dev/staging/prod)
aws_region   = "ap-southeast-1" # AWS region
```

#### Network Configuration

```hcl
vpc_cidr_block  = "10.0.0.0/16"
public_subnets  = ["10.0.1.0/24", "10.0.2.0/24"]
private_subnets = ["10.0.4.0/24", "10.0.5.0/24"]
azs             = ["ap-southeast-1a", "ap-southeast-1b"]
```

#### EKS Configuration

```hcl
eks_cluster_name          = "dev-eks-cluster"
eks_node_instance_type    = "t3.medium"
eks_node_ami_type         = "AL2023_x86_64_STANDARD"
eks_node_desired_capacity = 1
eks_node_min_capacity     = 1
eks_node_max_capacity     = 3
```

#### RDS Configuration

```hcl
rds_instance_class    = "db.t3.micro"
rds_database_name     = "devappdb"
rds_master_username   = "admin"
rds_master_password   = "SecurePassword123!"  # Use Secrets Manager in prod
rds_multi_az          = false  # Set true for production
```

#### Redis Configuration

```hcl
redis_node_type                  = "cache.t3.micro"
redis_num_cache_nodes            = 2
redis_automatic_failover_enabled = true
redis_multi_az_enabled           = false  # Set true for production
```

See `terraform/envs/dev.tfvars` for all available options.

## 🚢 Deployment

### Deploy Everything

```bash
cd terraform
terraform apply -var-file="envs/dev.tfvars" -auto-approve
```

### Deploy Specific Modules

```bash
# VPC only
terraform apply -var-file="envs/dev.tfvars" -target=module.vpc

# EKS only (requires VPC)
terraform apply -var-file="envs/dev.tfvars" -target=module.eks

# RDS only (requires VPC)
terraform apply -var-file="envs/dev.tfvars" -target=module.rds

# Redis only (requires VPC)
terraform apply -var-file="envs/dev.tfvars" -target=module.redis
```

### Destroy Infrastructure

```bash
# Destroy everything
terraform destroy -var-file="envs/dev.tfvars"

# Destroy specific module
terraform destroy -var-file="envs/dev.tfvars" -target=module.eks
```

⚠️ **Warning**: Destroying RDS/Redis will delete all data unless snapshots are enabled.

## 📤 Outputs

After deployment, retrieve connection information:

```bash
# All outputs
terraform output

# Specific outputs
terraform output vpc_id
terraform output eks_cluster_endpoint
terraform output rds_endpoint
terraform output redis_primary_endpoint
```

### Available Outputs

| Output                   | Description                   |
| ------------------------ | ----------------------------- |
| `vpc_id`                 | VPC identifier                |
| `private_subnet_ids`     | Private subnet IDs            |
| `public_subnet_ids`      | Public subnet IDs             |
| `eks_cluster_name`       | EKS cluster name              |
| `eks_cluster_endpoint`   | EKS API server endpoint       |
| `rds_endpoint`           | RDS MySQL connection endpoint |
| `rds_address`            | RDS MySQL hostname            |
| `rds_port`               | RDS MySQL port (3306)         |
| `rds_database_name`      | Database name                 |
| `redis_primary_endpoint` | Redis write endpoint          |
| `redis_reader_endpoint`  | Redis read endpoint           |
| `redis_port`             | Redis port (6379)             |

## 💰 Cost Estimation

### Development Environment (~$5/day)

| Resource          | Type           | Quantity | Monthly Cost    |
| ----------------- | -------------- | -------- | --------------- |
| EKS Control Plane | -              | 1        | $73             |
| EC2 Worker Nodes  | t3.medium      | 1        | $30             |
| RDS MySQL         | db.t3.micro    | 1        | $15             |
| Redis             | cache.t3.micro | 2 nodes  | $20             |
| NAT Gateway       | -              | 2        | $64             |
| Data Transfer     | -              | ~100GB   | $9              |
| **Total**         |                |          | **~$211/month** |

### Production Environment (~$15/day)

| Resource           | Type           | Quantity | Monthly Cost    |
| ------------------ | -------------- | -------- | --------------- |
| EKS Control Plane  | -              | 1        | $73             |
| EC2 Worker Nodes   | t3.large       | 3        | $180            |
| RDS MySQL Multi-AZ | db.t3.small    | 1        | $60             |
| Redis Multi-AZ     | cache.t3.small | 3 nodes  | $75             |
| NAT Gateway        | -              | 2        | $64             |
| Data Transfer      | -              | ~500GB   | $45             |
| **Total**          |                |          | **~$497/month** |

💡 **Cost Saving Tips**:

- Destroy infrastructure when not in use
- Use Reserved Instances for long-term workloads (save up to 72%)
- Consider single NAT Gateway for dev environments
- Use Spot instances for non-critical workloads
- Enable auto-scaling to optimize resource usage

## 🔐 Security

### Network Security

- ✅ Private subnets for all compute and data resources
- ✅ Security groups with least-privilege rules
- ✅ No public access to databases or cache
- ✅ VPC endpoints available for AWS services

### Data Security

- ✅ Encryption at rest for RDS and Redis
- ✅ Encryption in transit (TLS) for all connections
- ✅ Automated backups with configurable retention
- ✅ No hardcoded credentials (use environment variables)

### Access Control

- ✅ IAM roles with minimal required permissions
- ✅ IRSA for Kubernetes pod-level IAM
- ✅ SSH access only via specified key pairs
- ✅ EKS cluster creator automatically gets admin access

### Best Practices

1. **Store secrets securely**:

   ```bash
   # Use AWS Secrets Manager
   aws secretsmanager create-secret \
     --name /e2e-app/prod/rds-password \
     --secret-string "YourSecurePassword"
   ```

2. **Enable MFA** for AWS console access

3. **Restrict API access**:

   ```hcl
   # In terraform/modules/eks/main.tf
   endpoint_public_access_cidrs = ["YOUR_IP/32"]
   ```

4. **Enable CloudTrail** for audit logging

5. **Regular security updates**:
   ```bash
   # Keep Terraform and providers updated
   terraform init -upgrade
   ```

## 📊 Monitoring

### CloudWatch Metrics

**EKS Monitoring**:

```bash
# Enable Container Insights
aws eks update-cluster-config \
  --name dev-eks-cluster \
  --logging '{"clusterLogging":[{"types":["api","audit","authenticator","controllerManager","scheduler"],"enabled":true}]}'
```

**RDS Monitoring**:

- CloudWatch logs: Errors, General, Slow Queries
- Automated snapshots: Daily backups
- Performance Insights: Available for monitoring

**Redis Monitoring**:

- CloudWatch metrics: CPU, Memory, Connections
- Automated snapshots: Daily backups

### Key Metrics to Monitor

| Service   | Metrics                                                     |
| --------- | ----------------------------------------------------------- |
| **EKS**   | Node CPU/Memory, Pod count, API latency                     |
| **RDS**   | CPU utilization, Connections, Storage, Query latency        |
| **Redis** | CPU utilization, Memory usage, Cache hits/misses, Evictions |
| **VPC**   | NAT Gateway traffic, VPC Flow Logs                          |

## 🔧 Troubleshooting

### Common Issues

#### 1. Terraform Init Fails

```bash
# Clear cache and reinitialize
rm -rf .terraform .terraform.lock.hcl
terraform init
```

#### 2. Cannot Connect to EKS

```bash
# Update kubeconfig
aws eks update-kubeconfig --region ap-southeast-1 --name dev-eks-cluster

# Verify AWS credentials
aws sts get-caller-identity

# Check cluster status
aws eks describe-cluster --name dev-eks-cluster --region ap-southeast-1
```

#### 3. Cannot Connect to RDS/Redis

- Ensure you're connecting from within the VPC
- Check security group rules
- Verify the resource is in "available" state
- Check credentials

#### 4. Nodes Not Joining EKS

```bash
# Check node group status
aws eks describe-nodegroup \
  --cluster-name dev-eks-cluster \
  --nodegroup-name <nodegroup-name> \
  --region ap-southeast-1

# Check VPC and subnet configuration
# Verify NAT Gateway is running
```

#### 5. High Costs

- Review running resources: `aws resourcegroupstaggingapi get-resources`
- Check for unused Elastic IPs
- Verify NAT Gateway traffic
- Consider downsizing instance types

### Getting Help

1. Check Terraform documentation: [terraform.io/docs](https://www.terraform.io/docs)
2. AWS EKS documentation: [docs.aws.amazon.com/eks](https://docs.aws.amazon.com/eks/)
3. Review CloudWatch logs for error messages
4. Check Terraform state: `terraform state list`

## 📚 Additional Documentation

- **AWS EKS Best Practices**: [aws.github.io/aws-eks-best-practices](https://aws.github.io/aws-eks-best-practices/)
- **Terraform AWS Provider**: [registry.terraform.io/providers/hashicorp/aws](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- **Kubernetes Documentation**: [kubernetes.io/docs](https://kubernetes.io/docs/home/)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Run `terraform fmt` before committing
- Run `terraform validate` to check syntax
- Test changes in a separate environment
- Update documentation for any configuration changes
- Follow security best practices

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- AWS for excellent cloud services
- Terraform for infrastructure as code
- The Kubernetes community
- All contributors to this project

## 📞 Support

For issues and questions:

- Open an issue on GitHub
- Contact the DevOps team
- Check existing documentation

---

**Made with ❤️ for DevSecOps**

Last Updated: October 2025
