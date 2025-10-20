variable "project_name" {
  description = "The name of the project"
  type        = string
}

variable "environment" {
  description = "The environment for the deployment"
  type        = string
}

variable "vpc_id" {
  description = "The VPC ID where Redis will be deployed"
  type        = string
}

variable "vpc_cidr_block" {
  description = "The CIDR block of the VPC"
  type        = string
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs for Redis"
  type        = list(string)
}

variable "engine_version" {
  description = "Redis engine version"
  type        = string
  default     = "7.0"
}

variable "redis_family_version" {
  description = "Redis family version for parameter group (e.g., 7.0, 6.x)"
  type        = string
  default     = "7"
}

variable "node_type" {
  description = "The instance type for Redis nodes"
  type        = string
  default     = "cache.t3.micro"
}

variable "num_cache_nodes" {
  description = "The number of cache nodes in the replication group"
  type        = number
  default     = 2
}

variable "automatic_failover_enabled" {
  description = "Enable automatic failover"
  type        = bool
  default     = true
}

variable "multi_az_enabled" {
  description = "Enable Multi-AZ deployment"
  type        = bool
  default     = false
}

variable "at_rest_encryption_enabled" {
  description = "Enable encryption at rest"
  type        = bool
  default     = true
}

variable "transit_encryption_enabled" {
  description = "Enable encryption in transit"
  type        = bool
  default     = false
}

variable "auth_token_enabled" {
  description = "Enable Redis AUTH token (requires transit encryption)"
  type        = bool
  default     = false
}

variable "auth_token" {
  description = "Password used to access a password protected server (requires transit encryption enabled)"
  type        = string
  default     = null
  sensitive   = true
}

variable "snapshot_retention_limit" {
  description = "The number of days to retain automatic snapshots"
  type        = number
  default     = 5
}

variable "snapshot_window" {
  description = "The daily time range during which automated snapshots are created"
  type        = string
  default     = "03:00-05:00"
}

variable "maintenance_window" {
  description = "The weekly time range for system maintenance"
  type        = string
  default     = "sun:05:00-sun:07:00"
}

