import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameLogService } from './game-log.service';
import { GameLog } from './entities/game-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GameLog])],
  providers: [GameLogService],
  exports: [GameLogService]
})
export class GameLogModule {} 