import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterUserDto } from './dto/user.dto';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { Repository } from 'typeorm';
import { RedisService } from '../redis/redis.service';
import { md5 } from '../utils';
import { HttpException, HttpStatus } from '@nestjs/common';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginUserVo } from './vo/login-user.vo';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  private logger = new Logger();

  @InjectRepository(User)
  private userRepository: Repository<User>;

  @InjectRepository(Role)
  private roleRepository: Repository<Role>;

  @InjectRepository(Permission)
  private permissionRepository: Repository<Permission>;

  @Inject(RedisService)
  private redisService: RedisService;

  @Inject(JwtService)
  private jwtService: JwtService;

  @Inject(ConfigService)
  private configService: ConfigService;

  async initData() {
    const user1 = new User();
    user1.username = 'zhangsan';
    user1.password = md5('111111');
    user1.email = 'xxx@xx.com';
    user1.isAdmin = true;
    user1.nickName = '张三';
    user1.phoneNumber = '13233323333';

    const user2 = new User();
    user2.username = 'lisi';
    user2.password = md5('222222');
    user2.email = 'yy@yy.com';
    user2.nickName = '李四';

    const role1 = new Role();
    role1.name = '管理员';

    const role2 = new Role();
    role2.name = '普通用户';

    const permission1 = new Permission();
    permission1.code = 'ccc';
    permission1.description = '访问 ccc 接口';

    const permission2 = new Permission();
    permission2.code = 'ddd';
    permission2.description = '访问 ddd 接口';

    user1.roles = [role1];
    user2.roles = [role2];

    role1.permissions = [permission1, permission2];
    role2.permissions = [permission1];

    await this.permissionRepository.save([permission1, permission2]);
    await this.roleRepository.save([role1, role2]);
    await this.userRepository.save([user1, user2]);
  }

  async initData2() {
    const user1 = new User();
    user1.username = 'wangwu';
    user1.password = md5('333333');
    user1.email = 'xxx@xx.com';
    user1.isAdmin = true;
    user1.nickName = '王五';
    user1.phoneNumber = '110';

    // 给王五添加数据库中现有的管理员和普通用户角色
    const role1 = await this.roleRepository.findOne({
      where: { name: '管理员' },
    });
    const role2 = await this.roleRepository.findOne({
      where: { name: '普通用户' },
    });
    user1.roles = [role1, role2];

    try {
      await this.userRepository.save(user1);
      return '初始化成功';
    } catch (e) {
      this.logger.error(e, UserService);
      return '初始化失败';
    }
  }

  async register(user: RegisterUserDto) {
    const foundUser = await this.userRepository.findOneBy({
      username: user.username,
    });

    if (foundUser) {
      throw new HttpException('用户已存在', HttpStatus.BAD_REQUEST);
    }

    const newUser = new User();
    newUser.username = user.username;
    newUser.password = md5(user.password);
    newUser.email = user.email;
    newUser.nickName = user.nickName;

    try {
      await this.userRepository.save(newUser);
      return '注册成功';
    } catch (e) {
      this.logger.error(e, UserService);
      return '注册失败';
    }
  }

  async login(loginUserDto: LoginUserDto, isAdmin: boolean) {
    const user = await this.userRepository.findOne({
      where: {
        username: loginUserDto.username,
        isAdmin,
      },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }

    if (user.password !== md5(loginUserDto.password)) {
      throw new HttpException('密码错误', HttpStatus.BAD_REQUEST);
    }

    const vo = new LoginUserVo();
    vo.userInfo = {
      id: user.id,
      username: user.username,
      nickName: user.nickName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      headPic: user.headPic,
      createTime: user.createTime.getTime(),
      isFrozen: user.isFrozen,
      isAdmin: user.isAdmin,
      roles: user.roles.map((item) => item.name),
      // 重复权限去重
      permissions: user.roles
        .flatMap((item) => item.permissions)
        .reduce((acc, curr) => {
          const index = acc.findIndex((item2) => item2.id === curr.id);
          if (index === -1) {
            acc.push(curr);
          }
          return acc;
        }, []),
    };

    vo.accessToken = this.getToken(vo.userInfo).accessToken;
    vo.refreshToken = this.getToken(vo.userInfo).refreshToken;

    return vo;
  }

  async findUserById(userId: number, isAdmin: boolean) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
        isAdmin,
      },
      relations: ['roles', 'roles.permissions'],
    });

    return {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      roles: user.roles.map((item) => item.name),
      // 重复权限去重
      permissions: user.roles
        .flatMap((item) => item.permissions)
        .reduce((acc, curr) => {
          const index = acc.findIndex((item2) => item2.id === curr.id);
          if (index === -1) {
            acc.push(curr);
          }
          return acc;
        }, []),
    };
  }

  getToken(user) {
    const vo = {
      accessToken: '',
      refreshToken: '',
    };
    vo.accessToken = this.jwtService.sign(
      {
        userId: user.id,
        username: user.username,
        roles: user.roles,
        permissions: user.permissions,
      },
      {
        expiresIn:
          this.configService.get('jwt_access_token_expires_time') || '30m',
      },
    );

    vo.refreshToken = this.jwtService.sign(
      {
        userId: user.id,
      },
      {
        expiresIn:
          this.configService.get('jwt_refresh_token_expres_time') || '7d',
      },
    );

    return vo;
  }

  async findUserDetailById(userId: number) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    return user;
  }
}
