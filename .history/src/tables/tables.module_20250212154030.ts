import { Module } from '@nestjs/common';
import { TablesController } from './tables.controller';
import { TablesService } from './tables.service';
import { ActionsModule } from '../actions/actions.module';

@Module({
    imports: [ActionsModule],
    controllers: [TablesController],
    providers: [TablesService],
})
export class TablesModule {}