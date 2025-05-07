"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const participantFormSchema = z.object({
  name: z.string().min(1, { message: "Participant name cannot be empty." }).max(50, { message: "Name too long."}),
});

type ParticipantFormValues = z.infer<typeof participantFormSchema>;

interface ParticipantFormProps {
  onAddParticipant: (name: string) => void;
  existingParticipantNames: string[];
}

export function ParticipantForm({ onAddParticipant, existingParticipantNames }: ParticipantFormProps) {
  const { toast } = useToast();
  const form = useForm<ParticipantFormValues>({
    resolver: zodResolver(participantFormSchema.refine(
      (data) => !existingParticipantNames.map(name => name.toLowerCase()).includes(data.name.toLowerCase()),
      {
        message: "Participant name already exists.",
        path: ["name"],
      }
    )),
    defaultValues: {
      name: "",
    },
  });

  function onSubmit(data: ParticipantFormValues) {
    onAddParticipant(data.name);
    toast({
      title: "Participant Added",
      description: `${data.name} has been added to the list.`,
    });
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex-grow">
              <FormLabel>Participant Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter name (e.g., Alice)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="icon" aria-label="Add participant">
          <PlusCircle className="h-5 w-5" />
        </Button>
      </form>
    </Form>
  );
}
