import { IsNumber, IsOptional, IsString, Length, Matches } from 'class-validator';

export class UpdateProfileDto {
    @IsString()
    @Length(1, 8)
    nickname: string;

    @IsString()
    @Length(13, 16)
    @Matches(/^\d{3}-\d{4}-\d{4}$/, { message: '전화번호는 000-0000-0000 형식이어야 합니다.' })
    phone: string;

    @IsOptional()
    @IsString()
    @Length(1, 128)
    address?: string;

    @IsOptional()
    @IsString()
    @Length(1, 128)
    profile_img?: string;

    @IsOptional()
    @IsNumber()
    prefer_sports?: number;

    @IsOptional()
    @IsNumber()
    prefer_team?: number;
}