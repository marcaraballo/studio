import type { Participant, Expense, Debt, Balance } from '@/types/bill-balancer';

export function calculateDebts(participants: Participant[], expenses: Expense[]): Debt[] {
  if (participants.length === 0 && expenses.length > 0) {
    // Edge case: expenses exist but no participants to assign them to for debt calculation
    return [];
  }
  if (participants.length < 1) { // Allow calculations even for a single participant (they'd owe themselves nothing)
    return [];
  }


  const participantMap = new Map(participants.map(p => [p.id, p.name]));
  const balances: Map<string, number> = new Map();

  // Initialize balances for all participants
  for (const p of participants) {
    balances.set(p.id, 0);
  }

  // Process each expense
  for (const expense of expenses) {
    if (!participantMap.has(expense.payerId)) {
      continue; // Skip expense if payer is not a valid participant
    }

    // Credit the payer
    const payerCurrentBalance = balances.get(expense.payerId) || 0;
    balances.set(expense.payerId, payerCurrentBalance + expense.amount);

    // Determine who shares this expense
    let sharingParticipantIds: string[];
    if (expense.splitWithParticipantIds && expense.splitWithParticipantIds.length > 0) {
      // Use specified participants, filtering out any who are no longer valid
      sharingParticipantIds = expense.splitWithParticipantIds.filter(id => participantMap.has(id));
    } else {
      // Default: split among all current participants
      sharingParticipantIds = participants.map(p => p.id);
    }

    // If there are participants to share the expense with, debit them
    if (sharingParticipantIds.length > 0) {
      const sharePerSplitParticipant = expense.amount / sharingParticipantIds.length;
      for (const sharedById of sharingParticipantIds) {
        const participantCurrentBalance = balances.get(sharedById) || 0;
        balances.set(sharedById, participantCurrentBalance - sharePerSplitParticipant);
      }
    }
    // If sharingParticipantIds is empty (e.g. all selected for split were removed, and default was not used),
    // the expense amount remains credited to the payer, and no one else is debited for it.
    // This is effectively the payer covering the cost themselves.
  }

  // Consolidate balances into a list of Balance objects
  const finalBalances: Balance[] = [];
  for (const [participantId, balanceAmount] of balances.entries()) {
    // Only consider significant balances to avoid floating point issues with tiny amounts
    if (Math.abs(balanceAmount) > 0.001) {
      finalBalances.push({
        participantId: participantId,
        name: participantMap.get(participantId) || "Unknown Participant", // Fallback name
        balance: balanceAmount,
      });
    }
  }
  
  // Separate into those who owe (negative balance) and those who are owed (positive balance)
  const owers = finalBalances.filter(b => b.balance < 0).map(b => ({ ...b, balance: -b.balance })).sort((a, b) => b.balance - a.balance);
  const payers = finalBalances.filter(b => b.balance > 0).sort((a, b) => b.balance - a.balance);

  // Calculate debts by settling amounts between owers and payers
  const debts: Debt[] = [];
  let owerIndex = 0;
  let payerIndex = 0;

  while (owerIndex < owers.length && payerIndex < payers.length) {
    const ower = owers[owerIndex];
    const payer = payers[payerIndex];
    const amountToSettle = Math.min(ower.balance, payer.balance);

    if (amountToSettle > 0.001) { // Ensure meaningful debt amount
        debts.push({
          from: ower.name,
          to: payer.name,
          amount: amountToSettle,
        });
    }

    ower.balance -= amountToSettle;
    payer.balance -= amountToSettle;

    if (ower.balance < 0.01) { // Move to next ower if settled
      owerIndex++;
    }
    if (payer.balance < 0.01) { // Move to next payer if settled
      payerIndex++;
    }
  }

  return debts;
}
