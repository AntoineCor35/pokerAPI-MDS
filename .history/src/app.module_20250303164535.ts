import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TablesController } from './tables/tables.controller';
import { ActionsController } from './actions/actions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TablesModule } from './tables/tables.module';
import { ActionsModule } from './actions/actions.module';
import { DecksModule } from './decks/decks.moduole';
import { GameLogicModule } from './game-logic/games-logic.module';
import { PlayersModule } from './players/players.module';

@Module({
  imports: [TypeOrmModule.forRoot({
    type: "sqlite",
    database: "db.sqlite",
    entities: [User],
    synchronize: true,
  }), UsersModule, AuthModule, TablesModule, ActionsModule, DecksModule, GameLogicModule, PlayersModule],
  controllers: [AppController, TablesController, ActionsController],
  providers: [AppService],
})
export class AppModule {}

