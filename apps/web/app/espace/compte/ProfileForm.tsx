"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { updateProfile } from "@/app/espace/compte/actions";

export interface ProfileFormProps {
  initial: {
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    emailNotifications: boolean;
  };
}

export function ProfileForm({ initial }: ProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [firstName, setFirstName] = useState(initial.firstName ?? "");
  const [lastName, setLastName] = useState(initial.lastName ?? "");
  const [phone, setPhone] = useState(initial.phone ?? "");
  const [emailNotifications, setEmailNotifications] = useState(initial.emailNotifications);

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(false);
    setError(null);

    startTransition(async () => {
      const result = await updateProfile({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        phone: phone.trim() || undefined,
        emailNotifications,
      });
      if ("error" in result) {
        setError(result.error);
      } else {
        setSuccess(true);
        router.refresh();
      }
    });
  }

  const inputCls = "rounded-field border border-line bg-paper px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-ink/30";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="font-display text-lg font-bold">Informations personnelles</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="firstName" className="block text-sm font-medium text-ink/70">
            Prénom
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            maxLength={80}
            className={inputCls}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="lastName" className="block text-sm font-medium text-ink/70">
            Nom
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            maxLength={80}
            className={inputCls}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="phone" className="block text-sm font-medium text-ink/70">
          Téléphone
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          maxLength={30}
          className={inputCls}
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          id="emailNotifications"
          type="checkbox"
          checked={emailNotifications}
          onChange={(e) => setEmailNotifications(e.target.checked)}
          className="h-4 w-4 rounded border-line accent-ink"
        />
        <label htmlFor="emailNotifications" className="text-sm text-ink/70">
          Recevoir les notifications par email
        </label>
      </div>

      {success && (
        <p className="text-sm font-medium text-green-700">Préférences enregistrées.</p>
      )}
      {error && (
        <p className="text-sm font-medium text-red-600">{error}</p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  );
}
