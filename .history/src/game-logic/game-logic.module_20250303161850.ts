import { Module } from '@nestjs/common';
import { GameLogicService } from './game-logic.service';
import { PlayersModule } from '../players/players.module';
import { DecksModule } from '../decks/decks.module';

@Module({
    imports: [DecksModule, PlayersModule],
    providers: [GameLogicService],
    exports: [GameLogicService]
  })
  export class GameLogicModule {}