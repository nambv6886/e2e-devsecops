# VPC Outputs
output "vpc_id" {
  description = "The ID of the VPC"
  value       = module.vpc.vpc_id
}

output "private_subnet_ids" {
  description = "List of IDs of private subnets"
  value       = module.vpc.private_subnets
}

output "public_subnet_ids" {
  description = "List of IDs of public subnets"
  value       = module.vpc.public_subnets
}

# EKS Outputs
output "eks_cluster_endpoint" {
  description = "Endpoint for EKS control plane"
  value       = module.eks.cluster_endpoint
}

output "eks_cluster_name" {
  description = "The name of the EKS cluster"
  value       = module.eks.cluster_name
}

# RDS MySQL Outputs
output "rds_endpoint" {
  description = "The connection endpoint for the RDS MySQL instance"
  value       = module.rds.rds_endpoint
}

output "rds_address" {
  description = "The hostname of the RDS MySQL instance"
  value       = module.rds.rds_address
}

output "rds_port" {
  description = "The port on which the MySQL DB accepts connections"
  value       = module.rds.rds_port
}

output "rds_database_name" {
  description = "The name of the MySQL database"
  value       = module.rds.rds_database_name
}

# Redis Outputs
output "redis_primary_endpoint" {
  description = "The primary endpoint of the Redis cluster"
  value       = module.redis.redis_primary_endpoint
}

output "redis_reader_endpoint" {
  description = "The reader endpoint of the Redis cluster"
  value       = module.redis.redis_reader_endpoint
}

output "redis_port" {
  description = "The port on which Redis accepts connections"
  value       = module.redis.redis_port
}

output "redis_configuration_endpoint" {
  description = "The configuration endpoint for Redis cluster mode"
  value       = module.redis.redis_configuration_endpoint
}

