import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Get,
  Query,
  ParseUUIDPipe,
  Put,
  UsePipes,
  Res,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UserFilter } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RoleGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/role.decorator';
import {
  ForgotPasswordDto,
  LoginDto,
  ResendOTPDto,
  Role,
  VerifyOTPDto,
} from 'src/base.entity';
import { PasswordMatch } from 'src/auth/password-match.pipe';
import { Response } from 'express';
import { SkipAuth } from 'src/auth/auth.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @SkipAuth()
  @Post()
  @UsePipes(PasswordMatch)
  async createUser(@Body() body: CreateUserDto) {
    try {
      return this.usersService.createUser(body);
    } catch (error) {
      throw error;
    }
  }

  @SkipAuth()
  @Post('verify-otp')
  async verifyOTP(@Body() verifyOTPDto: VerifyOTPDto) {
    try {
      return await this.usersService.verifyOTP(
        verifyOTPDto.email,
        verifyOTPDto.otp,
      );
    } catch (error) {
      throw error;
    }
  }

  @SkipAuth()
  @Post('resend-otp')
  async resendOTP(@Body() resendOTPDto: ResendOTPDto) {
    try {
      return await this.usersService.resendOTP(resendOTPDto.email);
    } catch (error) {
      throw error;
    }
  }

  @Get()
  @UseGuards(RoleGuard)
  @Roles(Role.ADMIN)
  getAllUsers(@Query() query: UserFilter) {
    try {
      return this.usersService.getAllUsers(query);
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  getUserById(@Param('id', new ParseUUIDPipe()) id: string) {
    try {
      return this.usersService.getUserById(id);
    } catch (error) {
      throw error;
    }
  }

  @Put(':id')
  updateUserById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateUserDto,
  ) {
    try {
      return this.usersService.updateUserById(id, body);
    } catch (error) {
      throw error;
    }
  }

  @SkipAuth()
  @Post('reset-password')
  @UsePipes(PasswordMatch)
  async forgotPassword(@Body() body: ForgotPasswordDto, @Res() res: Response) {
    try {
      return this.usersService.resetPassword(body, res);
    } catch (error) {
      throw error;
    }
  }

  @SkipAuth()
  @Post('login')
  async login(@Body() body: LoginDto, @Res() res: Response) {
    try {
      return this.usersService.loginUser(body, res);
    } catch (error) {
      throw error;
    }
  }

  @SkipAuth()
  @Post('logout')
  async logout(@Res() res: Response) {
    try {
      return this.usersService.logoutUser(res);
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles(Role.ADMIN)
  deleteUserById(@Param('id', new ParseUUIDPipe()) id: string) {
    try {
      return this.usersService.deleteUserById(id);
    } catch (error) {
      throw error;
    }
  }
}
