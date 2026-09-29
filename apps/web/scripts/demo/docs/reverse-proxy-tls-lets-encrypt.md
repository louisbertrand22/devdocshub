---
title: Reverse proxy et TLS avec Let's Encrypt
slug: reverse-proxy-tls-lets-encrypt
tech: nginx
---

Nginx placé devant une application (Node, Python, Go…) termine le HTTPS, sert les fichiers statiques et transmet le reste au processus applicatif. Ce guide part d'une application qui écoute sur `127.0.0.1:3000` et d'un nom de domaine `app.example.com` qui pointe déjà vers le serveur.

## Installer Nginx et Certbot

Sur Debian ou Ubuntu :

```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx
sudo systemctl enable --now nginx
```

Ouvre les ports 80 et 443 si un pare-feu est actif :

```bash
sudo ufw allow 'Nginx Full'
```

## Configurer le reverse proxy

Crée `/etc/nginx/sites-available/app.example.com` :

```nginx
server {
    listen 80;
    server_name app.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Active le site, vérifie la syntaxe puis recharge :

```bash
sudo ln -s /etc/nginx/sites-available/app.example.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Les en-têtes transmis

| En-tête | Pourquoi |
|---|---|
| `Host` | L'application voit le vrai nom de domaine, pas `127.0.0.1` |
| `X-Real-IP` | Adresse du client, utile pour les logs |
| `X-Forwarded-For` | Chaîne des proxies traversés |
| `X-Forwarded-Proto` | L'application sait si la requête d'origine était en HTTPS |

Côté application, fais confiance à ces en-têtes uniquement quand elle est derrière le proxy (par exemple `app.set("trust proxy", 1)` avec Express).

## Obtenir le certificat

Le plugin Nginx de Certbot valide le domaine, obtient le certificat et modifie la configuration pour ajouter le bloc `listen 443 ssl` :

```bash
sudo certbot --nginx -d app.example.com
```

Choisis la redirection automatique de HTTP vers HTTPS quand Certbot la propose. Vérifie ensuite :

```bash
curl -I http://app.example.com    # 301 vers https://
curl -I https://app.example.com   # 200
```

## Renouvellement automatique

Les certificats Let's Encrypt durent 90 jours. Le paquet installe un minuteur systemd qui tente le renouvellement deux fois par jour :

```bash
systemctl list-timers | grep certbot
sudo certbot renew --dry-run
```

Si `--dry-run` réussit, il n'y a rien d'autre à faire.

## WebSockets

Pour une application qui utilise des WebSockets, ajoute dans le bloc `location` :

```nginx
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
proxy_read_timeout 3600s;
```

## Dépannage

- **502 Bad Gateway** : l'application n'écoute pas sur le port indiqué ; vérifie avec `ss -ltnp | grep 3000`.
- **Échec de validation Certbot** : le DNS ne pointe pas encore vers ce serveur, ou le port 80 est fermé.
- **Boucle de redirection** : l'application force elle-même HTTPS sans lire `X-Forwarded-Proto`.
- Les journaux se trouvent dans `/var/log/nginx/error.log`.
