import { Module } from '@nestjs/common';
import { TablesController } from './tables.controller';
import { TablesService } from './tables.service';
import { GameLogicService } from '../game-logic/game-logic.service';
import { DecksService } from '../decks/decks.service';

@Module({
  controllers: [TablesController],
  providers: [TablesService, GameLogicService, DecksService],
  exports: [TablesService]
})
export class TablesModule { }
