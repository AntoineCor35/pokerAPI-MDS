import { Injectable } from '@nestjs/common';
import { Action, ActionRequest, ActionResponse } from './action.interface';
import { PlayersService } from '../players/players.service';
import { TablesService } from '../tables/tables.service';
import { Player } from '../players/entities/players.entities';
@Injectable()
export class ActionsService {
    constructor(
        private readonly playersService: PlayersService,
        private readonly tablesService: TablesService
    ) {}

    private readonly actions: Action[] = [
        {
            name: 'fold',
            description: 'Abandon the current hand'
        },
        {
            name: 'check',
            description: 'Pass the action to next player without betting'
        },
        {
            name: 'call',
            description: 'Match the current bet amount'
        },
        {
            name: 'raise',
            description: 'Increase the current bet amount'
        },
    ];

    getActions(): Action[] {
        return this.actions;
    }

    getAvailableActions(playerId: number, tableId: number): Action[] {
        const table = this.tablesService.getTableById(tableId.toString());
        const player = table?.players.find((p: Player) => p.id === playerId);
        
        if (!table || !player) {
            return [];
        }
        
        return this.actions.map(action => ({
            ...action,
            isAvailable: this.isActionAvailable(action.name, player, table)
        }));
    }

    private isActionAvailable(actionName: string, player: any, table: any): boolean {
        if (!player.isCurrentPlayer) {
            return false;
        }
        
        if (player.hasFolded) {
            return false;
        }
        
        const currentBet = table.currentBet || 0;
        const playerBet = player.currentBet || 0;
        
        switch (actionName) {
            case 'fold':
                return currentBet > playerBet || currentBet > 0;
            
            case 'check':
                return currentBet === playerBet;
            
            case 'call':
                return currentBet > playerBet && player.chips >= (currentBet - playerBet);
            
            case 'raise':
                const minRaise = table.currentBlind;
                return player.chips >= (currentBet - playerBet + minRaise);
            
            default:
                return false;
        }
    }

    makeAction(actionRequest: ActionRequest): ActionResponse {
        const { name, playerId, amount } = actionRequest;
        const selectedAction = this.actions.find(a => a.name === name);
        
        if (!selectedAction) {
            return {
                success: false,
                message: 'Invalid action'
            };
        }

        if (!this.validateAction(name, playerId, amount)) {
            return {
                success: false,
                message: `Cannot perform action '${name}'`
            };
        }

        this.executeAction(name, playerId, amount);

        return {
            success: true,
            message: `Action '${name}' performed successfully`,
            action: selectedAction
        };
    }

    private validateAction(actionName: string, playerId: number, amount?: number): boolean {
        // Logique pour valider si l'action est possible
        // Par exemple, vérifier si le joueur a assez de jetons pour un raise
        return true;
    }

    private executeAction(actionName: string, playerId: number, amount?: number): void {
        const player = this.getPlayer(playerId);
        
        switch (actionName) {
            case 'fold':
                this.playersService.fold(player);
                break;
            case 'check':
                this.playersService.check(player);
                break;
            case 'call':
                this.playersService.call(player, amount || 0);
                break;
            case 'raise':
                this.playersService.raise(player, amount || 0);
                break;
            default:
                break;
        }
    }

    private getPlayer(playerId: number): any {
        // Récupérer les informations du joueur
        // Cette méthode pourrait appeler un service pour obtenir les détails du joueur
        return { id: playerId }; // Simplifié pour l'exemple
    }
}
