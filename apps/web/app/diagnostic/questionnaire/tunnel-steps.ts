import type { ReactNode } from "react";
import type { DiagnosticDraft, StepProps } from "./use-diagnostic-form";
import { AddressStep, addressValid } from "./steps/AddressStep";
import { HousingDpeStep, housingDpeValid } from "./steps/HousingDpeStep";
import { RentStep, rentValid } from "./steps/RentStep";
import { LeaseDetailsStep, leaseDetailsValid } from "./steps/LeaseDetailsStep";
import { RecapStep, recapValid } from "./steps/RecapStep";

export interface StepDef {
  title: string;
  subtitle?: string;
  Component: (p: StepProps) => ReactNode;
  valid: (d: DiagnosticDraft) => boolean;
}

// Simplification 8→5 écrans (2026-06-12) : logement+DPE fusionnés, et
// bail+révision+historique réunis sous « Votre bail ». Chaque écran fusionné
// réutilise les composants existants en sous-sections (cf. HousingDpeStep/
// LeaseDetailsStep). Config partagée entre le stepper et la variante une-page.
export const STEPS: StepDef[] = [
  // Copy deck §2 — étape adresse : titre + aide mot pour mot.
  { title: "Où habitez-vous ?", subtitle: "Nous utilisons votre adresse uniquement pour retrouver les données publiques de votre logement.", Component: AddressStep, valid: addressValid },
  { title: "Votre logement", subtitle: "Quelques caractéristiques, puis son DPE.", Component: HousingDpeStep, valid: housingDpeValid },
  // Copy deck §2 — étape loyer : titre + aide mot pour mot.
  { title: "Quel est votre loyer hors charges ?", subtitle: "C'est le « loyer nu » ou « loyer hors charges » sur votre bail ou vos quittances — pas le total que vous virez chaque mois.", Component: RentStep, valid: rentValid },
  { title: "Votre bail", subtitle: "Date, révision et augmentations — tout est facultatif.", Component: LeaseDetailsStep, valid: leaseDetailsValid },
  { title: "Récapitulatif", subtitle: "Vérifiez avant de lancer le diagnostic.", Component: RecapStep, valid: recapValid },
];
