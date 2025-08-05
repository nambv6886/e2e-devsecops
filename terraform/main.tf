module "data" {
  source = "./modules/data"
}

module "vpc" {
  source = "./modules/vpc"

  project_name    = var.project_name
  environment     = var.environment
  vpc_cidr_block  = var.vpc_cidr_block
  private_subnets = var.private_subnets
  public_subnets  = var.public_subnets
  aws_region      = var.aws_region
  azs             = var.azs
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

# module "jenkins" {
#   source = "./modules/jenkins"

#   project_name = var.project_name
#   environment  = var.environment

#   vpc_id         = module.vpc.vpc_id
#   public_subnets = module.vpc.public_subnets

#   ubuntu_id                 = module.data.ubuntu_id
#   jenkins_instance_type     = var.jenkins_instance_type
#   jenkins_instance_key_name = var.jenkins_instance_key_name
# }
