import { Module } from '@nestjs/common';
import { ActionsController } from './actions.controller';
import { ActionsService } from './actions.service';
import { TablesModule } from '../tables/tables.module';
import { PlayersModule } from '../players/players.module';
import { forwardRef } from '@nestjs/common';
@Module({
    imports: [PlayersModule, forwardRef(() => TablesModule)],
    controllers: [ActionsController],
    providers: [ActionsService],
    exports: [ActionsService]
})
export class ActionsModule {}
