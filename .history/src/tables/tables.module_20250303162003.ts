import { Module } from '@nestjs/common';
import { TablesService } from './tables.service';
import { TablesController } from './tables.controller';
import { GameLogicModule } from '../game-logic/game-logic.module';
import { forwardRef } from '@nestjs/common';
@Module({
    imports: [forwardRef(() => GameLogicModule)],
    controllers: [TablesController],
    providers: [TablesService],
    exports: [TablesService]
  })
  export class TablesModule {}
