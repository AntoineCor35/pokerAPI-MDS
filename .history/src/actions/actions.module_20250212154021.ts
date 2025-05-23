import { Module } from '@nestjs/common';
import { ActionsController } from './actions.controller';
import { ActionsService } from './actions.service';

@Module({
    imports: [TablesModule],
    controllers: [ActionsController],
    providers: [ActionsService],
})
export class ActionsModule {}       