terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket = "rama-terraform-state-prod"
    key    = "prod/terraform.tfstate"
    region = "me-central-1" # UAE Region
  }
}

provider "aws" {
  region = "me-central-1"
}

# VPC and Networking
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  version = "5.5.0"

  name = "rama-prod-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["me-central-1a", "me-central-1b", "me-central-1c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = true
  enable_vpn_gateway = false

  tags = {
    Environment = "production"
    Project     = "RAMA"
  }
}
