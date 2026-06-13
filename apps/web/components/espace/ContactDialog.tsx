"use client";

import { Button } from "@/components/ui/Button";

export function ContactDialog() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP;
  const calUrl = process.env.NEXT_PUBLIC_CAL_URL;
  return (
    <div className="w-80 rounded-card border border-line bg-paper p-4 shadow-lift">
      <p className="mb-3 font-display text-sm font-bold">Prendre contact</p>
      <div className="space-y-2">
        {whatsapp ? (
          <Button href={`https://wa.me/${whatsapp}`} variant="accent">
            Discuter sur WhatsApp
          </Button>
        ) : null}
        {calUrl ? (
          <Button href={calUrl} variant="ghost">
            Prendre rendez-vous
          </Button>
        ) : null}
        <p className="text-xs text-ink/45">Un vrai agenda intégré arrive bientôt.</p>
      </div>
    </div>
  );
}
