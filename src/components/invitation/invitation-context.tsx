"use client";

import { createContext, useContext } from "react";

export type InvitationPhase = "closed" | "peeking" | "expanding" | "open";

export interface InvitationContextValue {
  readonly phase: InvitationPhase;
}

/**
 * Defaults to `open` so the hero photograph is visible if this provider is
 * ever missing (for example during a partial render). The live cover always
 * supplies the real phase.
 */
export const InvitationContext = createContext<InvitationContextValue>({
  phase: "open",
});

export function useInvitation(): InvitationContextValue {
  return useContext(InvitationContext);
}
