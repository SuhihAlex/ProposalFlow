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
  deleteServiceAction,
  type ServiceActionState,
} from "@/app/(app)/services/actions";
import { Button } from "@/components/ui/button";

const initialState: ServiceActionState = {
  status: "idle",
  message: "",
};

type DeleteServiceButtonProps = {
  serviceId: string;
  serviceName: string;
};

export function DeleteServiceButton({
  serviceId,
  serviceName,
}: DeleteServiceButtonProps) {
  const deleteAction =
    deleteServiceAction.bind(null, serviceId);

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
          `Delete ${serviceName}? This action cannot be undone.`,
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <Button
        aria-label={`Delete ${serviceName}`}
        disabled={pending}
        size="sm"
        type="submit"
        variant="outline"
      >
        {pending ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <Trash2 className="size-4" />
        )}

        Delete
      </Button>
    </form>
  );
}