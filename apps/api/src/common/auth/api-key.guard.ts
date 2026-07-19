import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<any>();
    const apiKey = request.header("x-api-key");
    
    if (!apiKey) {
      throw new UnauthorizedException("API Key is missing");
    }

    // In a real scenario, query the DB for valid B2B API keys
    // For MVP, we use a static token
    if (apiKey !== "rama_b2b_secret_token_123") {
      throw new UnauthorizedException("Invalid API Key");
    }

    return true;
  }
}
