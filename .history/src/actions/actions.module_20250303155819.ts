import { Module } from '@nestjs/common';
import { ActionsController } from './actions.controller';
import { ActionsService } from './actions.service';
import { PlayersService } from '../players/players.service';
import { TablesService } from '../tables/tables.service';
import { PlayersModule } from '../players/players.module';
import { TablesModule } from '../tables/tables.module';

@Module({
    imports: [PlayersModule, TablesModule], // ✅ Assure-toi que ces modules exportent leurs services
    controllers: [ActionsController],
    providers: [ActionsService], // ✅ Laisse uniquement ActionsService ici
    exports: [ActionsService]
})
export class ActionsModule {}