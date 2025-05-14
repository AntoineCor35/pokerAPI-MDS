import { Injectable } from '@nestjs/common';
import { DecksService } from '../decks/decks.service';
import { PlayersService } from '../players/players.service';
import { PlayersActionsService } from '../players-actions/players-actions.service';

@Injectable()
export class GameLogicService {
    constructor(
        private readonly decksService: DecksService,
        private readonly playersService: PlayersService,
        private readonly playersActionsService: PlayersActionsService,
    ) {}

    initializeGame(table: any): any {
        table.pot = 0;
        this.assignPlayerPositions(table);
        this.assignFirstDealer(table);
        
        this.decksService.shuffle();
        this.decksService.distribute(table.players);
        
        table.round = 1;
        table.turn = 1;
        
        return this.evaluateGameState(table);
    }

    evaluateGameState(table: any): any {
        // Vérifier si le round est terminé
        if (this.isRoundComplete(table)) {
            return this.evaluateEndRound(table);
        }

        // Vérifier si le tour est terminé
        if (this.isTurnComplete(table)) {
            return this.evaluateEndTurn(table);
        }

        // Déterminer le joueur actuel
        const currentPlayer = this.getCurrentPlayer(table);
        
        // Obtenir les actions possibles pour le joueur
        const possibleActions = this.playersActionsService.getPossibleActions(currentPlayer, table);

        // Si c'est une IA
        if (currentPlayer.isAI) {
            const action = this.getAIAction(currentPlayer, table);
            this.playersActionsService.executeAction(currentPlayer, action.type, action.amount);
            return this.evaluateGameState(table);
        }

        // Si c'est un joueur humain, renvoyer l'état du jeu et les actions possibles
        return {
            table,
            currentPlayer,
            possibleActions
        };
    }

    private isRoundComplete(table: any): boolean {
        // Un round est complet si :
        // - Tous les joueurs sauf un ont fold
        // - Tous les joueurs actifs ont misé le même montant et le tour est terminé
        const activePlayers = table.players.filter(p => !p.hasFolded);
        if (activePlayers.length === 1) return true;
        
        const allBetsEqual = activePlayers.every(p => p.currentBet === table.currentBet);
        return allBetsEqual && table.turn === 4;
    }

    private isTurnComplete(table: any): boolean {
        // Un tour est complet si tous les joueurs actifs ont joué et ont misé le même montant
        const activePlayers = table.players.filter(p => !p.hasFolded);
        return activePlayers.every(p => p.currentBet === table.currentBet);
    }

    private getCurrentPlayer(table: any): any {
        return table.players.find(p => p.isCurrentPlayer);
    }

    evaluateEndRound(table: any): any {
        // Déterminer le(s) gagnant(s)
        const activePlayers = table.players.filter(p => !p.hasFolded);
        
        // Si un seul joueur reste (tous les autres ont fold)
        if (activePlayers.length === 1) {
            const winner = activePlayers[0];
            winner.bank += table.pot;
            table.lastWinner = winner.id;
        } else {
            // Évaluer les mains et déterminer le(s) gagnant(s)
            // Note: Vous aurez besoin d'implémenter une logique d'évaluation des mains
            // ou d'utiliser une bibliothèque pour cela
            const winners = this.evaluateHands(activePlayers, table.river);
            
            // Répartir le pot entre les gagnants
            const winAmount = Math.floor(table.pot / winners.length);
            winners.forEach(winner => {
                winner.bank += winAmount;
            });
            
            table.lastWinners = winners.map(w => w.id);
        }
        
        // Réinitialiser pour le prochain round
        table.pot = 0;
        table.round += 1;
        table.turn = 1;
        table.river = [];
        table.currentBet = 0;
        
        // Réinitialiser l'état des joueurs
        table.players.forEach(player => {
            player.cards = [];
            player.hasFolded = false;
            player.currentBet = 0;
        });
        
        // Vérifier si des joueurs doivent être retirés (plus d'argent)
        table.players = table.players.filter(player => player.bank >= table.currentBlind * 2);
        
        // Vérifier s'il reste assez de joueurs pour continuer
        if (table.players.length < 2) {
            return { gameOver: true, table };
        }
        
        // Vérifier s'il reste des joueurs non-IA
        const humanPlayers = table.players.filter(p => !p.isAI);
        if (humanPlayers.length === 0) {
            return { gameOver: true, table };
        }
        
        // Préparer le prochain round
        this.rotateRole(table);
        this.decksService.shuffle();
        this.decksService.distribute(table.players);
        
        // Placer les blinds
        const smallBlindPlayer = table.players.find(p => p.role === 'smallBlind');
        const bigBlindPlayer = table.players.find(p => p.role === 'bigBlind');
        
        this.playersService.placeBet(smallBlindPlayer, table.currentBlind);
        this.playersService.placeBet(bigBlindPlayer, table.currentBlind * 2);
        table.currentBet = table.currentBlind * 2;
        
        return this.evaluateGameState(table);
    }

