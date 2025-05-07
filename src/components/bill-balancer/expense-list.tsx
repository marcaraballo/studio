"use client";

import type { Expense, Participant } from "@/types/bill-balancer";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


interface ExpenseListProps {
  expenses: Expense[];
  participants: Participant[];
  onRemoveExpense: (id: string) => void;
}

export function ExpenseList({ expenses, participants, onRemoveExpense }: ExpenseListProps) {
  const getParticipantName = (id: string) => {
    return participants.find(p => p.id === id)?.name || "Unknown";
  };

  const getSplitWithNames = (expense: Expense): string => {
    if (!expense.splitWithParticipantIds || expense.splitWithParticipantIds.length === 0) {
      return "All participants";
    }
    const names = expense.splitWithParticipantIds
      .map(id => participants.find(p => p.id === id)?.name)
      .filter(name => !!name) as string[];
    
    if (names.length === 0) return "Selected participants (removed)"; // Or some other placeholder if all selected were removed
    if (names.length === participants.length) return "All participants"; // If all current participants are selected

    return names.join(", ");
  };


  if (expenses.length === 0) {
    return (
      <p className="text-sm text-muted-foreground mt-4 text-center py-4">
        No expenses recorded yet.
      </p>
    );
  }

  return (
    <TooltipProvider>
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
                <TableCell>
                  {expense.description}
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <p className="text-xs text-muted-foreground cursor-default truncate hover:overflow-visible hover:whitespace-normal">
                        Split with: {getSplitWithNames(expense)}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" align="start" className="max-w-xs">
                      <p className="text-sm">
                        This expense is split with: {getSplitWithNames(expense)}.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
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
    </TooltipProvider>
  );
}
