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
