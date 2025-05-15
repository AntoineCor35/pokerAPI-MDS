import { Module } from '@nestjs/common';
import { ActionsController } from './actions.controller';
import { ActionsService } from './actions.service';
import { PlayersService } from '../players/players.service';
import { TablesService } from '../tables/tables.service';

@Module({
  controllers: [ActionsController],
  providers: [ActionsService, PlayersService, TablesService],
  exports: [ActionsService]
})
export class ActionsModule {} 