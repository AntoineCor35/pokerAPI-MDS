import { Module, forwardRef } from '@nestjs/common';
import { ActionsController } from './actions.controller';
import { ActionsService } from './actions.service';
import { PlayersModule } from '../players/players.module';
import { TablesModule } from '../tables/tables.module';

@Module({
  controllers: [ActionsController],
  imports: [
    PlayersModule, 
    forwardRef(() => TablesModule)
  ],
  providers: [ActionsService],
  exports: [ActionsService]
})
export class ActionsModule {}
