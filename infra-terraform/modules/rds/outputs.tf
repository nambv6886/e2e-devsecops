output "rds_endpoint" {
  description = "The connection endpoint for the RDS instance"
  value       = aws_db_instance.mysql.endpoint
}

output "rds_address" {
  description = "The hostname of the RDS instance"
  value       = aws_db_instance.mysql.address
}

output "rds_port" {
  description = "The port on which the DB accepts connections"
  value       = aws_db_instance.mysql.port
}

output "rds_database_name" {
  description = "The name of the database"
  value       = aws_db_instance.mysql.db_name
}

output "rds_security_group_id" {
  description = "The security group ID of the RDS instance"
  value       = aws_security_group.rds_sg.id
}

output "rds_subnet_group_name" {
  description = "The name of the DB subnet group"
  value       = aws_db_subnet_group.rds_subnet_group.name
}

