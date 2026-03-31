import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UserSubscriber } from './subscribers/user.subsriber';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([Users]), AuthModule, CommonModule],
  controllers: [UsersController],
  providers: [UsersService, UserSubscriber],
  exports: [UsersService],
})
export class UsersModule {}
