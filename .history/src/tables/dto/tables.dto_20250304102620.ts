import { Player } from '../../players/entities/players.entities';
import { ApiProperty } from '@nestjs/swagger';

export class CardDto {
  @ApiProperty({ description: 'The suit of the card', example: 'Heart' })
  suit: string;

  @ApiProperty({ description: 'The value of the card', example: 'A' })
  value: string;

  @ApiProperty({ description: 'The rank of the card', example: 14 })
  rank: number;
}

export class TableDto {
  @ApiProperty({ description: 'The unique identifier of the table', example: 1 })
  id: number;

  @ApiProperty({ description: 'The name of the table', example: 'High Stakes Table' })
  name: string;

  @ApiProperty({ description: 'The current status of the table', example: 'Waiting' })
  status: 'Waiting' | 'Ongoing' | 'Finished';

  @ApiProperty({ description: 'The current round number', example: 1 })
  round: number;

  @ApiProperty({ description: 'The current turn number', example: 2 })
  turn: number;

  @ApiProperty({ description: 'The current blind amount', example: 50 })
  currentBlind: number;

  @ApiProperty({ description: 'The small blind amount', example: 25 })
  smallBlind: number;

  @ApiProperty({ description: 'The big blind amount', example: 50 })
  bigBlind: number;

  @ApiProperty({ description: 'The current bet amount', example: 100 })
  currentBet: number;

  @ApiProperty({ description: 'The total pot amount', example: 500 })
  pot: number;

  @ApiProperty({ description: 'The position of the dealer', example: 3 })
  dealerPosition: number;

  @ApiProperty({ description: 'The cards on the river', type: [CardDto] })
  river: CardDto[];

  @ApiProperty({ description: 'The players at the table', type: [Player] })
  players: Player[];

  @ApiProperty({ description: 'The maximum number of players allowed', example: 9 })
  maxPlayers: number;

  @ApiProperty({ description: 'The minimum number of players required', example: 2 })
  minPlayers: number;

  @ApiProperty({ description: 'The ID of the last winner', example: 5, required: false })
  lastWinner?: number;

  @ApiProperty({ description: 'The winning hand of the last round', type: [CardDto], required: false })
  winningHand?: CardDto[];
}

export class TableJoinResponseDto {
  @ApiProperty({ description: 'Indicates if the join action was successful', example: true })
  success: boolean;

  @ApiProperty({ description: 'The table details if the join was successful', type: TableDto, required: false })
  table?: TableDto;

  @ApiProperty({ description: 'Error message if the join action failed', example: 'Table is full', required: false })
  error?: string;
}

export class TableActionResponseDto {
  @ApiProperty({ description: 'Indicates if the action was successful', example: true })
  success: boolean;

  @ApiProperty({ description: 'The table details if the action was successful', type: TableDto, required: false })
  table?: TableDto;

  @ApiProperty({ description: 'Error message if the action failed', example: 'Invalid action', required: false })
  error?: string;
} 