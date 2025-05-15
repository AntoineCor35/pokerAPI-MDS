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
        //check si les conditions de fin de round sont remplies
        //répartie les gains
        //incremente le round
        //remet le turn à 1
        //check si les joueurs non IA sont toujours dans la table/ont l'argent pour jouer - si non -> retire le joueur de la table
        //check si il reste des joueurs non IA sur la table -> si non -> fin de la partie
        //check si des joueurs IA sont a 0 en bank -> retire le joueur de la table
        //check si il reste des joueurs IA sur la table -> si non -> fin de la partie
        //check si il reste des joueurs sur la table -> si non -> fin de la partie
    }

    evaluateEndTurn(table: any): any {
        //check si les conditions de fin de tour sont remplies
        //increment le turn
        //lance le tour suivant -> turn 2 / turn 3 / turn 4
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

}
