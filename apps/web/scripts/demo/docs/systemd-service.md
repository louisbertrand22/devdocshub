---
title: Écrire un service systemd
slug: systemd-service
tech: linux
---

Un service systemd démarre une application au boot, la relance si elle plante et centralise ses logs dans le journal. Il suffit d'un fichier d'unité.

## Le fichier d'unité

Crée `/etc/systemd/system/monapp.service` :

```ini
[Unit]
Description=Mon application web
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=monapp
Group=monapp
WorkingDirectory=/opt/monapp
EnvironmentFile=/etc/monapp/env
ExecStart=/opt/monapp/.venv/bin/gunicorn -b 127.0.0.1:8000 monapp.wsgi:app
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Crée l'utilisateur dédié, sans shell de connexion :

```bash
sudo useradd --system --home /opt/monapp --shell /usr/sbin/nologin monapp
```

## Activer et démarrer

```bash
sudo systemctl daemon-reload            # après chaque modification du fichier
sudo systemctl enable --now monapp      # démarre maintenant et au boot
systemctl status monapp
```

## Les commandes utiles

| Commande | Effet |
|---|---|
| `systemctl restart monapp` | Redémarre |
| `systemctl reload monapp` | Recharge la config (si `ExecReload` est défini) |
| `systemctl stop monapp` | Arrête |
| `systemctl disable monapp` | Ne démarre plus au boot |
| `systemctl is-active monapp` | `active` ou `inactive`, pratique dans un script |

## Lire les logs

La sortie standard et les erreurs du service vont dans le journal :

```bash
journalctl -u monapp -f                 # en continu
journalctl -u monapp --since "1 hour ago"
journalctl -u monapp -p err             # uniquement les erreurs
```

## Variables d'environnement

`EnvironmentFile` charge un fichier `CLÉ=valeur` ; protège-le s'il contient des secrets :

```bash
sudo install -m 600 -o root -g root /dev/null /etc/monapp/env
```

## Durcir le service

Quelques options limitent ce que le processus peut faire, sans changer le code :

```ini
[Service]
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/lib/monapp
```

`systemd-analyze security monapp` note l'exposition du service et suggère d'autres options.

## Surcharger sans modifier le fichier

Pour une unité fournie par un paquet, crée une surcharge plutôt que d'éditer le fichier d'origine :

```bash
sudo systemctl edit monapp
```

Le contenu saisi est enregistré dans `/etc/systemd/system/monapp.service.d/override.conf` et survit aux mises à jour.

## Dépannage

- **Le service redémarre en boucle** : `journalctl -u monapp -n 50` montre l'erreur de démarrage.
- **Modification ignorée** : oubli du `daemon-reload`.
- **`status=203/EXEC`** : le chemin de `ExecStart` est faux ou le fichier n'est pas exécutable.
