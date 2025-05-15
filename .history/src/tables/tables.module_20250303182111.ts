import { Module, forwardRef } from '@nestjs/common';
import { TablesController } from './tables.controller';
import { TablesService } from './tables.service';
import { GameLogicModule } from '../game-logic/games-logic.module';

@Module({
  controllers: [TablesController],
  imports: [
    forwardRef(() => GameLogicModule)
  ],
  providers: [TablesService],
  exports: [TablesService]
})
export class TablesModule { }
