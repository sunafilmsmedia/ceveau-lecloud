# Diagnostic IA — Le Cloud AI

Landing autonome de génération de leads pour Le Cloud AI. Version « plus détaillée »
du lead-magnet audit du site principal : un questionnaire en 7 étapes qui produit un
**diagnostic personnalisé riche** (au lieu d'une simple carte).

## Ce que le prospect obtient à la fin

- **Chiffres clés** : heures récupérables / semaine, économies $ / année, équivalent
  temps plein libéré — calculés à partir de ses réponses.
- **Top 3 employés IA prioritaires**, classés selon ses pertes de temps, chacun avec
  ses tâches, son gain estimé et le premier système à installer (« quick win »).
- **Plan d'implantation 7 / 30 / 90 jours** personnalisé.
- **CTA** vers l'appel Calendly.

## Ce qui part au CRM

Le formulaire poste sur `/api/lead`, qui relaie vers `CRM_WEBHOOK_URL`. Le payload est
aplati pour un mapping direct : contact, qualification (secteur, taille, heures, coût,
niveau IA…) **et** le résultat du diagnostic — dont `annualSavings`, `leadScore` (0-100)
et `temperature` (chaud / tiède / froid) pour prioriser les rappels.

## Logique

Tout le moteur est dans [`lib/diagnostic.ts`](lib/diagnostic.ts) — pur, déterministe,
sans dépendance. Hypothèses : ≈ 60 % des tâches répétitives automatisables, 48 semaines
travaillées / an. Ajuste `RECLAIM_RATE` et `WORK_WEEKS` au besoin.

## Config

Copier `.env.local.example` → `.env.local` :

| Variable | Rôle |
|---|---|
| `CRM_WEBHOOK_URL` | Webhook où sont envoyés les leads (Zapier / Make / GHL / n8n). Sans lui, les leads sont logés côté serveur. |
| `CRM_WEBHOOK_SECRET` | Optionnel — envoyé dans l'en-tête `X-Webhook-Secret`. |
| `NEXT_PUBLIC_SITE_URL` | URL publique (SEO). |
| `NEXT_PUBLIC_CALENDLY_URL` | Lien du CTA final. |

> ⚠️ Comme les autres apps du template, le webhook et le lien Calendly changent à chaque
> déploiement / client — à revérifier avant chaque mise en ligne.

## Dev

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de prod
```

Stack : Next.js 15 (App Router) · React 19 · Tailwind CSS v4. Charte Le Cloud AI
(noir + bleu fluo `#00b4ff`, Manrope + Bodoni italique pour les mots d'accent).
