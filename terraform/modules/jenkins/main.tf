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
    },
    # Port 2379-2380 is required for etcd-cluster
    {
      from_port   = 2379
      to_port     = 2380
      protocol    = "tcp"
      description = "etc-cluster Port"
      cidr_blocks = "0.0.0.0/0"
    },
    #Port 3000 is required for Grafana
    {
      from_port   = 3000
      to_port     = 3000
      protocol    = "tcp"
      description = "Grafana Port"
      cidr_blocks = "0.0.0.0/0"
    },
    # Port 6443 is required for KubeAPIServer
    {
      from_port   = 6443
      to_port     = 6443
      protocol    = "tcp"
      description = "KubeAPIServer Port"
      cidr_blocks = "0.0.0.0/0"
    },
    # Port 9000 is required for SonarQube
    {
      from_port   = 9000
      to_port     = 9000
      protocol    = "tcp"
      description = "SonarQube Port"
      cidr_blocks = "0.0.0.0/0"
    },
    # Port 9090 is required for Prometheus
    {
      from_port   = 9090
      to_port     = 9090
      protocol    = "tcp"
      description = "Prometheus Port"
      cidr_blocks = "0.0.0.0/0"
    },
    # Port 9100 is required for Prometheus metrics server
    {
      from_port   = 9100
      to_port     = 9100
      protocol    = "tcp"
      description = "Prometheus metrics server Port"
      cidr_blocks = "0.0.0.0/0"
    },
    # Port 10250-10260 is required for K8s
    {
      from_port   = 10250
      to_port     = 10260
      protocol    = "tcp"
      description = "K8s Port"
      cidr_blocks = "0.0.0.0/0"
    },
    # Port 30000-32767 is required for NodePort
    {
      from_port   = 30000
      to_port     = 32767
      protocol    = "tcp"
      description = "NodePort"
      cidr_blocks = "0.0.0.0/0"
    },
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

  ami           = var.ubuntu_id
  instance_type = var.jenkins_instance_type
  key_name      = var.jenkins_instance_key_name

  vpc_security_group_ids = [module.jenkins_sg.security_group_id]
  subnet_id              = var.public_subnets[0]

  associate_public_ip_address = true
  user_data                   = file("${path.module}/install.sh")

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

// todo Ansible provisioner to install Jenkins and other tools
# resource "null_resource" "setup_jenkins" {
#   depends_on = [module.jenkins_instance]
#   connection {
#     type        = "ssh"
#     host        = module.jenkins_instance.public_ip
#     user        = "ubuntu"
#     private_key = file("${path.module}/../../envs/terraform.pem")
#   }

#   provisioner "remote-exec" {
#     inline = [
#       "echo 'Setting up Jenkins environment...'",
#       # Install Java
#       # Ref: https://www.rosehosting.com/blog/how-to-install-java-17-lts-on-ubuntu-20-04/
#       "sudo apt update -y",
#       "sudo apt install fontconfig openjdk-17-jdk openjdk-17-jre y",
#       "java -version",

#       # Install Jenkins
#       # Ref: https://www.jenkins.io/doc/book/installing/linux/#debian-stable
#       "sudo wget -O /etc/apt/keyrings/jenkins-keyring.asc https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key",
#       "echo \"deb [signed-by=/etc/apt/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/\" | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null",
#       "sudo apt-get update -y",
#       "sudo apt-get install jenkins -y",
#       "sudo systemctl enable jenkins",
#       "sudo systemctl start jenkins",
#       "sudo systemctl status jenkins",

#       # Install Docker
#       "sudo apt-get update -y",
#       "sudo apt-get install -y ca-certificates curl",
#       "sudo install -m 0755 -d /etc/apt/keyrings -y",
#       "curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo tee /etc/apt/keyrings/docker.asc",
#       "sudo chmod a+r /etc/apt/keyrings/docker.asc",
#       "echo \"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable\" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null",
#       "sudo apt-get update -y",
#       "sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin",
#       "sudo usermod -aG docker ubuntu",
#       "sudo usermod -aG docker jenkins",
#       "sudo chmod 777 /var/run/docker.sock",
#       "docker --version || true",
#       "sleep 5",
#       # # Install SonarQube (as container)
#       "docker run -d --name sonar -p 9000:9000 sonarqube:lts-community",

# # # Install AWS CLI
# # # Ref: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
# "sudo apt install unzip -y",
# "curl 'https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip' -o 'awscliv2.zip'",
# "unzip awscliv2.zip",
# "sudo ./aws/install",

# # Install Kubectl
# # Ref: https://docs.aws.amazon.com/eks/latest/userguide/install-kubectl.html#kubectl-install-update
# "curl -O https://s3.us-west-2.amazonaws.com/amazon-eks/1.30.4/2024-09-11/bin/linux/amd64/kubectl",
# "curl -O https://s3.us-west-2.amazonaws.com/amazon-eks/1.30.4/2024-09-11/bin/linux/amd64/kubectl.sha256",
# "sha256sum -c kubectl.sha256",
# "openssl sha1 -sha256 kubectl",
# "chmod +x ./kubectl",
# "mkdir -p $HOME/bin && cp ./kubectl $HOME/bin/kubectl && export PATH=$HOME/bin:$PATH",
# "echo 'export PATH=$HOME/bin:$PATH' >> ~/.bashrc",
# "sudo mv $HOME/bin/kubectl /usr/local/bin/kubectl",
# "sudo chmod +x /usr/local/bin/kubectl",
# "kubectl version --client",

# # Install Helm
# # Ref: https://helm.sh/docs/intro/install/
# # Ref (for .tar.gz file): https://github.com/helm/helm/releases
# "wget https://get.helm.sh/helm-v3.16.1-linux-amd64.tar.gz",
# "tar -zxvf helm-v3.16.1-linux-amd64.tar.gz",
# "sudo mv linux-amd64/helm /usr/local/bin/helm",
# "helm version",

# # Install ArgoCD
# # Ref: https://argo-cd.readthedocs.io/en/stable/cli_installation/
# "VERSION=$(curl -L -s https://raw.githubusercontent.com/argoproj/argo-cd/stable/VERSION)",
# "curl -sSL -o argocd-linux-amd64 https://github.com/argoproj/argo-cd/releases/download/v$VERSION/argocd-linux-amd64",
# "sudo install -m 555 argocd-linux-amd64 /usr/local/bin/argocd",
# "rm argocd-linux-amd64",

# # Install Trivy
# # Ref: https://aquasecurity.github.io/trivy/v0.18.3/installation/
# "sudo apt-get install -y wget apt-transport-https gnupg",
# "wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | gpg --dearmor | sudo tee /usr/share/keyrings/trivy.gpg > /dev/null",
# "echo 'deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb generic main' | sudo tee -a /etc/apt/sources.list.d/trivy.list",
# "sudo apt-get update -y",
# "sudo apt-get install trivy -y",
#     ]
#   }
# }

# resource "aws_eip" "jenkins" {
#   instance   = module.jenkins_instance.id
#   depends_on = [module.jenkins_instance]

#   tags = {
#     Name        = "${var.project_name}-jenkins-eip"
#     Environment = var.environment
#     Project     = var.project_name
#   }
# }
