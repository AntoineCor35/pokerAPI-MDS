import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TablesModule } from './tables/tables.module';
import { ActionsModule } from './actions/actions.module';
import { PlayersModule } from './players/players.module';
import { GameLogicModule } from './game-logic/game-logic.module';
import { DecksModule } from './decks/decks.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "sqlite",
      database: "db.sqlite",
      entities: [User],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    TablesModule,
    ActionsModule,
    PlayersModule,
    GameLogicModule,
    DecksModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

