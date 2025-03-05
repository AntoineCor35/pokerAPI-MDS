import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { ActionDto, ActionRequestDto, ActionResponseDto } from './dto/action.dto';
import { PlayersService } from '../players/players.service';
import { TablesService } from '../tables/tables.service';
import { Player } from '../players/entities/players.entities';
import { TableDto } from '../tables/dto/tables.dto';
import { Table } from 'typeorm';

@Injectable()
export class ActionsService {
    private actions: ActionDto[] = [
        { name: 'fold', description: 'Abandonner la main' },
        { name: 'check', description: 'Passer son tour' },
        { name: 'call', description: 'Suivre la mise' },
        { name: 'raise', description: 'Relancer la mise' }
    ];

    constructor(
        private readonly playersService: PlayersService,
        @Inject(forwardRef(() => TablesService))
        private readonly tablesService: TablesService,
    ) {}

    getActions(): ActionDto[] {
        return this.actions;
    }

    getAvailableActions(playerId: number, tableId: number): ActionDto[] {
        const table = this.tablesService.getTableById(tableId.toString());
        const player = table?.players.find((p: Player) => p.id === playerId);
        
        if (!table || !player) {
            return [];
        }
        
        const possibleActions = this.getPossibleActions(player, table);
        
        return this.actions.filter(action => possibleActions.includes(action.name))
            .map(action => ({
                ...action,
                isAvailable: true
            }));
    }

    executeAction(player: Player, action: string, table: TableDto, amount?: number): void {
        switch (action) {
            case 'fold':
                this.playersService.fold(player);
                break;
            case 'check':
                this.playersService.check(player, table);
                break;
            case 'call':
                this.playersService.call(player, table);
                break;
            case 'raise':
                this.playersService.raise(player, amount || 0, table);
                break;
            default:
                throw new Error(`Action non reconnue: ${action}`);
        }
    }

    getPossibleActions(player: Player, table: TableDto): string[] {
        const possibleActions: string[] = [];
        
        if (!player.isCurrentPlayer || player.hasFolded) {
            return possibleActions;
        }
        
        const currentBet = table.currentBet || 0;
        const playerBet = player.currentBet || 0;
        
        if (currentBet > playerBet || currentBet > 0) {
            possibleActions.push('fold');
        }
        
        if (currentBet === playerBet) {
            possibleActions.push('check');
        }
        
        if (currentBet > playerBet && player.chips >= (currentBet - playerBet)) {
            possibleActions.push('call');
        }
        
        const minRaise = table.currentBlind;
        if (player.chips >= (currentBet - playerBet + minRaise) && !player.hasAlreadyRaise) {
            possibleActions.push('raise');
        }
        return possibleActions;
    }
}

