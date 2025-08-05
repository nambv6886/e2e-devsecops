module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "21.0.7"

  name               = var.cluster_name
  kubernetes_version = "1.33"

  addons = {
    coredns = {}
    eks-pod-identity-agent = {
      before_compute = true
    }
    kube-proxy = {}
    vpc-cni = {
      before_compute = true
    }
  }

  vpc_id     = var.vpc_id
  subnet_ids = concat(var.private_subnet_ids, var.public_subnet_ids)

  enable_irsa = var.enable_irsa

  # Configure endpoint access
  # default is false
  endpoint_public_access = true
  # default is true, set to false if you want to disable public access
  endpoint_private_access = true
  # CIDRs that can access the EKS API server
  endpoint_public_access_cidrs = ["0.0.0.0/0"]

  // default is true, set to false if you want to manage IAM roles manually
  create_iam_role      = true
  create_node_iam_role = true

  # If you want to use an existing IAM role for the EKS cluster, uncomment the line below
  # iam_role_arn = aws_iam_role.eks_master_role.arn

  eks_managed_node_groups = {
    eks_nodes = {
      desired_capacity = var.eks_node_desired_capacity
      max_capacity     = var.eks_node_max_capacity
      min_capacity     = var.eks_node_min_capacity
      # Deploy worker nodes in private subnets for security
      subnet_ids = length(var.private_subnet_ids) > 0 ? var.private_subnet_ids : var.public_subnet_ids
      # If you want to use an existing IAM role for the EKS worker nodes, uncomment the line below
      # iam_role_arn = module.eks.node_iam_role_arn
      instance_type = var.eks_node_instance_type
      key_name      = var.key_name
      ami_type      = var.eks_node_ami_type

      additional_tags = {
        Name = "eks-node-group"
      }
    }
  }

  depends_on = [
  ]
}
