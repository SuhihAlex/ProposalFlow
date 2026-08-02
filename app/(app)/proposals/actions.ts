"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

export type ProposalActionState = {
  status: "idle" | "error";
  message: string;
  fieldErrors?: {
    clientId?: string;
    projectTitle?: string;
    brief?: string;
    validUntil?: string;
  };
};

const proposalSchema = z.object({
  clientId: z.preprocess(
    (value) => {
      if (
        typeof value === "string" &&
        value.trim() === ""
      ) {
        return null;
      }

      return value;
    },
    z
      .string()
      .uuid("Select a valid client.")
      .nullable(),
  ),

  projectTitle: z
    .string()
    .trim()
    .min(
      2,
      "Project title must contain at least 2 characters.",
    )
    .max(200, "Project title is too long."),

  brief: z
    .string()
    .trim()
    .max(
      5000,
      "Brief must contain no more than 5000 characters.",
    ),

  validUntil: z
    .string()
    .trim()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "Select a valid expiry date.",
    )
    .refine((value) => {
      const date = new Date(`${value}T00:00:00Z`);

      return !Number.isNaN(date.getTime());
    }, "Select a valid expiry date."),
});

function getFirstError(errors?: string[]) {
  return errors?.[0];
}

async function getNextProposalNumber(
  ownerId: string,
) {
  const supabase = await createClient();

  const year = new Date().getUTCFullYear();
  const prefix = `PF-${year}-`;

  const { data, error } = await supabase
    .from("proposals")
    .select("proposal_number")
    .eq("owner_id", ownerId)
    .like("proposal_number", `${prefix}%`);

  if (error) {
    console.error(
      "Failed to determine next proposal number:",
      error,
    );

    return null;
  }

  const largestSequence = (data ?? []).reduce(
    (largest, proposal) => {
      const rawSequence =
        proposal.proposal_number.slice(prefix.length);

      const sequence = Number(rawSequence);

      if (
        !Number.isInteger(sequence) ||
        sequence < 0
      ) {
        return largest;
      }

      return Math.max(largest, sequence);
    },
    0,
  );

  return `${prefix}${String(
    largestSequence + 1,
  ).padStart(3, "0")}`;
}

export async function createProposalAction(
  previousState: ProposalActionState,
  formData: FormData,
): Promise<ProposalActionState> {
  void previousState;

  const validationResult = proposalSchema.safeParse({
    clientId: formData.get("clientId"),
    projectTitle: formData.get("projectTitle"),
    brief: formData.get("brief"),
    validUntil: formData.get("validUntil"),
  });

  if (!validationResult.success) {
    const errors =
      validationResult.error.flatten().fieldErrors;

    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: {
        clientId: getFirstError(errors.clientId),
        projectTitle: getFirstError(
          errors.projectTitle,
        ),
        brief: getFirstError(errors.brief),
        validUntil: getFirstError(
          errors.validUntil,
        ),
      },
    };
  }

  const supabase = await createClient();

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  const ownerId = claimsData?.claims?.sub;

  if (claimsError || !ownerId) {
    return {
      status: "error",
      message:
        "Your session has expired. Log in again and retry.",
    };
  }

  const { data: company, error: companyError } =
    await supabase
      .from("companies")
      .select("id, currency")
      .eq("owner_id", ownerId)
      .maybeSingle();

  if (companyError) {
    console.error(
      "Failed to load company before creating proposal:",
      companyError,
    );

    return {
      status: "error",
      message: "We could not load your company profile.",
    };
  }

  if (!company) {
    return {
      status: "error",
      message:
        "Complete your company profile before creating proposals.",
    };
  }

  const values = validationResult.data;

  if (values.clientId) {
    const { data: client, error: clientError } =
      await supabase
        .from("clients")
        .select("id")
        .eq("id", values.clientId)
        .eq("owner_id", ownerId)
        .maybeSingle();

    if (clientError) {
      console.error(
        "Failed to validate proposal client:",
        clientError,
      );

      return {
        status: "error",
        message:
          "We could not validate the selected client.",
      };
    }

    if (!client) {
      return {
        status: "error",
        message:
          "The selected client could not be found.",
        fieldErrors: {
          clientId: "Select a valid client.",
        },
      };
    }
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const proposalNumber =
      await getNextProposalNumber(ownerId);

    if (!proposalNumber) {
      return {
        status: "error",
        message:
          "We could not generate a proposal number.",
      };
    }

    const {
      data: createdProposal,
      error: insertError,
    } = await supabase
      .from("proposals")
      .insert({
        owner_id: ownerId,
        company_id: company.id,
        client_id: values.clientId,
        proposal_number: proposalNumber,
        project_title: values.projectTitle,
        brief: values.brief,
        status: "draft",
        currency: company.currency,
        valid_until: values.validUntil,
        discount_type: "none",
        discount_value: 0,
        subtotal: 0,
        total: 0,
      })
      .select("id")
      .single();

    if (!insertError && createdProposal) {
      revalidatePath("/proposals");

      redirect(
        `/proposals/${createdProposal.id}/edit?created=1`,
      );
    }

    if (insertError.code !== "23505") {
      console.error(
        "Failed to create proposal:",
        insertError,
      );

      return {
        status: "error",
        message:
          "We could not create the proposal. Try again.",
      };
    }
  }

  return {
    status: "error",
    message:
      "We could not reserve a proposal number. Try again.",
  };
}

