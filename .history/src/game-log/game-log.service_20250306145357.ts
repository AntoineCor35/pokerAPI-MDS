import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameLog } from './entities/game-log.entity';

@Injectable()
export class GameLogService {
    constructor(
        @InjectRepository(GameLog)
        private gameLogRepository: Repository<GameLog>,
    ) {}

    async addLogEntry(tableId: number, type: 'action' | 'turn' | 'round' | 'cards' | 'pot', message: string, data?: any): Promise<GameLog> {
        const logEntry = this.gameLogRepository.create({
            tableId,
            type,
            message,
            data,
            timestamp: new Date()
        });
        
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        return this.gameLogRepository.save(logEntry);
    }

    async getLogsByTableId(tableId: number): Promise<GameLog[]> {
        return this.gameLogRepository.find({
            where: { tableId },
            order: { timestamp: 'ASC' }
        });
    }
} 