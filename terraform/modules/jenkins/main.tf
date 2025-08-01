module "jenkins_sg" {
  source  = "terraform-aws-modules/security-group/aws"
  version = "5.3.0"

  name        = "${var.project_name}-jenkins-sg"
  description = "Security group for jenkins web server"
  vpc_id      = var.vpc_id

  # Port 8080 is required for Jenkins
  ingress_with_cidr_blocks = [
    {
      from_port   = 8080
      to_port     = 8080
      protocol    = "tcp"
      description = "HTTP from anywhere"
      cidr_blocks = "0.0.0.0/0"
    },

    {
      from_port   = 80
      to_port     = 80
      protocol    = "tcp"
      description = "HTTP from anywhere"
      cidr_blocks = "0.0.0.0/0"
    },
    {
      from_port   = 443
      to_port     = 443
      protocol    = "tcp"
      description = "HTTPS from anywhere"
      cidr_blocks = "0.0.0.0/0"
    },
    {
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      description = "SSH from anywhere"
      cidr_blocks = "0.0.0.0/0"
    }
  ]
  egress_rules = ["all-all"]

  tags = {
    Name        = "${var.project_name}-jenkins-sg"
    Environment = var.environment
    Project     = var.project_name
  }
}

module "jenkins_instance" {
  source  = "terraform-aws-modules/ec2-instance/aws"
  version = "6.0.2"

  name = "${var.project_name}-jenkins-instance"

  ami           = var.linux2_ami
  instance_type = var.jenkins_instance_type
  key_name      = var.jenkins_instance_key_name

  vpc_security_group_ids = [module.jenkins_sg.security_group_id]
  subnet_id              = var.public_subnets[0]

  associate_public_ip_address = true

  user_data = file("${path.module}/user_data.sh")

  root_block_device = {
    delete_on_termination = true
    size                  = 30
  }
  volume_tags = {
    Name        = "${var.project_name}-jenkins-root-volume"
    Environment = var.environment
    Project     = var.project_name
  }

  tags = {
    Name    = "${var.project_name}-jenkins-instance"
    Project = var.project_name
  }
}

# resource "aws_eip" "jenkins" {
#   instance   = module.jenkins_instance.id
#   depends_on = [module.jenkins_instance]

#   tags = {
#     Name        = "${var.project_name}-jenkins-eip"
#     Environment = var.environment
#     Project     = var.project_name
#   }
# }