export type ProposalItemActionState = {
  status: "idle" | "error";
  message: string;
  fieldErrors?: {
    serviceId?: string;
    quantity?: string;
  };
};

const proposalIdSchema = z.string().uuid();
const proposalItemIdSchema = z.string().uuid();

const proposalItemSchema = z.object({
  serviceId: z
    .string()
    .uuid("Select a valid service."),

  quantity: z
    .string()
    .trim()
    .min(1, "Enter a quantity.")
    .refine(
      (value) => {
        const quantity = Number(value);

        return (
          Number.isFinite(quantity) &&
          quantity > 0 &&
          quantity <= 1000000
        );
      },
      "Enter a quantity greater than 0.",
    )
    .transform((value) => Number(value)),
});

async function getProposalActionOwner() {
  const supabase = await createClient();

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  const ownerId = claimsData?.claims?.sub;

  return {
    supabase,
    ownerId:
      claimsError || !ownerId
        ? null
        : ownerId,
  };
}

export async function addProposalItemAction(
  proposalId: string,
  previousState: ProposalItemActionState,
  formData: FormData,
): Promise<ProposalItemActionState> {
  void previousState;

  const proposalIdResult =
    proposalIdSchema.safeParse(proposalId);

  if (!proposalIdResult.success) {
    return {
      status: "error",
      message: "Invalid proposal identifier.",
    };
  }

  const validationResult =
    proposalItemSchema.safeParse({
      serviceId: formData.get("serviceId"),
      quantity: formData.get("quantity"),
    });

  if (!validationResult.success) {
    const errors =
      validationResult.error.flatten().fieldErrors;

    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: {
        serviceId: errors.serviceId?.[0],
        quantity: errors.quantity?.[0],
      },
    };
  }

  const { supabase, ownerId } =
    await getProposalActionOwner();

  if (!ownerId) {
    return {
      status: "error",
      message:
        "Your session has expired. Log in again and retry.",
    };
  }

  const { data: proposal, error: proposalError } =
    await supabase
      .from("proposals")
      .select("id, status")
      .eq("id", proposalIdResult.data)
      .eq("owner_id", ownerId)
      .maybeSingle();

  if (proposalError) {
    console.error(
      "Failed to load proposal before adding item:",
      proposalError,
    );

    return {
      status: "error",
      message: "We could not load the proposal.",
    };
  }

  if (!proposal) {
    return {
      status: "error",
      message: "The proposal could not be found.",
    };
  }

  if (proposal.status !== "draft") {
    return {
      status: "error",
      message:
        "Only draft proposals can be changed.",
    };
  }

  const values = validationResult.data;

  const { data: service, error: serviceError } =
    await supabase
      .from("services")
      .select(
        `
          id,
          name,
          description,
          price,
          unit
        `,
      )
      .eq("id", values.serviceId)
      .eq("owner_id", ownerId)
      .maybeSingle();

  if (serviceError) {
    console.error(
      "Failed to load service before adding item:",
      serviceError,
    );

    return {
      status: "error",
      message: "We could not load the selected service.",
    };
  }

  if (!service) {
    return {
      status: "error",
      message: "The selected service could not be found.",
      fieldErrors: {
        serviceId: "Select a valid service.",
      },
    };
  }

  const {
    data: lastItem,
    error: positionError,
  } = await supabase
    .from("proposal_items")
    .select("position")
    .eq("proposal_id", proposalIdResult.data)
    .order("position", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (positionError) {
    console.error(
      "Failed to determine proposal item position:",
      positionError,
    );

    return {
      status: "error",
      message:
        "We could not determine the item position.",
    };
  }

  const { error: insertError } = await supabase
    .from("proposal_items")
    .insert({
      proposal_id: proposalIdResult.data,
      service_id: service.id,
      name: service.name,
      description: service.description,
      quantity: values.quantity,
      unit: service.unit,
      unit_price: service.price,
      position: (lastItem?.position ?? -1) + 1,
    });

  if (insertError) {
    console.error(
      "Failed to add proposal item:",
      insertError,
    );

    return {
      status: "error",
      message:
        "We could not add the service. Try again.",
    };
  }

  revalidatePath("/proposals");
  revalidatePath(
    `/proposals/${proposalIdResult.data}/edit`,
  );

  redirect(
    `/proposals/${proposalIdResult.data}/edit?item=added`,
  );
}

