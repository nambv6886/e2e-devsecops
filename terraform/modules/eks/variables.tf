variable "cluster_name" {
  description = "The name of the EKS cluster."
  type        = string
}

variable "vpc_id" {
  description = "The ID of the VPC where the EKS cluster will be deployed."
  type        = string
}

variable "public_subnet_ids" {
  description = "A list of public subnet IDs where the EKS cluster will be deployed."
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "A list of private subnet IDs where the EKS worker nodes will be deployed."
  type        = list(string)
  default     = []
}

variable "eks_node_instance_type" {
  description = "The instance type for the EKS worker nodes."
  type        = string
  default     = "t3.medium"
}

variable "eks_node_ami_type" {
  description = "The AMI type for the EKS worker nodes."
  type        = string
  default     = "AL2_x86_64"
}

variable "key_name" {
  description = "The name of the key pair to use for SSH access to the EKS worker nodes."
  type        = string
}

variable "enable_irsa" {
  description = "Enable IAM Roles for Service Accounts (IRSA) for the EKS cluster."
  type        = bool
  default     = true
}

variable "eks_node_desired_capacity" {
  description = "The desired number of worker nodes in the EKS node group."
  type        = number
  default     = 2
}

variable "eks_node_max_capacity" {
  description = "The maximum number of worker nodes in the EKS node group."
  type        = number
  default     = 5
}

variable "eks_node_min_capacity" {
  description = "The minimum number of worker nodes in the EKS node group."
  type        = number
  default     = 1
}
