import { Module } from '@nestjs/common';
import { TablesService } from './tables.service';
import { TablesController } from './tables.controller';

@Module({
    imports: [GameLogicModule],
    controllers: [TablesController],
    providers: [TablesService],
    exports: [TablesService]
  })
  export class TablesModule {}
