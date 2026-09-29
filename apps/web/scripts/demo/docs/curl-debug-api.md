---
title: Déboguer une API avec curl
slug: curl-debug-api
tech: http
---

`curl` est disponible presque partout et suffit pour inspecter une API HTTP : en-têtes, codes de statut, redirections, temps de réponse.

## Requêtes de base

```bash
curl https://api.example.com/users/42
curl -i https://api.example.com/users/42     # avec les en-têtes de réponse
curl -I https://api.example.com/health       # en-têtes seulement (HEAD)
curl -L http://example.com                   # suit les redirections
```

## Envoyer du JSON

```bash
curl -X POST https://api.example.com/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "Ada", "email": "ada@example.com"}'
```

Avec curl 7.82 ou plus récent, `--json` règle le type de contenu et l'en-tête `Accept` :

```bash
curl --json '{"name": "Ada"}' https://api.example.com/users
```

Pour un corps volumineux, lis-le depuis un fichier :

```bash
curl --json @user.json https://api.example.com/users
```

## Voir ce qui se passe vraiment

```bash
curl -v https://api.example.com/users/42
```

Les lignes `>` sont envoyées, les lignes `<` reçues, les lignes `*` décrivent la connexion (DNS, TLS, réutilisation). Pour une trace complète, y compris le corps : `--trace-ascii trace.txt`.

## Codes de statut

| Code | Signification courante |
|---|---|
| `200` / `201` | Succès / ressource créée |
| `301` / `302` | Redirection (utilise `-L`) |
| `400` | Requête invalide, souvent un JSON mal formé |
| `401` / `403` | Non authentifié / pas autorisé |
| `404` | Ressource ou route inexistante |
| `422` | Données valides en JSON mais refusées par la validation |
| `429` | Trop de requêtes, regarde l'en-tête `Retry-After` |
| `5xx` | Erreur côté serveur |

Pour ne récupérer que le code, dans un script :

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://api.example.com/health
```

## Mesurer le temps de réponse

```bash
curl -s -o /dev/null -w "dns %{time_namelookup}s\nconnexion %{time_connect}s\ntls %{time_appconnect}s\npremier octet %{time_starttransfer}s\ntotal %{time_total}s\n" https://api.example.com/users
```

Un « premier octet » élevé pointe vers le serveur ; un temps TLS élevé vers la négociation ou le réseau.

## Lire le JSON

Associe `curl` à `jq` pour filtrer la réponse :

```bash
curl -s https://api.example.com/users | jq '.[] | {id, email}'
```

## Cas pratiques

- **Tester la requête préliminaire CORS (preflight)** : `curl -i -X OPTIONS -H "Origin: https://app.example.com" -H "Access-Control-Request-Method: POST" https://api.example.com/users`.
- **Forcer une IP sans toucher au DNS** : `curl --resolve api.example.com:443:203.0.113.10 https://api.example.com/health`.
- **Ignorer un certificat de test** : `-k`, uniquement en développement.
- **Envoyer un cookie** : `-b "session=abc123"` ; les enregistrer : `-c cookies.txt`.
