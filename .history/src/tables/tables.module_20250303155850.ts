import { Module } from '@nestjs/common';
import { TablesController } from './tables.controller';
import { TablesService } from './tables.service';
import { GameLogicService } from '../game-logic/game-logic.service';
import { PlayersService } from '../players/players.service';
import { DecksService } from '../decks/decks.service';

@Module({
  controllers: [TablesController],
  providers: [TablesService],
  exports: [TablesService]
})
export class TablesModule {} 