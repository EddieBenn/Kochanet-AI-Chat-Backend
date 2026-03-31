import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { GenderEnum } from './create-user.dto';
import { Role } from 'src/base.entity';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @Transform((val) => val.value.toLowerCase())
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  phone?: string;

  @Transform((val) => val.value.toLowerCase())
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsEnum(GenderEnum)
  gender?: GenderEnum;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
