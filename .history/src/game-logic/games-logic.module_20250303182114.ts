import { Module, forwardRef } from '@nestjs/common';
import { GameLogicService } from './game-logic.service';
import { DecksModule } from '../decks/decks.module';
import { PlayersModule } from '../players/players.module';
import { ActionsModule } from '../actions/actions.module';

@Module({
  imports: [
    DecksModule,
    PlayersModule,
    forwardRef(() => ActionsModule)
  ],
  providers: [
    GameLogicService
  ],
  exports: [
    GameLogicService
  ]
})
export class GameLogicModule {}
