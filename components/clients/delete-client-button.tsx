"use client";

import {
  LoaderCircle,
  Trash2,
} from "lucide-react";
import {
  useActionState,
  useEffect,
} from "react";

import {
  deleteClientAction,
  type ClientActionState,
} from "@/app/(app)/clients/actions";
import { Button } from "@/components/ui/button";

const initialState: ClientActionState = {
  status: "idle",
  message: "",
};

type DeleteClientButtonProps = {
  clientId: string;
  companyName: string;
  compact?: boolean;
};

export function DeleteClientButton({
  clientId,
  companyName,
  compact = false,
}: DeleteClientButtonProps) {
  const deleteAction =
    deleteClientAction.bind(null, clientId);

  const [state, formAction, pending] = useActionState(
    deleteAction,
    initialState,
  );

  useEffect(() => {
    if (state.status === "error" && state.message) {
      window.alert(state.message);
    }
  }, [state]);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `Delete ${companyName}? This action cannot be undone.`,
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <Button
        aria-label={`Delete ${companyName}`}
        disabled={pending}
        size={compact ? "icon" : "sm"}
        type="submit"
        variant="outline"
      >
        {pending ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <Trash2 className="size-4" />
        )}

        {!compact ? "Delete" : null}
      </Button>
    </form>
  );
}