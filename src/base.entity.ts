import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsEmail,
  IsString,
  Matches,
  Length,
} from 'class-validator';
import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @CreateDateColumn()
  public created_at?: Date | string;

  @UpdateDateColumn()
  public updated_at?: Date | string;

  @Column({ default: null, nullable: true })
  public deleted_at?: Date;
}

export enum Role {
  USER = 'user',
  ADMIN = 'admin',
}

export enum EmailEventsEnum {
  SEND_VERIFICATION_EMAIL = 'send.verification.email',
  SEND_WELCOME_EMAIL = 'send.welcome.email',
}

export interface IPagination {
  totalRows: number;
  perPage: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface IReqUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  role: string;
}

export class ForgotPasswordDto {
  @Transform((val) => val.value.toLowerCase())
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
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
  confirm_password: string;
}

export class LoginDto {
  @Transform((val) => val.value.toLowerCase())
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
    {
      message:
        'Password must be at least 6 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.',
    },
  )
  password: string;
}

export class VerifyOTPDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 6)
  otp: string;
}

export class ResendOTPDto {
  @IsEmail()
  email: string;
}
