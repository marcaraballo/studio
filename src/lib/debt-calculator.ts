import type { Participant, Expense, Debt, Balance } from '@/types/bill-balancer';

export function calculateDebts(participants: Participant[], expenses: Expense[]): Debt[] {
  if (participants.length < 2) {
    return [];
  }

  const participantMap = new Map(participants.map(p => [p.id, p.name]));
  const balances: Map<string, number> = new Map();

  for (const p of participants) {
    balances.set(p.id, 0);
  }

  const validExpenses = expenses.filter(expense => participantMap.has(expense.payerId));

  for (const expense of validExpenses) {
    const currentPayerBalance = balances.get(expense.payerId) || 0;
    balances.set(expense.payerId, currentPayerBalance + expense.amount);
  }

  const totalExpenses = validExpenses.reduce((sum, e) => sum + e.amount, 0);
  const sharePerPerson = totalExpenses / participants.length;

  const finalBalances: Balance[] = [];
  for (const p of participants) {
    const amountSpent = balances.get(p.id) || 0;
    const balanceAmount = amountSpent - sharePerPerson;
    // Only consider significant balances to avoid floating point issues with tiny amounts
    if (Math.abs(balanceAmount) > 0.001) {
      finalBalances.push({
        participantId: p.id,
        name: p.name,
        balance: balanceAmount,
      });
    }
  }
  
  const owers = finalBalances.filter(b => b.balance < 0).map(b => ({ ...b, balance: -b.balance })).sort((a, b) => b.balance - a.balance);
  const payers = finalBalances.filter(b => b.balance > 0).sort((a, b) => b.balance - a.balance);

  const debts: Debt[] = [];
  let owerIndex = 0;
  let payerIndex = 0;

  while (owerIndex < owers.length && payerIndex < payers.length) {
    const ower = owers[owerIndex];
    const payer = payers[payerIndex];
    const amountToSettle = Math.min(ower.balance, payer.balance);

    if (amountToSettle > 0.001) { // Check again to ensure meaningful debt
        debts.push({
          from: ower.name,
          to: payer.name,
          amount: amountToSettle,
        });
    }

    ower.balance -= amountToSettle;
    payer.balance -= amountToSettle;

    if (ower.balance < 0.01) {
      owerIndex++;
    }
    if (payer.balance < 0.01) {
      payerIndex++;
    }
  }

  return debts;
}
