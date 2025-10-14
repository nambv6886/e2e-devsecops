output "redis_primary_endpoint" {
  description = "The primary endpoint of the Redis replication group"
  value       = aws_elasticache_replication_group.redis.primary_endpoint_address
}

output "redis_reader_endpoint" {
  description = "The reader endpoint of the Redis replication group"
  value       = aws_elasticache_replication_group.redis.reader_endpoint_address
}

output "redis_port" {
  description = "The port on which Redis accepts connections"
  value       = aws_elasticache_replication_group.redis.port
}

output "redis_security_group_id" {
  description = "The security group ID of the Redis cluster"
  value       = aws_security_group.redis_sg.id
}

output "redis_subnet_group_name" {
  description = "The name of the Redis subnet group"
  value       = aws_elasticache_subnet_group.redis_subnet_group.name
}

output "redis_configuration_endpoint" {
  description = "The configuration endpoint for Redis cluster mode"
  value       = aws_elasticache_replication_group.redis.configuration_endpoint_address
}

