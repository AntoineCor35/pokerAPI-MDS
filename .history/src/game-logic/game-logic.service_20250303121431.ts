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

    private evaluateEndRound(table: any): any {
        // Déterminer le gagnant et distribuer le pot
        const activePlayers = table.players.filter(p => !p.hasFolded);
        
        if (activePlayers.length === 1) {
            // Si un seul joueur reste, il remporte le pot
            const winner = activePlayers[0];
            winner.bank += table.pot;
            table.lastWinner = winner.id;
            table.winningHand = null;
        } else {
            // Évaluer les mains et déterminer le gagnant
            // Pour simplifier, on peut implémenter une logique basique de comparaison des mains
            // Dans une version complète, vous utiliseriez un évaluateur de mains de poker
            const winner = this.determineWinner(activePlayers, table.river);
            winner.bank += table.pot;
            table.lastWinner = winner.id;
            table.winningHand = winner.hand;
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
        table.players = table.players.filter(player => player.bank > 0);
        
        // Vérifier les conditions de fin de partie
        const humanPlayers = table.players.filter(p => !p.isAI);
        const aiPlayers = table.players.filter(p => p.isAI);
        
        if (humanPlayers.length === 0 || aiPlayers.length === 0 || table.players.length < 2) {
            return {
                table,
                gameOver: true,
                message: 'Game Over'
            };
        }
        
        // Préparer le prochain round
        this.rotateDealer(table);
        this.decksService.shuffle();
        this.decksService.distribute(table.players);
        
        return this.evaluateGameState(table);
    }

    private evaluateEndTurn(table: any): any {
        table.turn += 1;
        
        // Réinitialiser les mises pour le nouveau tour
        table.players.forEach(player => {
            if (!player.hasFolded) {
                player.hasPlayed = false;
            }
        });
        
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

    private getAIAction(player: any, table: any): { type: string, amount: number } {
        const possibleActions = this.playersActionsService.getPossibleActions(player, table);
        
        // Logique simple pour l'IA - choix aléatoire parmi les actions possibles
        const actionTypes = Object.keys(possibleActions);
        const randomActionType = actionTypes[Math.floor(Math.random() * actionTypes.length)];
        
        let amount = 0;
        if (randomActionType === 'raise') {
            // Pour un raise, choisir un montant aléatoire entre le minimum et le maximum
            const minRaise = table.currentBet + table.currentBlind;
            const maxRaise = Math.min(player.bank, table.currentBet * 3);
            amount = Math.floor(Math.random() * (maxRaise - minRaise + 1)) + minRaise;
        } else if (randomActionType === 'call') {
            amount = table.currentBet - player.currentBet;
        }
        
        return { type: randomActionType, amount };
    }

    private determineWinner(players: any[], river: any[]): any {
        // Logique simplifiée pour déterminer le gagnant
        // Dans une implémentation réelle, vous utiliseriez un algorithme d'évaluation des mains de poker
        // Pour cet exemple, on choisit simplement un gagnant aléatoire
        const randomIndex = Math.floor(Math.random() * players.length);
        return players[randomIndex];
    }

    private rotateDealer(table: any): void {
        // Trouver le prochain joueur valide pour être dealer
        let newDealerPos = (table.dealerPosition + 1) % table.players.length;
        
        // Assigner les rôles
        table.dealerPosition = newDealerPos;
        this.assignBlindPositions(table);
    }

    private assignBlindPositions(table: any): void {
        const smallBlindPos = (table.dealerPosition + 1) % table.players.length;
        const bigBlindPos = (table.dealerPosition + 2) % table.players.length;
        
        // Réinitialiser les rôles précédents
        table.players.forEach(p => {
            p.role = null;
            p.isCurrentPlayer = false;
        });
        
        // Assigner les nouveaux rôles
        table.players[table.dealerPosition].role = 'dealer';
        table.players[smallBlindPos].role = 'smallBlind';
        table.players[bigBlindPos].role = 'bigBlind';
        
        // Placer les blinds
        this.playersService.placeBet(table.players[smallBlindPos], table.currentBlind);
        this.playersService.placeBet(table.players[bigBlindPos], table.currentBlind * 2);
        table.currentBet = table.currentBlind * 2;
        
        // Définir le joueur actuel (après la big blind)
        const nextPlayerPos = (bigBlindPos + 1) % table.players.length;
        table.players[nextPlayerPos].isCurrentPlayer = true;
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
    // table.players.forEach((player, index) => {
    //     player.position = index;
    // });
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

}
