export class Player {
  id: number;
  name: string;
  chips: number;
  hand: Card[];
  tableId?: number;
  position: number;
  isFolded: boolean;
  isAllIn: boolean;
  currentBet: number;
  isDealer: boolean;
  isSmallBlind: boolean;
  isBigBlind: boolean;
  isActive: boolean;

  constructor(partial: Partial<Player>) {
    Object.assign(this, partial);
    this.hand = [];
    this.isFolded = false;
    this.isAllIn = false;
    this.currentBet = 0;
    this.isDealer = false;
    this.isSmallBlind = false;
    this.isBigBlind = false;
    this.isActive = true;
  }
}

export class Card {
  suit: string; // hearts, diamonds, clubs, spades
  value: string; // 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K, A
  
  constructor(suit: string, value: string) {
    this.suit = suit;
    this.value = value;
  }
}
