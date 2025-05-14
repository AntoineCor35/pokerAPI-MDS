import { Player } from '../../players/entities/players.entities';

export class CardDto {
  suit: string;
  value: string;
  rank: number;
}

export class ActionLogEntry {
  playerId: number;
  playerName: string;
  action: string;
  amount?: number;
  timestamp: Date;
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
  actionLogs: ActionLogEntry[];
}

export class TableJoinResponseDto {
  success: boolean;
  table?: TableDto;
  error?: string;
}

export class TableActionResponseDto {
  success: boolean;
  table?: TableDto;
  error?: string;
} 