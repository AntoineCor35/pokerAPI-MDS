import { Injectable } from '@nestjs/common';
import { Player } from './entities/players.entities';
import { TableDto } from 'src/tables/dto/tables.dto';

@Injectable()
export class PlayersService {
    placeBet(player: Player, bet: number, table: TableDto): void {
        // Vérifie si le joueur a assez d'argent
        if(player.chips < bet){
            //this.fold(player);
            throw new Error("vous etes trop pauvre pour parier");
        } 
        player.chips -= bet;
        player.currentBet+= bet;
        table.pot += bet;
    }

    fold(player: Player): void {
        // Met le statut hasFolded du joueur à true
        player.hasFolded = true;
        // Marque le joueur comme ayant joué son tour
        player.hasPlayed = true;
    }

    check(player: Player, table: TableDto): void {
        // Vérifie si le check est possible
        if(player.currentBet !== table.currentBet){
            throw new Error("votre mise n'est pas egale a la mise la plus haute de la table")
        }
        // Enregistre l'action
        player.hasPlayed = true;
    }

    call(player: Player, table: TableDto): void {
        // Vérifie si le call est possible
        if(player.currentBet == table.currentBet){
            throw new Error("votre mise est déjà egale a la mise la plus haute de la table")
        }

        let call = table.currentBet - player.currentBet;
        if(call <= 0){
            throw new Error("votre mise est plus haute que le currentBet de la table")
        }
        this.placeBet(player, call, table);
        player.hasPlayed = true;
    }

    raise(player: Player, raise: number , table: TableDto): number {
        this.placeBet(player, raise, table);
        table.pot += raise;
        // Marque le joueur comme ayant joué son tour
        player.hasPlayed = true;
        // Met à jour le currentBet de la table et le retourne
        return table.currentBet+= raise;
    }

    IsAllIn(player: Player, table: TableDto): boolean{
        if(player.chips <= 0){
            throw new Error("sans chips vous ne pouvez pas faire tapis")
        }
        table.currentBet+= player.chips;
        table.pot += player.chips;
        this.placeBet(player, player.chips, table);
        // Marque le joueur comme ayant joué son tour
        player.hasPlayed = true;
        return player.isAllIn = true;
    }

    showCards(player: Player): any {
        // Retourne les cartes du joueur
        return player.hand;
    }

}