export async function deleteProposalItemAction(
  proposalId: string,
  itemId: string,
  previousState: ProposalItemActionState,
  formData: FormData,
): Promise<ProposalItemActionState> {
  void previousState;
  void formData;

  const proposalIdResult =
    proposalIdSchema.safeParse(proposalId);

  const itemIdResult =
    proposalItemIdSchema.safeParse(itemId);

  if (
    !proposalIdResult.success ||
    !itemIdResult.success
  ) {
    return {
      status: "error",
      message: "Invalid proposal item identifier.",
    };
  }

  const { supabase, ownerId } =
    await getProposalActionOwner();

  if (!ownerId) {
    return {
      status: "error",
      message:
        "Your session has expired. Log in again and retry.",
    };
  }

  const { data: proposal, error: proposalError } =
    await supabase
      .from("proposals")
      .select("id, status")
      .eq("id", proposalIdResult.data)
      .eq("owner_id", ownerId)
      .maybeSingle();

  if (proposalError) {
    console.error(
      "Failed to load proposal before deleting item:",
      proposalError,
    );

    return {
      status: "error",
      message: "We could not load the proposal.",
    };
  }

  if (!proposal) {
    return {
      status: "error",
      message: "The proposal could not be found.",
    };
  }

  if (proposal.status !== "draft") {
    return {
      status: "error",
      message:
        "Only draft proposals can be changed.",
    };
  }

  const {
    data: deletedItem,
    error: deleteError,
  } = await supabase
    .from("proposal_items")
    .delete()
    .eq("id", itemIdResult.data)
    .eq("proposal_id", proposalIdResult.data)
    .select("id")
    .maybeSingle();

  if (deleteError) {
    console.error(
      "Failed to delete proposal item:",
      deleteError,
    );

    return {
      status: "error",
      message:
        "We could not remove the item. Try again.",
    };
  }

  if (!deletedItem) {
    return {
      status: "error",
      message: "The proposal item could not be found.",
    };
  }

  revalidatePath("/proposals");
  revalidatePath(
    `/proposals/${proposalIdResult.data}/edit`,
  );

  redirect(
    `/proposals/${proposalIdResult.data}/edit?item=deleted`,
  );
}

export type ProposalDetailsActionState = {
  status: "idle" | "error";
  message: string;
  fieldErrors?: {
    clientId?: string;
    projectTitle?: string;
    brief?: string;
    validUntil?: string;
  };
};

const proposalDetailsSchema = z.object({
  clientId: z.preprocess(
    (value) => {
      if (
        typeof value === "string" &&
        value.trim() === ""
      ) {
        return null;
      }

      return value;
    },
    z
      .string()
      .uuid("Select a valid client.")
      .nullable(),
  ),

  projectTitle: z
    .string()
    .trim()
    .min(
      2,
      "Project title must contain at least 2 characters.",
    )
    .max(200, "Project title is too long."),

  brief: z
    .string()
    .trim()
    .max(
      5000,
      "Brief must contain no more than 5000 characters.",
    ),

  validUntil: z
    .string()
    .trim()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "Select a valid expiry date.",
    )
    .refine((value) => {
      const parsedDate = new Date(
        `${value}T00:00:00Z`,
      );

      return !Number.isNaN(parsedDate.getTime());
    }, "Select a valid expiry date."),
});

