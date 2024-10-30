import { IsString, Length, IsBoolean, IsNumber } from "class-validator";

enum LoginType {
    LOCAL = 0,
    GOOGLE = 1,
    Naver = 2,
    KAKAO = 3,
}

enum RoleType {
    ADMIN = 0,
    USER = 1,
}

export class CreateUserDto {
    @IsString()
    @Length(1, 8)
    name: string;
    
    @IsNumber()
    role: RoleType;

    @IsNumber()
    login_type: LoginType;

    @IsBoolean()
    set_profile: boolean;
}