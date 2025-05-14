import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TablesController } from './tables/tables.controller';
import { TablesService } from './tables/tables.service';
import { ActionsController } from './actions/actions.controller';
import { ActionsService } from './actions/actions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { AuthModule } from './auth/auth.module';
import { GameLogicService } from './game-logic/game-logic.service';
import { PlayersService } from './players/players.service';
import { DecksService } from './decks/decks.service';
import { TablesModule } from './tables/tables.module';
import { ActionsModule } from './actions/actions.module';
import { PlayersModule } from './players/players.module';
import { GameLogicModule } from './game-logic/game-logic.module';
import { DecksModule } from './decks/decks.module';

@Module({
  imports: [TypeOrmModule.forRoot({
    type: "sqlite",
    database: "db.sqlite",
    entities: [User],
    synchronize: true,
  }), UsersModule, AuthModule, TablesModule, ActionsModule, PlayersModule, GameLogicModule, DecksModule],
  controllers: [AppController, TablesController, ActionsController, UsersController],
  providers: [AppService, TablesService, ActionsService, UsersService, GameLogicService, PlayersService, DecksService],
})
export class AppModule {}

