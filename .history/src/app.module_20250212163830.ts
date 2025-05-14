import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TablesController } from './tables/tables.controller';
import { TablesService } from './tables/tables.service';
import { ActionsController } from './actions/actions.controller';
import { ActionsService } from './actions/actions.service';
import { GameLogicService } from './game-logic/game-logic.service';
import { PlayersService } from './players/players.service';
import { DecksService } from './decks/decks.service';
import { PlayersActionsService } from './players-actions/players-actions.service';

@Module({
  imports: [],
  controllers: [AppController, TablesController, ActionsController],
  providers: [AppService, TablesService, ActionsService, GameLogicService, PlayersService, DecksService, PlayersActionsService],
})
export class AppModule {}

