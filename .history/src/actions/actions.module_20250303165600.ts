import { Module } from '@nestjs/common';
import { ActionsController } from './actions.controller';
import { ActionsService } from './actions.service';
import { PlayersService } from '../players/players.service';
import { TablesService } from '../tables/tables.service';
import { PlayersModule } from '../players/players.module';
import { TablesModule } from '../tables/tables.module';

@Module({
  controllers: [ActionsController],
  imports: [PlayersModule, TablesModule ],
  providers: [ActionsService],
  exports: [ActionsService]
})
export class ActionsModule {}
