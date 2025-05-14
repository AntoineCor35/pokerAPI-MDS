import { Module } from '@nestjs/common';
import { GameLogicService } from './game-logic.service';
import { DecksService } from '../decks/decks.service';
import { PlayersService } from '../players/players.service';
import { ActionsService } from '../actions/actions.service';

@Module({
  providers: [
    GameLogicService,
    DecksService,
    PlayersService,
    ActionsService
  ],
  exports: [
    GameLogicService
  ]
})
export class GameLogicModule {}
