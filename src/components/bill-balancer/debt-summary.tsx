"use client";

import type { Debt } from "@/types/bill-balancer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface DebtSummaryProps {
  debts: Debt[];
}

export function DebtSummary({ debts }: DebtSummaryProps) {
  if (debts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground mt-4 text-center py-4">
        No debts to settle, or not enough information to calculate.
      </p>
    );
  }

  return (
    <div className="space-y-3 mt-4">
      {debts.map((debt, index) => (
        <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm md:text-base">
              <span className="font-medium text-destructive">{debt.from}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-primary">{debt.to}</span>
            </div>
            <span className="font-semibold text-accent">${debt.amount.toFixed(2)}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
