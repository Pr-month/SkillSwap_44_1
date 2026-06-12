import { UserRole } from "./auth.user_role";

export interface JwtPayload {
    sub: string;
    email: string;
    role: UserRole;
}