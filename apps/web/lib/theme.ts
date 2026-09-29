export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "theme";

/** Dark par défaut : seul un choix explicite "light" donne le thème clair. */
export function resolveTheme(stored: string | null | undefined): Theme {
  return stored === "light" ? "light" : "dark";
}

/**
 * Script inline exécuté dans <head> avant le premier paint.
 * Le serveur rend <html class="dark"> ; on ne retire la classe que si
 * l'utilisateur a explicitement choisi le light.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});document.documentElement.classList.toggle("dark",t!=="light");}catch(e){document.documentElement.classList.add("dark");}})();`;
