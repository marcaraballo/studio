export interface Participant {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  payerId: string;
  amount: number;
  description: string;
  splitWithParticipantIds?: string[]; // New field: IDs of participants to split this expense with
}

export interface Debt {
  from: string; // Name of participant who owes
  to: string;   // Name of participant who is owed
  amount: number;
}

export interface Balance {
  participantId: string;
  name: string; 
  balance: number; 
}
