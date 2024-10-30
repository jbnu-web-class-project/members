import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JWTAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): any {
    return super.canActivate(context);
  }
}