---
title: Clés SSH et fichier de configuration
slug: ssh-cles-et-config
tech: linux
---

Une clé SSH remplace le mot de passe par une paire de clés : la clé privée reste sur ta machine, la clé publique est déposée sur le serveur. Le fichier `~/.ssh/config` évite de retaper hôtes, ports et utilisateurs.

## Générer une clé

Ed25519 est le type recommandé aujourd'hui :

```bash
ssh-keygen -t ed25519 -C "prenom@exemple.com"
```

Accepte l'emplacement par défaut (`~/.ssh/id_ed25519`) et choisis une phrase de passe. Deux fichiers sont créés :

| Fichier | Contenu | À partager ? |
|---|---|---|
| `id_ed25519` | Clé privée | Jamais |
| `id_ed25519.pub` | Clé publique | Oui |

## Installer la clé sur un serveur

```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub utilisateur@serveur.example.com
```

Sans `ssh-copy-id`, ajoute le contenu du `.pub` à `~/.ssh/authorized_keys` sur le serveur, avec les bonnes permissions :

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

## L'agent SSH

L'agent garde la clé déverrouillée pour la session et évite de retaper la phrase de passe :

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
ssh-add -l
```

Sur macOS, ajoute `--apple-use-keychain` pour mémoriser la phrase de passe dans le trousseau.

## Le fichier ~/.ssh/config

```text
Host prod
    HostName 203.0.113.10
    User deploy
    Port 2222
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes

Host bastion
    HostName bastion.example.com
    User admin

Host interne-*
    ProxyJump bastion
    User admin
```

Ensuite, `ssh prod` suffit, et `ssh interne-db` passe automatiquement par le bastion. Les mêmes alias fonctionnent avec `scp` et `rsync` :

```bash
scp dump.sql prod:/tmp/
rsync -avz ./site/ prod:/var/www/site/
```

## Redirection de port

Accéder à une base qui n'écoute que sur le serveur :

```bash
ssh -N -L 5433:localhost:5432 prod
```

La base distante est alors joignable sur `localhost:5433`.

## Désactiver les mots de passe côté serveur

Une fois la connexion par clé vérifiée, dans `/etc/ssh/sshd_config` :

```text
PasswordAuthentication no
PermitRootLogin no
```

```bash
sudo sshd -t && sudo systemctl reload ssh
```

Sur Debian et Ubuntu le service s'appelle `ssh` ; sur Fedora, RHEL ou Arch, c'est `sshd`.

Garde une session ouverte pendant ce changement pour ne pas t'enfermer dehors.

## Dépannage

`ssh -v prod` affiche quelles clés sont proposées et pourquoi l'authentification échoue. Une erreur fréquente : des permissions trop larges sur `~/.ssh` ou sur la clé privée (`chmod 600 ~/.ssh/id_ed25519`).
