variable "project_name" {
  description = "The name of the project"
  type        = string
}

variable "environment" {
  description = "The environment for the deployment (e.g., dev, staging, prod)"
  type        = string
}

variable "vpc_cidr_block" {
  type        = string
  description = "The CIDR block for the VPC"
}

variable "private_subnets" {
  type        = list(string)
  description = "List of CIDR blocks for private subnets"
}

variable "public_subnets" {
  type        = list(string)
  description = "List of CIDR blocks for public subnets"
}

variable "aws_region" {
  description = "The AWS region where the resources will be deployed"
  type        = string
  default     = "ap-southeast-1"
}

variable "azs" {
  description = "List of availability zones to use for the VPC"
  type        = list(string)
  default     = ["ap-southeast-1a", "ap-southeast-1b"]
}

variable "jenkins_instance_type" {
  description = "The instance type for the Jenkins server"
  type        = string
  default     = "t3.medium"
}

variable "jenkins_instance_key_name" {
  description = "The key name for the Jenkins instance"
  type        = string
}

variable "eks_node_instance_type" {
  description = "The instance type for the EKS worker nodes"
  type        = string
  default     = "t3.medium"
}
variable "eks_node_ami_type" {
  description = "The AMI type for the EKS worker nodes"
  type        = string
  default     = "AL2_x86_64"
}
variable "eks_key_name" {
  description = "The name of the key pair to use for SSH access to the EKS worker nodes"
  type        = string
}
variable "eks_enable_irsa" {
  description = "Enable IAM Roles for Service Accounts (IRSA) for the EKS cluster"
  type        = bool
  default     = true
}
variable "eks_cluster_name" {
  description = "The name of the EKS cluster"
  type        = string
  default     = "my-eks-cluster"
}
variable "eks_node_desired_capacity" {
  description = "The desired number of worker nodes in the EKS node group"
  type        = number
  default     = 2
}
variable "eks_node_max_capacity" {
  description = "The maximum number of worker nodes in the EKS node group"
  type        = number
  default     = 5
}
variable "eks_node_min_capacity" {
  description = "The minimum number of worker nodes in the EKS node group"
  type        = number
  default     = 1
}

# RDS MySQL Variables
variable "rds_engine_version" {
  description = "MySQL engine version"
  type        = string
  default     = "8.0.35"
}

variable "rds_instance_class" {
  description = "The instance class for RDS"
  type        = string
  default     = "db.t3.micro"
}

variable "rds_allocated_storage" {
  description = "The allocated storage in gigabytes"
  type        = number
  default     = 20
}

variable "rds_max_allocated_storage" {
  description = "The upper limit to which Amazon RDS can automatically scale the storage"
  type        = number
  default     = 100
}

variable "rds_storage_type" {
  description = "The storage type for RDS"
  type        = string
  default     = "gp3"
}

variable "rds_storage_encrypted" {
  description = "Enable storage encryption"
  type        = bool
  default     = true
}

variable "rds_database_name" {
  description = "The name of the database to create"
  type        = string
  default     = "myappdb"
}

variable "rds_master_username" {
  description = "Username for the master DB user"
  type        = string
  default     = "admin"
}

variable "rds_master_password" {
  description = "Password for the master DB user"
  type        = string
  sensitive   = true
}

variable "rds_multi_az" {
  description = "Enable Multi-AZ deployment"
  type        = bool
  default     = false
}

variable "rds_backup_retention_period" {
  description = "The number of days to retain backups"
  type        = number
  default     = 7
}

variable "rds_backup_window" {
  description = "The daily time range during which automated backups are created"
  type        = string
  default     = "03:00-04:00"
}

variable "rds_maintenance_window" {
  description = "The window to perform maintenance in"
  type        = string
  default     = "Mon:04:00-Mon:05:00"
}

variable "rds_skip_final_snapshot" {
  description = "Determines whether a final DB snapshot is created before deletion"
  type        = bool
  default     = true
}

# Redis Variables
variable "redis_engine_version" {
  description = "Redis engine version"
  type        = string
  default     = "7.0"
}

variable "redis_family_version" {
  description = "Redis family version for parameter group"
  type        = string
  default     = "7"
}

variable "redis_node_type" {
  description = "The instance type for Redis nodes"
  type        = string
  default     = "cache.t3.micro"
}

variable "redis_num_cache_nodes" {
  description = "The number of cache nodes in the replication group"
  type        = number
  default     = 2
}

variable "redis_automatic_failover_enabled" {
  description = "Enable automatic failover"
  type        = bool
  default     = true
}

variable "redis_multi_az_enabled" {
  description = "Enable Multi-AZ deployment"
  type        = bool
  default     = false
}

variable "redis_at_rest_encryption_enabled" {
  description = "Enable encryption at rest"
  type        = bool
  default     = true
}

variable "redis_transit_encryption_enabled" {
  description = "Enable encryption in transit"
  type        = bool
  default     = false
}

variable "redis_auth_token_enabled" {
  description = "Enable Redis AUTH token (requires transit encryption)"
  type        = bool
  default     = false
}

variable "redis_auth_token" {
  description = "Password used to access Redis (requires transit encryption enabled)"
  type        = string
  default     = null
  sensitive   = true
}

variable "redis_snapshot_retention_limit" {
  description = "The number of days to retain automatic snapshots"
  type        = number
  default     = 5
}

variable "redis_snapshot_window" {
  description = "The daily time range during which automated snapshots are created"
  type        = string
  default     = "03:00-05:00"
}

variable "redis_maintenance_window" {
  description = "The weekly time range for system maintenance"
  type        = string
  default     = "sun:05:00-sun:07:00"
}
