"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Participant } from "@/types/bill-balancer";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";


const expenseFormSchema = z.object({
  payerId: z.string().min(1, { message: "Please select a payer." }),
  amount: z.coerce.number().positive({ message: "Amount must be positive." }),
  description: z.string().min(1, { message: "Description cannot be empty." }).max(100, { message: "Description too long."}),
  splitWithParticipantIds: z.array(z.string()).default([]),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

interface ExpenseFormProps {
  participants: Participant[];
  onAddExpense: (payerId: string, amount: number, description: string, splitWithParticipantIds: string[]) => void;
}

export function ExpenseForm({ participants, onAddExpense }: ExpenseFormProps) {
  const { toast } = useToast();
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      payerId: "",
      amount: 0,
      description: "",
      splitWithParticipantIds: [],
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
    // Clear selected split participants if they are removed
    const currentSplitIds = form.getValues("splitWithParticipantIds");
    const validSplitIds = currentSplitIds.filter(id => participants.some(p => p.id === id));
    if (currentSplitIds.length !== validSplitIds.length) {
      form.setValue("splitWithParticipantIds", validSplitIds);
    }

  }, [participants, form]);


  function onSubmit(data: ExpenseFormValues) {
    onAddExpense(data.payerId, data.amount, data.description, data.splitWithParticipantIds);
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

        <FormField
          control={form.control}
          name="splitWithParticipantIds"
          render={() => (
            <FormItem>
              <FormLabel>Split with</FormLabel>
              <FormDescription>
                Select who shares this expense. If none selected, it's split among all.
              </FormDescription>
              <ScrollArea className="h-32 w-full rounded-md border p-2">
                <div className="space-y-2">
                {participants.map((participant) => (
                  <FormField
                    key={participant.id}
                    control={form.control}
                    name="splitWithParticipantIds"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={participant.id}
                          className="flex flex-row items-center space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(participant.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, participant.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== participant.id
                                      )
                                    );
                              }}
                              disabled={!hasParticipants}
                              aria-label={`Split with ${participant.name}`}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {participant.name}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
                </div>
              </ScrollArea>
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
