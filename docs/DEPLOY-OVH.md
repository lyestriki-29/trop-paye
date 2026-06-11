# Déploiement OVH (serveur perso) + Supabase cloud Paris

> Décision Lyes 2026-06-11 : hébergement sur nos serveurs OVH + Supabase cloud.
> Chemin : VPS/serveur OVH (Docker) + Supabase cloud `eu-west-3` (Paris) + Brevo.

## 0. Prérequis serveur (une fois)

- Ubuntu 22.04+ avec Docker (`curl -fsSL https://get.docker.com | sh`) et nginx.
- Un domaine pointé sur l'IP du serveur (A/AAAA), ex. `troppaye.fr` + `www`.
- Certbot pour le TLS : `apt install certbot python3-certbot-nginx`.

## 1. Supabase cloud (région Paris — résidence des données)

1. Créer le projet sur supabase.com → région **eu-west-3 (Paris)**, plan **Pro**
   (backups quotidiens : obligatoire avant toute donnée réelle).
2. Lier et pousser les migrations depuis le poste de dev :
   ```bash
   pnpm exec supabase link --project-ref <PROJECT_REF>
   pnpm exec supabase db push          # applique 0001 → 0004
   ```
3. Seed des RÉFÉRENTIELS uniquement (IRL vérifié, zones, règles) : exécuter dans
   le SQL Editor les blocs `irl_index`, `tense_zone_communes`, `fee_cap_zones`,
   `legal_rules` de `supabase/seed.sql`. ⚠️ NE PAS seeder le bloc `articles`
   (guides de démo) tel quel en prod sans relecture.
4. Storage : créer le bucket privé `pieces` (Storage → New bucket, **private**).
5. Auth → URL Configuration : Site URL = `https://troppaye.fr`,
   Redirect URLs += `https://troppaye.fr/auth/callback`.
6. **Auth → SMTP Settings (CRITIQUE)** : sans SMTP custom, Supabase plafonne à
   **2 emails/heure** → les magic links cassent au 3ᵉ visiteur. Brancher Brevo :
   host `smtp-relay.brevo.com`, port `587`, user = identifiant SMTP Brevo,
   pass = clé SMTP, sender `no-reply@troppaye.fr` (domaine authentifié
   SPF/DKIM dans Brevo au préalable).

## 2. Variables d'environnement (serveur)

Créer `/opt/troppaye/.env` (chmod 600) à partir de `.env.example`. Obligatoires :
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL=https://troppaye.fr`,
`PIECES_ENCRYPTION_KEY`, `SIGNATURE_SECRET`, `CRON_SECRET` (3 secrets : 32+ octets
aléatoires, consignés dans le gestionnaire de mots de passe AVANT le déploiement —
perdre PIECES_ENCRYPTION_KEY = perdre toutes les pièces clients),
`EMAIL_PROVIDER=brevo`, `BREVO_API_KEY`, `MANDATE_ENABLED=false` (palier 2 fermé).

## 3. Build & run

```bash
git clone <repo> /opt/troppaye/src && cd /opt/troppaye/src
docker build -t troppaye:$(git rev-parse --short HEAD) -t troppaye:latest \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=... \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
  --build-arg NEXT_PUBLIC_APP_URL=https://troppaye.fr .
docker run -d --name troppaye --restart unless-stopped \
  --env-file /opt/troppaye/.env -p 127.0.0.1:3000:3000 troppaye:latest
```

nginx : reverse proxy `troppaye.fr` → `127.0.0.1:3000` puis
`certbot --nginx -d troppaye.fr -d www.troppaye.fr`.

## 4. Cron (séquences J0/J21/J35/J50 + envoi outbox)

```cron
# crontab -e (toutes les 15 min ; idempotent côté app).
# ⚠️ cron a un environnement VIDE : $CRON_SECRET n'y existe pas — on le lit
# directement dans le .env du serveur au moment de l'appel.
*/15 * * * * curl -fsS -X POST -H "x-cron-secret: $(grep '^CRON_SECRET=' /opt/troppaye/.env | cut -d= -f2-)" https://troppaye.fr/api/cron/run-due-actions >> /var/log/troppaye-cron.log 2>&1
```

Vérifier après installation : `tail /var/log/troppaye-cron.log` doit montrer du JSON
`{"processed":…}` et jamais `unauthorized`.

## 5. Checklist avant ouverture publique (palier 1)

- [ ] Backups Supabase Pro actifs + **test de restauration réel** (restore + déchiffrer une pièce).
- [ ] SMTP Brevo branché côté Supabase AUTH (le piège des 2 emails/h) ET côté app.
- [ ] Tunnel complet déroulé sur le domaine réel : diagnostic → verdict → capture →
      magic link (depuis webview TikTok/Instagram iOS + Android) → espace.
- [ ] `/admin` accessible uniquement au compte admin ; un compte client n'y entre pas.
- [ ] `MANDATE_ENABLED=false` confirmé (liste d'attente) tant que société/R124 absentes.
- [ ] Uptime check (UptimeRobot gratuit) sur `/` et `/diagnostic`.

Rollback & incidents : voir `docs/RUNBOOK.md`.
