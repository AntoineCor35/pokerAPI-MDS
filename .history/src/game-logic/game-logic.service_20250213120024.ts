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

    assignPlayerPositions(table: any): any {
        //défini la position des joueurs sur la table en fonction du nombre de joueurs
    }

    assignFirstDealer(table: any): any {
        //défini le dealer sur un math.random et associe les joueurs +1 et +2 a small et big blind
    }

    rotateRole(table: any): any {
        //deplace de 1 la position du dealer de la small blind et de la big blind
        //remet la actual blind a la small blind
        //défini le joueur qui doit jouer a celui qui est la small blind
    }

}
