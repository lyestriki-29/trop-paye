# RUNBOOK — incidents & rollback (1 page, à lire AVANT le jour J)

## Revenir à la version précédente (≤ 5 min)

Chaque build est taggé par commit (`troppaye:<sha>` + `troppaye:latest`).

```bash
docker images troppaye --format "{{.Tag}}"   # repérer le tag N-1
docker stop troppaye && docker rm troppaye
docker run -d --name troppaye --restart unless-stopped \
  --env-file /opt/troppaye/.env -p 127.0.0.1:3000:3000 troppaye:<sha-précédent>
```

## Suspendre TOUT envoi de courrier / email (frein d'urgence)

1. **Cron** : `crontab -e` → commenter la ligne run-due-actions. Plus aucun
   courrier n'est rendu, plus aucun email d'outbox ne part. (Les actions déjà
   en file `TO_POST` ne partent que si un humain saisit un n° de suivi — rien
   ne part jamais tout seul.)
2. **Un seul dossier** : back-office → dossier → « Pause » (`recovery_state=PAUSED`).
3. **Emails seulement** : retirer `BREVO_API_KEY` du `.env` + `docker restart troppaye`
   (l'outbox s'accumule sans rien perdre).

## Où vivent les secrets

Gestionnaire de mots de passe (coffre partagé Lyes) : `PIECES_ENCRYPTION_KEY`
(⚠️ perte = pièces clients illisibles à jamais), `SIGNATURE_SECRET`, `CRON_SECRET`,
`SUPABASE_SERVICE_ROLE_KEY`, clés Brevo. Copie serveur : `/opt/troppaye/.env` (600).

## Santé / diagnostics

- App : `docker logs troppaye --tail 100` · `curl -I https://troppaye.fr`
- Supabase : status.supabase.com + dashboard (Logs / Auth / Database health).
- Brevo : app.brevo.com → Transactional → logs d'envoi.
- Cron : `/var/log/troppaye-cron.log` (réponse JSON `{processed, skipped, outbox}`).

## Incident données (violation RGPD)

Geler l'accès (cron off + éventuellement `docker stop troppaye`), noter l'heure,
évaluer le périmètre via `access_logs`, notification CNIL sous **72 h** si risque
pour les personnes. Contact CNIL : cnil.fr/fr/notifier-une-violation-de-donnees.
