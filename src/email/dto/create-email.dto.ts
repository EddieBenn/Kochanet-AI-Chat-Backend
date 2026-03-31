import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateEmailDto {
  @IsEmail()
  @IsNotEmpty()
  to: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsEmail()
  @IsNotEmpty()
  from: string;
}
