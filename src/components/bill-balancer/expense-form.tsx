"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Participant } from "@/types/bill-balancer";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";


const expenseFormSchema = z.object({
  payerId: z.string().min(1, { message: "Please select a payer." }),
  amount: z.coerce.number().positive({ message: "Amount must be positive." }),
  description: z.string().min(1, { message: "Description cannot be empty." }).max(100, { message: "Description too long."}),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

interface ExpenseFormProps {
  participants: Participant[];
  onAddExpense: (payerId: string, amount: number, description: string) => void;
}

export function ExpenseForm({ participants, onAddExpense }: ExpenseFormProps) {
  const { toast } = useToast();
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      payerId: "",
      amount: 0,
      description: "",
    },
  });

  React.useEffect(() => {
    // Reset payerId if the selected participant is removed
    if (participants.length > 0 && form.getValues("payerId")) {
      if (!participants.find(p => p.id === form.getValues("payerId"))) {
        form.resetField("payerId");
      }
    }
    if (participants.length === 0 && form.getValues("payerId")) {
       form.resetField("payerId");
    }
  }, [participants, form]);


  function onSubmit(data: ExpenseFormValues) {
    onAddExpense(data.payerId, data.amount, data.description);
    const payerName = participants.find(p => p.id === data.payerId)?.name || 'Someone';
    toast({
      title: "Expense Added",
      description: `${payerName} paid $${data.amount.toFixed(2)} for "${data.description}".`,
    });
    form.reset();
  }
  
  const hasParticipants = participants.length > 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="payerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Paid by</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={!hasParticipants}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={hasParticipants ? "Select who paid" : "Add participants first"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {participants.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount ($)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0.00" {...field} step="0.01" disabled={!hasParticipants} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Dinner, Groceries" {...field} disabled={!hasParticipants} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={!hasParticipants} className="w-full">
          <PlusCircle className="mr-2 h-5 w-5" /> Add Expense
        </Button>
      </form>
    </Form>
  );
}
