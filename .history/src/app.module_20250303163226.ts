import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { AuthModule } from './auth/auth.module';
import { TablesController } from './tables/tables.controller';
import { TablesService } from './tables/tables.service';
import { GameLogicService } from './game-logic/game-logic.service';

@Module({
  imports: [TypeOrmModule.forRoot({
    type: "sqlite",
    database: "db.sqlite",
    entities: [User],
    synchronize: true,
  }), UsersModule, AuthModule],
  controllers: [AppController, UsersController, TablesController],
  providers: [AppService,UsersService, TablesService, GameLogicService],
})
export class AppModule {}

