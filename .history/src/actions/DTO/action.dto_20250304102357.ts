export class ActionDto {
  name: string;
  description: string;
  isAvailable?: boolean;
  minAmount?: number;
  maxAmount?: number;
}

export class ActionRequestDto {
  name: string;
  playerId: number;
  amount?: number;
}

export class ActionResponseDto {
  success: boolean;
  message: string;
  action?: ActionDto;
} 