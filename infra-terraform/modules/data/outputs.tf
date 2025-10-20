output "amzlinux2_id" {
  description = "Amazon Linux 2 AMI ID"
  value       = data.aws_ami.amzlinux2.id
}
output "ubuntu_id" {
  description = "Ubuntu AMI ID"
  value       = data.aws_ami.ubuntu.id
}
