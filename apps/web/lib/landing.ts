/**
 * Script inline de <head> : sur `/`, si un token existe, pose `data-authed` sur <html>.
 * Le CSS masque alors la landing avant le premier paint ; LandingRedirect envoie
 * ensuite vers /dashboard. Stockage inaccessible → visiteur traité comme déconnecté.
 */
export const landingInitScript = `(function(){try{if(location.pathname==="/"&&localStorage.getItem("ddh_token")){document.documentElement.setAttribute("data-authed","")}}catch(e){}})();`;
