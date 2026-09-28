"use client";

import { useEffect, useState } from "react";

/**
 * Le store d'auth lit localStorage dès l'import côté client, donc le premier rendu
 * client diffère du rendu serveur. Tout rendu qui dépend de `token`/`user`
 * attend `mounted` pour éviter un mismatch d'hydratation.
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
