export interface Action {
  name: string;
  description: string;
  isAvailable?: boolean;
  minAmount?: number;
  maxAmount?: number;
}

export interface ActionRequest {
  name: string;
  playerId: number;
  amount?: number;
}

export interface ActionResponse {
  success: boolean;
  message: string;
  action?: Action;
} 