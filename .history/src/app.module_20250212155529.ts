import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TablesController } from './tables/tables.controller';
import { TablesService } from './tables/tables.service';
import { ActionsController } from './actions/actions.controller';
import { ActionsService } from './actions/actions.service';
import { GameLogicController } from './game-logic/game-logic.controller';

@Module({
  imports: [],
  controllers: [AppController, TablesController, ActionsController, GameLogicController],
  providers: [AppService, TablesService, ActionsService],
})
export class AppModule {}
