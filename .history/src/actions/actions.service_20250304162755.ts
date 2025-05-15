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
        private readonly tablesService: TablesService
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

    makeAction(actionRequest: ActionRequestDto): ActionResponseDto {
        const { name, playerId, amount } = actionRequest;
        const selectedAction = this.actions.find(a => a.name === name);
        
        if (!selectedAction) {
            return { success: false, message: 'Action invalide' };
        }

        const player = this.getPlayer(playerId);
        const table = this.getPlayerTable(playerId);
        
        if (!this.validateAction(player, name, amount)) {
            return { success: false, message: `Impossible d'effectuer l'action '${name}'` };
        }

        this.executeAction(player, name, table, amount);

        return {
            success: true,
            message: `Action '${name}' effectuée avec succès`,
            action: selectedAction
        };
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
                this.playersService.call(player, amount || 0);
                break;
            case 'raise':
                this.playersService.raise(player, amount || 0);
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
        if (player.chips >= (currentBet - playerBet + minRaise)) {
            possibleActions.push('raise');
        }
        console.log('possibleActions', possibleActions);
        return possibleActions;
    }

    validateAction(player: Player, action: string, amount?: number): boolean {
        if (!player || !action) {
            return false;
        }
        
        if (player.hasFolded) {
            return false;
        }
        
        switch (action) {
            case 'fold':
                return true;
                
            case 'check':
                return player.currentBet === player.currentBet;
                
            case 'call':
                return player.chips >= (amount || 0);
                
            case 'raise':
                return !!amount && player.chips >= amount;
                
            default:
                return false;
        }
    }

    private getPlayer(playerId: number): Player {
        return { id: playerId } as Player;
    }

    private getPlayerTable(playerId: number): TableDto {
        return {} as TableDto;
    }
}
function getTableById() {
    throw new Error('Function not implemented.');
}