    evaluateEndTurn(table: any): any {
        // Réinitialiser l'état des joueurs pour le prochain tour
        table.players.forEach(player => {
            if (!player.hasFolded) {
                player.hasPlayed = false;
            }
        });
        
        // Passer au tour suivant
        table.turn += 1;
        
        // Exécuter la logique spécifique au tour
        switch (table.turn) {
            case 2:
                return this.turnTwo(table);
            case 3:
                return this.turnThree(table);
            case 4:
                return this.turnFour(table);
            default:
                return this.evaluateGameState(table);
        }
    }

    turnTwo(table: any): any {
        this.decksService.burn();
        table.river = this.decksService.dealFlop();
        this.rotateRole(table);
        return this.evaluateGameState(table);
    }

    turnThree(table: any): any {
        this.decksService.burn();
        const turnCard = this.decksService.dealTurn();
        table.river.push(turnCard);
        this.rotateRole(table);
        return this.evaluateGameState(table);
    }
    
    turnFour(table: any): any {
        this.decksService.burn();
        const riverCard = this.decksService.dealRiver();
        table.river.push(riverCard);
        this.rotateRole(table);
        return this.evaluateGameState(table);
    }
      

    // ... existing code ...

assignPlayerPositions(table: any): void {
    table.players.forEach((player, index) => {
        player.position = index;
    });
}

assignFirstDealer(table: any): void {
    const randomIndex = Math.floor(Math.random() * table.players.length);
    table.dealerPosition = randomIndex;
    
    // Assigner small blind et big blind
    const smallBlindPos = (randomIndex + 1) % table.players.length;
    const bigBlindPos = (randomIndex + 2) % table.players.length;
    
    table.players[smallBlindPos].role = 'smallBlind';
    table.players[bigBlindPos].role = 'bigBlind';
    
    // Placer les blinds
    this.playersService.placeBet(table.players[smallBlindPos], table.currentBlind);
    this.playersService.placeBet(table.players[bigBlindPos], table.currentBlind * 2);
}

rotateRole(table: any): void {
    table.dealerPosition = (table.dealerPosition + 1) % table.players.length;
    
    const smallBlindPos = (table.dealerPosition + 1) % table.players.length;
    const bigBlindPos = (table.dealerPosition + 2) % table.players.length;
    
    // Réinitialiser les rôles précédents
    table.players.forEach(p => p.role = null);
    
    // Assigner les nouveaux rôles
    table.players[table.dealerPosition].role = 'dealer';
    table.players[smallBlindPos].role = 'smallBlind';
    table.players[bigBlindPos].role = 'bigBlind';
    
    // Définir le joueur actuel (après la big blind)
    const nextPlayerPos = (bigBlindPos + 1) % table.players.length;
    table.players.forEach(p => p.isCurrentPlayer = false);
    table.players[nextPlayerPos].isCurrentPlayer = true;
}

// Méthode pour évaluer les mains des joueurs (à implémenter ou utiliser une bibliothèque)
private evaluateHands(players: any[], communityCards: any[]): any[] {
    // Cette méthode devrait comparer les mains des joueurs et retourner le(s) gagnant(s)
    // Pour l'instant, retournons simplement le premier joueur comme gagnant
    // Vous devrez implémenter une vraie logique d'évaluation des mains de poker
    return [players[0]];
}

private getAIAction(player: any, table: any): { type: string, amount: number } {
    // Logique simple pour l'IA
    const possibleActions = this.playersActionsService.getPossibleActions(player, table);
    
    // Stratégie basique: check/call si possible, sinon fold
    if (possibleActions.includes('check')) {
        return { type: 'check', amount: 0 };
    } else if (possibleActions.includes('call')) {
        const callAmount = table.currentBet - player.currentBet;
        return { type: 'call', amount: callAmount };
    } else {
        return { type: 'fold', amount: 0 };
    }
    
    // Pour une IA plus avancée, vous pourriez ajouter une logique de raise basée sur
    // la force de la main, la position, etc.
}

}