export async function updateProposalDetailsAction(
  proposalId: string,
  previousState: ProposalDetailsActionState,
  formData: FormData,
): Promise<ProposalDetailsActionState> {
  void previousState;

  const proposalIdResult =
    proposalIdSchema.safeParse(proposalId);

  if (!proposalIdResult.success) {
    return {
      status: "error",
      message: "Invalid proposal identifier.",
    };
  }

  const validationResult =
    proposalDetailsSchema.safeParse({
      clientId: formData.get("clientId"),
      projectTitle: formData.get("projectTitle"),
      brief: formData.get("brief"),
      validUntil: formData.get("validUntil"),
    });

  if (!validationResult.success) {
    const errors =
      validationResult.error.flatten().fieldErrors;

    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: {
        clientId: errors.clientId?.[0],
        projectTitle: errors.projectTitle?.[0],
        brief: errors.brief?.[0],
        validUntil: errors.validUntil?.[0],
      },
    };
  }

  const { supabase, ownerId } =
    await getProposalActionOwner();

  if (!ownerId) {
    return {
      status: "error",
      message:
        "Your session has expired. Log in again and retry.",
    };
  }

  const { data: proposal, error: proposalError } =
    await supabase
      .from("proposals")
      .select("id, status")
      .eq("id", proposalIdResult.data)
      .eq("owner_id", ownerId)
      .maybeSingle();

  if (proposalError) {
    console.error(
      "Failed to load proposal before update:",
      proposalError,
    );

    return {
      status: "error",
      message: "We could not load the proposal.",
    };
  }

  if (!proposal) {
    return {
      status: "error",
      message: "The proposal could not be found.",
    };
  }

  if (proposal.status !== "draft") {
    return {
      status: "error",
      message:
        "Only draft proposals can be changed.",
    };
  }

  const values = validationResult.data;

  if (values.clientId) {
    const { data: client, error: clientError } =
      await supabase
        .from("clients")
        .select("id")
        .eq("id", values.clientId)
        .eq("owner_id", ownerId)
        .maybeSingle();

    if (clientError) {
      console.error(
        "Failed to validate proposal client:",
        clientError,
      );

      return {
        status: "error",
        message:
          "We could not validate the selected client.",
      };
    }

    if (!client) {
      return {
        status: "error",
        message:
          "The selected client could not be found.",
        fieldErrors: {
          clientId: "Select a valid client.",
        },
      };
    }
  }

  const {
    data: updatedProposal,
    error: updateError,
  } = await supabase
    .from("proposals")
    .update({
      client_id: values.clientId,
      project_title: values.projectTitle,
      brief: values.brief,
      valid_until: values.validUntil,
    })
    .eq("id", proposalIdResult.data)
    .eq("owner_id", ownerId)
    .select("id")
    .maybeSingle();

  if (updateError) {
    console.error(
      "Failed to update proposal details:",
      updateError,
    );

    return {
      status: "error",
      message:
        "We could not update the proposal. Try again.",
    };
  }

  if (!updatedProposal) {
    return {
      status: "error",
      message: "The proposal could not be found.",
    };
  }

  revalidatePath("/proposals");
  revalidatePath(
    `/proposals/${proposalIdResult.data}/edit`,
  );

  redirect(
    `/proposals/${proposalIdResult.data}/edit?details=updated`,
  );
}

export type ProposalDiscountActionState = {
  status: "idle" | "error";
  message: string;
  fieldErrors?: {
    discountType?: string;
    discountValue?: string;
  };
};

const proposalDiscountSchema = z
  .object({
    discountType: z.enum(
      ["none", "percentage", "fixed"],
      {
        message: "Select a valid discount type.",
      },
    ),

    discountValue: z
      .string()
      .trim()
      .min(1, "Enter a discount value.")
      .refine(
        (value) => {
          const parsedValue = Number(value);

          return (
            Number.isFinite(parsedValue) &&
            parsedValue >= 0
          );
        },
        "Enter a valid discount value.",
      ),
  })
  .superRefine((values, context) => {
    const discountValue = Number(
      values.discountValue,
    );

    if (
      values.discountType === "percentage" &&
      Number.isFinite(discountValue) &&
      discountValue > 100
    ) {
      context.addIssue({
        code: "custom",
        message:
          "Percentage discount cannot exceed 100%.",
        path: ["discountValue"],
      });
    }
  });

