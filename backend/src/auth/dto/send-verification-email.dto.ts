import { IsEmail, IsString, IsOptional } from 'class-validator';

export class SendVerificationEmailDto {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  verificationToken: string;

  @IsOptional()
  @IsString()
  frontendUrl?: string;
}