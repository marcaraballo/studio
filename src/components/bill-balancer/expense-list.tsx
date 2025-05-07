"use client";

import type { Expense, Participant } from "@/types/bill-balancer";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface ExpenseListProps {
  expenses: Expense[];
  participants: Participant[];
  onRemoveExpense: (id: string) => void;
}

export function ExpenseList({ expenses, participants, onRemoveExpense }: ExpenseListProps) {
  const getParticipantName = (id: string) => {
    return participants.find(p => p.id === id)?.name || "Unknown";
  };

  if (expenses.length === 0) {
    return (
      <p className="text-sm text-muted-foreground mt-4 text-center py-4">
        No expenses recorded yet.
      </p>
    );
  }

  return (
    <div className="mt-2 rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Paid By</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell>{getParticipantName(expense.payerId)}</TableCell>
              <TableCell>{expense.description}</TableCell>
              <TableCell className="text-right">${expense.amount.toFixed(2)}</TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onRemoveExpense(expense.id)}
                  aria-label={`Remove expense: ${expense.description}`}
                  className="hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        {expenses.length > 5 && <TableCaption>A list of all recorded expenses.</TableCaption>}
      </Table>
    </div>
  );
}
