import { Exclude } from "class-transformer";
import { IsEmail, IsString, Matches, MinLength, Length, IsOptional, IsBoolean, IsNegative, IsNumber } from "class-validator";

export namespace AuthDto {

    export class SignUp {
        @IsEmail()
        email: string;

        @IsString()
        @Length(10, 50)
        @MinLength(10, { message: 'Password must be at least 10 characters long' })
        @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
        @Matches(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
        @Matches(/\d/, { message: 'Password must contain at least one number' })
        @Matches(/[!@#$%^&*(),.?":{}|<>]/, { message: 'Password must contain at least one special character' })
        password: string;

        @IsString()
        @Length(1, 8)
        name: string

        @IsOptional()
        @IsBoolean()
        set_profile: boolean;
    }

    export class SocialSignUp {
        @IsEmail()
        email: string;
        
        @IsString()
        @Length(1, 64)
        external_id: string;

        @IsString()
        @Length(1, 64)
        @IsOptional()
        nickname?: string;

        @IsNumber()
        login_type: number;

        @IsString()
        @Length(1, 256)
        @Exclude()
        access_token: string;

        @IsString()
        @Length(1, 256)
        @Exclude()
        refresh_token: string;
    }

    export class SignIn {
        @IsEmail()
        email: string;

        @IsString()
        @Length(4, 50)
        password: string;
    }
}