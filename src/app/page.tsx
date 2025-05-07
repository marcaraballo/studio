"use client";

import * as React from "react";
import { AppLogo } from "@/components/bill-balancer/icons";
import { ParticipantForm } from "@/components/bill-balancer/participant-form";
import { ParticipantList } from "@/components/bill-balancer/participant-list";
import { ExpenseForm } from "@/components/bill-balancer/expense-form";
import { ExpenseList } from "@/components/bill-balancer/expense-list";
import { DebtSummary } from "@/components/bill-balancer/debt-summary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calculator, Users, ReceiptText, Trash2 } from "lucide-react";
import type { Participant, Expense, Debt } from "@/types/bill-balancer";
import { calculateDebts } from "@/lib/debt-calculator";
import { useToast } from "@/hooks/use-toast";

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2, 9);

export default function BillBalancerPage() {
  const [participants, setParticipants] = React.useState<Participant[]>([]);
  const [expenses, setExpenses] = React.useState<Expense[]>([]);
  const [debts, setDebts] = React.useState<Debt[]>([]);
  const { toast } = useToast();

  const handleAddParticipant = (name: string) => {
    const newParticipant: Participant = { id: generateId(), name };
    setParticipants((prev) => [...prev, newParticipant]);
    // Automatically recalculate debts when participants change might be too aggressive.
    // Let user click "Calculate" button.
    setDebts([]); // Clear previous debts
  };

  const handleRemoveParticipant = (id: string) => {
    const participantToRemove = participants.find(p => p.id === id);
    setParticipants((prev) => prev.filter((p) => p.id !== id));
    // Remove expenses paid by this participant
    setExpenses((prev) => prev.filter((e) => e.payerId !== id));
    setDebts([]); // Clear previous debts
    if (participantToRemove) {
      toast({
        title: "Participant Removed",
        description: `${participantToRemove.name} and their expenses have been removed.`,
        variant: "destructive"
      });
    }
  };

  const handleAddExpense = (payerId: string, amount: number, description: string) => {
    const newExpense: Expense = { id: generateId(), payerId, amount, description };
    setExpenses((prev) => [...prev, newExpense]);
    setDebts([]); // Clear previous debts
  };

  const handleRemoveExpense = (id: string) => {
    const expenseToRemove = expenses.find(e => e.id === id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    setDebts([]); // Clear previous debts
    if (expenseToRemove) {
      toast({
        title: "Expense Removed",
        description: `Expense "${expenseToRemove.description}" has been removed.`,
        variant: "destructive"
      });
    }
  };

  const handleCalculateDebts = () => {
    if (participants.length < 2) {
      toast({
        title: "Not enough participants",
        description: "Please add at least two participants to calculate debts.",
        variant: "destructive",
      });
      setDebts([]);
      return;
    }
    if (expenses.length === 0 && participants.length > 0) {
       toast({
        title: "No Expenses",
        description: "Add some expenses to calculate who owes whom.",
        variant: "default" 
      });
      setDebts([]);
      return;
    }
    const calculatedDebts = calculateDebts(participants, expenses);
    setDebts(calculatedDebts);
    if (calculatedDebts.length > 0) {
      toast({
        title: "Debts Calculated!",
        description: "Check the summary below.",
      });
    } else if (expenses.length > 0) {
       toast({
        title: "All Settled!",
        description: "Looks like everyone is even, or no debts to show.",
      });
    }
  };

  const handleResetAll = () => {
    setParticipants([]);
    setExpenses([]);
    setDebts([]);
    toast({
      title: "Reset Complete",
      description: "All participants, expenses, and debts have been cleared.",
      variant: "destructive"
    });
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4 md:p-8">
      <header className="w-full max-w-4xl mb-8 text-center">
        <div className="flex items-center justify-center space-x-3 mb-2">
          <AppLogo />
          <h1 className="text-3xl md:text-4xl font-bold text-primary">Bill Balancer</h1>
        </div>
        <p className="text-muted-foreground">Easily split expenses and see who owes whom.</p>
      </header>

      <main className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Inputs */}
        <div className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center"><Users className="mr-2 h-6 w-6 text-primary" />Participants</CardTitle>
              <CardDescription>Add friends who are part of this bill.</CardDescription>
            </CardHeader>
            <CardContent>
              <ParticipantForm onAddParticipant={handleAddParticipant} existingParticipantNames={participants.map(p => p.name)} />
              <ParticipantList participants={participants} onRemoveParticipant={handleRemoveParticipant} />
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center"><ReceiptText className="mr-2 h-6 w-6 text-primary" />Expenses</CardTitle>
              <CardDescription>Log who paid for what.</CardDescription>
            </CardHeader>
            <CardContent>
              <ExpenseForm participants={participants} onAddExpense={handleAddExpense} />
              <ExpenseList expenses={expenses} participants={participants} onRemoveExpense={handleRemoveExpense} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Calculation & Summary */}
        <div className="space-y-6">
          <Card className="shadow-lg sticky top-8"> {/* Make summary sticky on larger screens */}
            <CardHeader>
              <CardTitle className="flex items-center"><Calculator className="mr-2 h-6 w-6 text-primary" />Debt Summary</CardTitle>
              <CardDescription>Who owes whom and how much.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleCalculateDebts} className="w-full mb-4" disabled={participants.length < 1}>
                <Calculator className="mr-2 h-5 w-5" /> Calculate Debts
              </Button>
              <DebtSummary debts={debts} />
              { (participants.length > 0 || expenses.length > 0) && (
                 <>
                  <Separator className="my-6" />
                  <Button onClick={handleResetAll} variant="destructive" className="w-full">
                    <Trash2 className="mr-2 h-5 w-5" /> Reset All
                  </Button>
                 </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <footer className="w-full max-w-4xl mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Bill Balancer. Simplify your shared expenses.</p>
      </footer>
    </div>
  );
}
