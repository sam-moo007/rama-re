module "db" {
  source  = "terraform-aws-modules/rds/aws"
  version = "6.3.0"

  identifier = "rama-prod-postgres"

  engine               = "postgres"
  engine_version       = "15.4"
  family               = "postgres15"
  major_engine_version = "15"
  instance_class       = "db.t4g.large" # Graviton for performance/cost

  allocated_storage     = 100
  max_allocated_storage = 500

  db_name  = "rama"
  username = "postgres"
  port     = 5432

  multi_az               = true
  db_subnet_group_name   = module.vpc.database_subnet_group
  vpc_security_group_ids = [aws_security_group.db.id]

  maintenance_window      = "Mon:00:00-Mon:03:00"
  backup_window           = "03:00-06:00"
  backup_retention_period = 14

  tags = {
    Environment = "production"
  }
}

resource "aws_security_group" "db" {
  name        = "rama-rds-sg"
  description = "Allow inbound traffic from ECS"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }
}

# Redis configuration (elasticache.tf equivalent)
resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "rama-prod-redis"
  engine               = "redis"
  node_type            = "cache.t4g.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  engine_version       = "7.1"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.redis.name
  security_group_ids   = [aws_security_group.redis.id]
}

resource "aws_elasticache_subnet_group" "redis" {
  name       = "rama-redis-subnet"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_security_group" "redis" {
  name        = "rama-redis-sg"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }
}

resource "aws_security_group" "ecs_tasks" {
  name   = "rama-ecs-sg"
  vpc_id = module.vpc.vpc_id
}
