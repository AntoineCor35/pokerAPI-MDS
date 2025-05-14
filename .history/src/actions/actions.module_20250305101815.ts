import { Module, forwardRef } from '@nestjs/common';
import { ActionsService } from './actions.service';
import { PlayersModule } from '../players/players.module';
import { TablesModule } from '../tables/tables.module';

@Module({
  imports: [
    PlayersModule, 
    forwardRef(() => TablesModule)
  ],
  providers: [ActionsService],
  exports: [ActionsService]
})
export class ActionsModule {}
