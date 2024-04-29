import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
// import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Permission]),
    // 如果这里引入 RedisModule 则不需要在 redis.module.ts 中使用 @Global
    // RedisModule
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
