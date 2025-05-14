import { Module, forwardRef } from '@nestjs/common';
import { GameLogicService } from './game-logic.service';
import { PlayersModule } from '../players/players.module';
import { DecksModule } from '../decks/decks.module';
import { ActionsModule } from '../actions/actions.module';
import { TablesModule } from '../tables/tables.module';

@Module({
    imports: [DecksModule, PlayersModule, forwardRef(() => ActionsModule)],
    providers: [GameLogicService],
    exports: [GameLogicService]
  })
  export class GameLogicModule {}