"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { withAuth } from "@/lib/auth/with-auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type ActionResult = { ok: true } | { error: string };

const profileSchema = z.object({
  firstName: z.string().trim().max(80).optional(),
  lastName: z.string().trim().max(80).optional(),
  phone: z.string().trim().max(30).optional(),
  emailNotifications: z.boolean(),
});

export const updateProfile = withAuth(
  profileSchema,
  async (input, { user }): Promise<ActionResult> => {
    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from("profiles")
      .update({
        first_name: input.firstName ?? null,
        last_name: input.lastName ?? null,
        phone: input.phone ?? null,
        email_notifications: input.emailNotifications,
      })
      .eq("id", user.id);
    if (error) return { error: "Impossible d'enregistrer vos préférences." };
    revalidatePath("/espace/compte");
    return { ok: true };
  },
);