export async function updateProposalDiscountAction(
  proposalId: string,
  previousState: ProposalDiscountActionState,
  formData: FormData,
): Promise<ProposalDiscountActionState> {
  void previousState;

  const proposalIdResult =
    proposalIdSchema.safeParse(proposalId);

  if (!proposalIdResult.success) {
    return {
      status: "error",
      message: "Invalid proposal identifier.",
    };
  }

  const validationResult =
    proposalDiscountSchema.safeParse({
      discountType: formData.get("discountType"),
      discountValue: formData.get(
        "discountValue",
      ),
    });

  if (!validationResult.success) {
    const errors =
      validationResult.error.flatten().fieldErrors;

    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: {
        discountType:
          errors.discountType?.[0],
        discountValue:
          errors.discountValue?.[0],
      },
    };
  }

  const { supabase, ownerId } =
    await getProposalActionOwner();

  if (!ownerId) {
    return {
      status: "error",
      message:
        "Your session has expired. Log in again and retry.",
    };
  }

  const { data: proposal, error: proposalError } =
    await supabase
      .from("proposals")
      .select("id, status")
      .eq("id", proposalIdResult.data)
      .eq("owner_id", ownerId)
      .maybeSingle();

  if (proposalError) {
    console.error(
      "Failed to load proposal before discount update:",
      proposalError,
    );

    return {
      status: "error",
      message: "We could not load the proposal.",
    };
  }

  if (!proposal) {
    return {
      status: "error",
      message: "The proposal could not be found.",
    };
  }

  if (proposal.status !== "draft") {
    return {
      status: "error",
      message:
        "Only draft proposals can be changed.",
    };
  }

  const values = validationResult.data;

  const discountValue =
    values.discountType === "none"
      ? 0
      : Number(values.discountValue);

  const {
    data: updatedProposal,
    error: updateError,
  } = await supabase
    .from("proposals")
    .update({
      discount_type: values.discountType,
      discount_value: discountValue,
    })
    .eq("id", proposalIdResult.data)
    .eq("owner_id", ownerId)
    .select("id")
    .maybeSingle();

  if (updateError) {
    console.error(
      "Failed to update proposal discount:",
      updateError,
    );

    return {
      status: "error",
      message:
        "We could not update the discount. Try again.",
    };
  }

  if (!updatedProposal) {
    return {
      status: "error",
      message: "The proposal could not be found.",
    };
  }

  revalidatePath("/proposals");
  revalidatePath(
    `/proposals/${proposalIdResult.data}/edit`,
  );

  redirect(
    `/proposals/${proposalIdResult.data}/edit?discount=updated`,
  );
}

export type ProposalLifecycleActionState = {
  status: "idle" | "error";
  message: string;
};

export async function markProposalSentAction(
  proposalId: string,
  previousState: ProposalLifecycleActionState,
  formData: FormData,
): Promise<ProposalLifecycleActionState> {
  void previousState;
  void formData;

  const proposalIdResult =
    proposalIdSchema.safeParse(proposalId);

  if (!proposalIdResult.success) {
    return {
      status: "error",
      message: "Invalid proposal identifier.",
    };
  }

  const { supabase, ownerId } =
    await getProposalActionOwner();

  if (!ownerId) {
    return {
      status: "error",
      message:
        "Your session has expired. Log in again and retry.",
    };
  }

  const {
    data: proposal,
    error: proposalError,
  } = await supabase
    .from("proposals")
    .select(
      `
        id,
        status,
        client_id,
        total
      `,
    )
    .eq("id", proposalIdResult.data)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (proposalError) {
    console.error(
      "Failed to load proposal before marking it as sent:",
      proposalError,
    );

    return {
      status: "error",
      message: "We could not load the proposal.",
    };
  }

  if (!proposal) {
    return {
      status: "error",
      message: "The proposal could not be found.",
    };
  }

  if (proposal.status !== "draft") {
    return {
      status: "error",
      message:
        "Only draft proposals can be marked as sent.",
    };
  }

  if (!proposal.client_id) {
    return {
      status: "error",
      message:
        "Assign a client before marking the proposal as sent.",
    };
  }

  const {
    count: itemCount,
    error: itemsError,
  } = await supabase
    .from("proposal_items")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("proposal_id", proposalIdResult.data);

  if (itemsError) {
    console.error(
      "Failed to count proposal items:",
      itemsError,
    );

    return {
      status: "error",
      message:
        "We could not verify the proposal pricing.",
    };
  }

  if (!itemCount || itemCount < 1) {
    return {
      status: "error",
      message:
        "Add at least one service before marking the proposal as sent.",
    };
  }

  if (
    !Number.isFinite(Number(proposal.total)) ||
    Number(proposal.total) <= 0
  ) {
    return {
      status: "error",
      message:
        "The proposal total must be greater than zero.",
    };
  }

  const {
    data: updatedProposal,
    error: updateError,
  } = await supabase
    .from("proposals")
    .update({
      status: "sent",
    })
    .eq("id", proposalIdResult.data)
    .eq("owner_id", ownerId)
    .eq("status", "draft")
    .select("id")
    .maybeSingle();

  if (updateError) {
    console.error(
      "Failed to mark proposal as sent:",
      updateError,
    );

    return {
      status: "error",
      message:
        "We could not mark the proposal as sent. Try again.",
    };
  }

  if (!updatedProposal) {
    return {
      status: "error",
      message:
        "The proposal is no longer available as a draft.",
    };
  }

  revalidatePath("/proposals");
  revalidatePath(
    `/proposals/${proposalIdResult.data}/edit`,
  );

  redirect(
    `/proposals/${proposalIdResult.data}/edit?lifecycle=sent`,
  );
}