import { Injectable } from '@nestjs/common';
import { Player } from '../players/entities/players.entities';
import { PlayersService } from '../players/players.service';
import { Table } from '../tables/interfaces/tables.interface';

@Injectable()
export class PlayersActionsService {
    constructor(private readonly playersService: PlayersService) {}

    executeAction(player: Player, action: string, amount?: number): void {
        // Exécute l'action du joueur (fold, check, call, raise)
        switch (action) {
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
                throw new Error(`Action non reconnue: ${action}`);
        }
    }

    getPossibleActions(player: Player, table: Table): string[] {
        // Retourne les actions possibles pour le joueur
        const possibleActions: string[] = [];
        
        if (!player.isCurrentPlayer || player.hasFolded) {
            return possibleActions;
        }
        
        const currentBet = table.currentBet || 0;
        const playerBet = player.currentBet || 0;
        
        // Fold est toujours possible si le joueur doit mettre de l'argent
        if (currentBet > playerBet || currentBet > 0) {
            possibleActions.push('fold');
        }
        
        // Check est possible si le joueur a déjà misé le montant actuel
        if (currentBet === playerBet) {
            possibleActions.push('check');
        }
        
        // Call est possible si le joueur a assez de jetons pour suivre
        if (currentBet > playerBet && player.chips >= (currentBet - playerBet)) {
            possibleActions.push('call');
        }
        
        // Raise est possible si le joueur a assez de jetons pour relancer
        const minRaise = table.currentBlind;
        if (player.chips >= (currentBet - playerBet + minRaise)) {
            possibleActions.push('raise');
        }
        
        return possibleActions;
    }

    validateAction(player: Player, action: string, amount?: number): boolean {
        // Vérifie si l'action est valide
        if (!player || !action) {
            return false;
        }
        
        if (player.hasFolded) {
            return false;
        }
        
        switch (action) {
            case 'fold':
                return true; // Fold est toujours valide
                
            case 'check':
                // Check est valide si le joueur n'a pas besoin de mettre plus d'argent
                return player.currentBet === player.currentBet;
                
            case 'call':
                // Call est valide si le joueur a assez de jetons
                return player.chips >= (amount || 0);
                
            case 'raise':
                // Raise est valide si le montant est spécifié et si le joueur a assez de jetons
                return !!amount && player.chips >= amount;
                
            default:
                return false;
        }
    }
}