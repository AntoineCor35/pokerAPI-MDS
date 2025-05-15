import { Injectable } from '@nestjs/common';

@Injectable()
export class PlayersService {
    placeBet(player: any, amount: number): void {
        // Vérifie si le joueur a assez d'argent
        // Retire le montant de la bank du joueur
    }

    fold(player: any): void {
        // Met le statut fold du joueur à true
    }

    check(player: any): void {
        // Vérifie si le check est possible
        // Enregistre l'action
    }

    call(player: any, amount: number): void {
        // Vérifie si le call est possible
        // Appelle placeBet avec le montant nécessaire
    }

    raise(player: any, amount: number): void {
        // Vérifie si le raise est possible
        // Appelle placeBet avec le nouveau montant
    }

    showCards(player: any): any {
        // Retourne les cartes du joueur
        return player.hand;
    }
}