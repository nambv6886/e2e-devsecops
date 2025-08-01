variable "aws_region" {
  description = "The AWS region to deploy resources in"
  type        = string
  default     = "ap-southeast-1"
}

variable "vpc_id" {
  description = "The ID of the VPC where Jenkins will be deployed"
  type        = string
}
variable "project_name" {
  description = "The name of the project"
  type        = string
}

variable "environment" {
  description = "The environment for the deployment (e.g., dev, staging, prod)"
  type        = string
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

variable "public_subnets" {
  description = "List of public subnet IDs for the Jenkins instance"
  type        = list(string)
}

variable "linux2_ami" {
  description = "The AMI ID for the Linux 2 instance"
  type        = string

}
