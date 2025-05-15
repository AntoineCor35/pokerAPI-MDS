import { Injectable } from '@nestjs/common';

@Injectable()
export class GameLogicService {
    initializeGame(table: any): any {
        return table;
    }
}