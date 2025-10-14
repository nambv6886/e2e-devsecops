module "data" {
  source = "./modules/data"
}

module "vpc" {
  source = "./modules/vpc"

  project_name     = var.project_name
  environment      = var.environment
  vpc_cidr_block   = var.vpc_cidr_block
  private_subnets  = var.private_subnets
  public_subnets   = var.public_subnets
  aws_region       = var.aws_region
  azs              = var.azs
  eks_cluster_name = var.eks_cluster_name
}

module "eks" {
  source = "./modules/eks"

  cluster_name           = var.eks_cluster_name
  vpc_id                 = module.vpc.vpc_id
  eks_node_instance_type = var.eks_node_instance_type
  eks_node_ami_type      = var.eks_node_ami_type
  key_name               = var.eks_key_name
  enable_irsa            = var.eks_enable_irsa

  eks_node_desired_capacity = var.eks_node_desired_capacity
  eks_node_max_capacity     = var.eks_node_max_capacity
  eks_node_min_capacity     = var.eks_node_min_capacity

  public_subnet_ids  = module.vpc.public_subnets
  private_subnet_ids = module.vpc.private_subnets
}

module "rds" {
  source = "./modules/rds"

  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  vpc_cidr_block     = var.vpc_cidr_block
  private_subnet_ids = module.vpc.private_subnets

  engine_version          = var.rds_engine_version
  instance_class          = var.rds_instance_class
  allocated_storage       = var.rds_allocated_storage
  max_allocated_storage   = var.rds_max_allocated_storage
  storage_type            = var.rds_storage_type
  storage_encrypted       = var.rds_storage_encrypted
  database_name           = var.rds_database_name
  master_username         = var.rds_master_username
  master_password         = var.rds_master_password
  multi_az                = var.rds_multi_az
  backup_retention_period = var.rds_backup_retention_period
  backup_window           = var.rds_backup_window
  maintenance_window      = var.rds_maintenance_window
  skip_final_snapshot     = var.rds_skip_final_snapshot
}

module "redis" {
  source = "./modules/redis"

  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  vpc_cidr_block     = var.vpc_cidr_block
  private_subnet_ids = module.vpc.private_subnets

  engine_version             = var.redis_engine_version
  redis_family_version       = var.redis_family_version
  node_type                  = var.redis_node_type
  num_cache_nodes            = var.redis_num_cache_nodes
  automatic_failover_enabled = var.redis_automatic_failover_enabled
  multi_az_enabled           = var.redis_multi_az_enabled
  at_rest_encryption_enabled = var.redis_at_rest_encryption_enabled
  transit_encryption_enabled = var.redis_transit_encryption_enabled
  auth_token_enabled         = var.redis_auth_token_enabled
  auth_token                 = var.redis_auth_token
  snapshot_retention_limit   = var.redis_snapshot_retention_limit
  snapshot_window            = var.redis_snapshot_window
  maintenance_window         = var.redis_maintenance_window
}

module "bastion" {
  source = "./modules/bastion"

  project_name        = var.project_name
  environment         = var.environment
  vpc_id              = module.vpc.vpc_id
  public_subnet_id    = module.vpc.public_subnets[0]
  key_name            = var.bastion_key_name
  allowed_cidr_blocks = var.bastion_allowed_cidrs
  instance_type       = var.bastion_instance_type
}
