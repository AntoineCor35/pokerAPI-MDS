import { Module } from '@nestjs/common';
import { DecksService } from './decks.service';

@Module({
  providers: [DecksService],
  exports: [DecksService]
})
export class DecksModule {}
