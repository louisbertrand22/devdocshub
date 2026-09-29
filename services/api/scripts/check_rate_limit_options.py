"""Les preflights CORS (OPTIONS) ne consomment pas le quota du limiteur global.

Usage (API fraîchement redémarrée) :
  docker compose restart api && docker compose exec -T api python - < services/api/scripts/check_rate_limit_options.py
Envoie 130 OPTIONS (> 120/min), puis vérifie qu'un GET passe encore.
Utilise une IP dédiée via X-Forwarded-For pour ne pas entamer le quota des autres tests.
"""
import sys
import uuid

import requests

API = "http://localhost:8000"


def main() -> int:
    ip = f"10.{uuid.uuid4().int % 250}.{uuid.uuid4().int % 250}.1"
    preflight = {"Origin": "http://localhost:3000", "Access-Control-Request-Method": "GET", "X-Forwarded-For": ip}
    codes = {requests.options(f"{API}/", headers=preflight).status_code for _ in range(130)}
    r = requests.get(f"{API}/", headers={"X-Forwarded-For": ip})
    ok = r.status_code == 200 and 429 not in codes
    print("OK" if ok else f"FAIL options={sorted(codes)} get={r.status_code}")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
