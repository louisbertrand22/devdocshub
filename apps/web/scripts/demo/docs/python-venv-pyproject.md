---
title: Environnements virtuels et pyproject.toml
slug: python-venv-pyproject
tech: python
---

Un environnement virtuel isole les dépendances d'un projet Python de celles du système et des autres projets. Le fichier `pyproject.toml` décrit le projet et ses dépendances de façon standard (PEP 621).

## Créer et activer un environnement

```bash
python3 -m venv .venv
source .venv/bin/activate        # Linux / macOS
.venv\Scripts\activate           # Windows (PowerShell)
```

Une fois activé, `python` et `pip` pointent vers l'environnement :

```bash
which python
python -m pip install --upgrade pip
```

`deactivate` en sort. Ajoute `.venv/` au `.gitignore`.

## Décrire le projet

```toml
[build-system]
requires = ["setuptools>=68"]
build-backend = "setuptools.build_meta"

[project]
name = "monapp"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
  "httpx>=0.27",
  "pydantic>=2.6",
]

[project.optional-dependencies]
dev = ["pytest>=8", "ruff>=0.4"]

[project.scripts]
monapp = "monapp.cli:main"
```

## Installer le projet en mode éditable

Depuis la racine du projet, environnement activé :

```bash
pip install -e ".[dev]"
```

Le code de `src/` ou du paquet est utilisé directement : une modification est prise en compte sans réinstaller. La commande `monapp` définie dans `[project.scripts]` devient disponible.

## Figer les versions

`pyproject.toml` exprime des contraintes ; pour reproduire exactement un environnement, exporte les versions installées :

```bash
pip freeze --exclude-editable > requirements.lock
pip install -r requirements.lock
```

Des outils comme `pip-tools` (`pip-compile`) ou `uv` produisent un verrou à partir des contraintes du `pyproject.toml`.

## Avec uv

`uv` crée l'environnement et installe beaucoup plus vite, avec les mêmes fichiers standard :

```bash
uv venv
uv pip install -e ".[dev]"
uv run pytest
```

## Structure recommandée

```text
monapp/
├── pyproject.toml
├── src/
│   └── monapp/
│       ├── __init__.py
│       └── cli.py
└── tests/
    └── test_cli.py
```

La disposition `src/` évite d'importer par erreur le code du dossier courant au lieu du paquet installé.

## Dépannage

- **`ModuleNotFoundError` alors que le paquet est installé** : l'environnement n'est pas activé, ou l'éditeur utilise un autre interpréteur.
- **`externally-managed-environment`** : le Python du système refuse `pip install` global (PEP 668) ; crée un environnement virtuel.
- Pour repartir de zéro, supprime `.venv/` et recrée-le.
