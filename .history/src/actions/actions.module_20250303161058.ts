import { Module } from '@nestjs/common';
import { ActionsController } from './actions.controller';
import { ActionsService } from './actions.service';
import { TablesModule } from '../tables/tables.module';
import { PlayersModule } from '../players/players.module'; // Ajoute cette ligne

@Module({
    imports: [PlayersModule, TablesModule], // Ajoute PlayersModule ici
    controllers: [ActionsController],
    providers: [ActionsService], // Supprime PlayersService et TablesService ici
    exports: [ActionsService]
})
export class ActionsModule {}
