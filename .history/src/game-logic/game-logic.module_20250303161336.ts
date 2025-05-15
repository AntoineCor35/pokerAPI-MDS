import { Module } from '@nestjs/common';
import { GameLogicService } from './game-logic.service';
import { PlayersModule } from '../players/players.module';
import { TablesModule } from '../tables/tables.module';

@Module({
  imports: [PlayersModule, TablesModule],
  providers: [GameLogicService],
  exports: [GameLogicService],
})
export class GameLogicModule {}
