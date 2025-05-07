"use client";

import type { Participant } from "@/types/bill-balancer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { XCircle } from "lucide-react";

interface ParticipantListProps {
  participants: Participant[];
  onRemoveParticipant: (id: string) => void;
}

export function ParticipantList({ participants, onRemoveParticipant }: ParticipantListProps) {
  if (participants.length === 0) {
    return <p className="text-sm text-muted-foreground mt-4">No participants added yet. Add some to get started!</p>;
  }

  return (
    <div className="mt-4 space-y-2">
      <h4 className="font-medium text-sm">Current Participants:</h4>
      <ul className="flex flex-wrap gap-2">
        {participants.map((participant) => (
          <li key={participant.id}>
            <Badge variant="secondary" className="text-base py-1 px-3 flex items-center gap-2 group">
              {participant.name}
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 opacity-50 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive"
                onClick={() => onRemoveParticipant(participant.id)}
                aria-label={`Remove ${participant.name}`}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}
