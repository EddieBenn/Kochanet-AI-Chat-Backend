import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { Role } from 'src/base.entity';

export enum GenderEnum {
  MALE = 'male',
  FEMALE = 'female',
}

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @IsNotEmpty()
  @IsString()
  last_name: string;

  @Transform((val) => val.value.toLowerCase())
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  phone: string;

  @Transform((val) => val.value.toLowerCase())
  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsEnum(GenderEnum)
  gender: GenderEnum;

  @IsOptional()
  @IsString()
  @IsEnum(Role)
  role?: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
    {
      message:
        'Password must be at least 6 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.',
    },
  )
  password: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
    {
      message:
        'Confirm password must be at least 6 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.',
    },
  )
  confirm_password: string;
}

export interface IUser {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  gender: string;
  city: string;
  role: string;
  otp?: string | null;
  otp_expiry?: string | Date | null;
  is_verified: boolean;
}

export interface UserFilter {
  first_name?: string;
  last_name?: string;
  city?: string;
  gender?: string;
  role?: string;
  email?: string;
  phone?: string;
  start_date?: string;
  end_date?: string;
  is_verified?: boolean;
  size?: number;
  page?: number;
}
