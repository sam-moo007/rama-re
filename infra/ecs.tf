resource "aws_ecs_cluster" "rama_cluster" {
  name = "rama-prod-cluster"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# API Task Definition
resource "aws_ecs_task_definition" "api" {
  family                   = "rama-api-prod"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 512
  memory                   = 1024
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "api"
      image     = "rama/api:latest" # Usually from ECR
      essential = true
      portMappings = [
        {
          containerPort = 4000
          hostPort      = 4000
        }
      ]
      environment = [
        { name = "NODE_ENV", value = "production" },
        { name = "DATABASE_URL", value = module.db.db_instance_endpoint },
        { name = "REDIS_URL", value = aws_elasticache_cluster.redis.cache_nodes[0].address }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/rama-api"
          "awslogs-region"        = "me-central-1"
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}

# Web Task Definition
resource "aws_ecs_task_definition" "web" {
  family                   = "rama-web-prod"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 512
  memory                   = 1024
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "web"
      image     = "rama/web:latest" # Usually from ECR
      essential = true
      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
        }
      ]
      environment = [
        { name = "NODE_ENV", value = "production" },
        { name = "NEXT_PUBLIC_API_URL", value = "https://api.rama.ae/v1" }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/rama-web"
          "awslogs-region"        = "me-central-1"
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}

resource "aws_iam_role" "ecs_execution_role" {
  name = "rama-ecs-execution-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}
