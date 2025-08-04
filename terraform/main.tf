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

module "jenkins" {
  source = "./modules/jenkins"

  project_name = var.project_name
  environment  = var.environment

  vpc_id         = module.vpc.vpc_id
  public_subnets = module.vpc.public_subnets

  ubuntu_id                 = module.data.ubuntu_id
  jenkins_instance_type     = var.jenkins_instance_type
  jenkins_instance_key_name = var.jenkins_instance_key_name
}
