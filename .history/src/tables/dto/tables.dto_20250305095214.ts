import { Player } from '../../players/entities/players.entities';

export class CardDto {
  suit: string;
  value: string;
  rank: number;
}

export class TableDto {
  id: number;
  name: string;
  status: 'Waiting' | 'Ongoing' | 'Finished';
  round: number;
  turn: number;
  currentBlind: number;
  smallBlind: number;
  bigBlind: number;
  currentBet: number;
  pot: number;
  dealerPosition: number;
  river: CardDto[];
  players: Player[];
  maxPlayers: number;
  minPlayers: number;
  lastWinner?: number;
  winningHand?: CardDto[];
}

export class TableJoinResponseDto {
  success: boolean;
  error?: string;
  table?: TableDto;
  currentPlayer?: any;
  possibleActions?: any;
}

export class TableActionResponseDto {
  success: boolean;
  error?: string;
  table?: TableDto;
  currentPlayer?: any;
  possibleActions?: any;
} 