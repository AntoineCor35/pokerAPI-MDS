import { Injectable } from '@nestjs/common';

@Injectable()
export class PlayersActionsService {
    executeAction(player: any, action: string, amount?: number): void {
        // Exécute l'action du joueur (fold, check, call, raise)
    }

    getPossibleActions(player: any, table: any): string[] {
        // Retourne les actions possibles pour le joueur
        return [];
    }

    validateAction(player: any, action: string, amount?: number): boolean {
        // Vérifie si l'action est valide
        return true;
    }
}