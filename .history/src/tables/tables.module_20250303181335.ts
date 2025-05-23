import { Module } from '@nestjs/common';
import { TablesController } from './tables.controller';
import { TablesService } from './tables.service';


@Module({
  controllers: [TablesController],
  providers: [TablesService],
  exports: [TablesService]
})
export class TablesModule { }
