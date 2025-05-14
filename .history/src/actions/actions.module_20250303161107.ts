import { Module } from '@nestjs/common';
import { ActionsController } from './actions.controller';
import { ActionsService } from './actions.service';
import { TablesModule } from '../tables/tables.module';
import { PlayersModule } from '../players/players.module';

@Module({
    imports: [PlayersModule, TablesModule],
    controllers: [ActionsController],
    providers: [ActionsService],
    exports: [ActionsService]
})
export class ActionsModule {}
