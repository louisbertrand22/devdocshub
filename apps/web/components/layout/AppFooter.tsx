"use client";

import React from "react";
import "./AppFooter.css";

export function AppFooter() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: "GitHub", href: "https://github.com/louisbertrand22", label: "GitHub" },
    { name: "Twitter", href: "https://twitter.com", label: "Twitter" },
    { name: "LinkedIn", href: "https://www.linkedin.com/in/louis-bertrand222/", label: "LinkedIn" },
  ];

  const footerLinks = {
    product: [
      { label: "Fonctionnalités", href: "#features" },
      { label: "Tarifs", href: "#pricing" },
      { label: "Documentation", href: "#doc" },
      { label: "Changelog", href: "#changelog" },
    ],
    company: [
      { label: "À propos", href: "#about" },
      { label: "Blog", href: "#blog" },
      { label: "Carrières", href: "#careers" },
      { label: "Contact", href: "#contact" },
    ],
    legal: [
      { label: "Confidentialité", href: "/privacy" },
      { label: "Conditions", href: "/terms" },
      { label: "Cookies", href: "/cookies" },
      { label: "Licences", href: "/licenses" },
    ],
  };

  // SVG Icons inline
  const GithubIcon = () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
    </svg>
  );

  const TwitterIcon = () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );

  const LinkedInIcon = () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );

  const HeartIcon = () => (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
  );

  const ExternalLinkIcon = () => (
    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );

  return (
    <footer className="app-footer">
      <div className="app-footer__container">
        {/* Top section */}
        <div className="app-footer__top">
          {/* Brand */}
          <div className="app-footer__brand">
            <div className="app-footer__logo">
              <span className="app-footer__logo-icon">🧭</span>
              <span className="app-footer__logo-text">DevDocsHub</span>
            </div>
            <p className="app-footer__tagline">
              Centralisez votre documentation technique et vos notes de développement.
            </p>
            {/* Social links */}
            <div className="app-footer__social">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="app-footer__social-link"
                  aria-label={social.label}
                >
                  {social.name === "GitHub" && <GithubIcon />}
                  {social.name === "Twitter" && <TwitterIcon />}
                  {social.name === "LinkedIn" && <LinkedInIcon />}
                </a>
              ))}
            </div>
          </div>

          {/* Links columns */}
          <div className="app-footer__links">
            <div className="app-footer__links-column">
              <h3 className="app-footer__links-title">Produit</h3>
              <ul className="app-footer__links-list">
                {footerLinks.product.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="app-footer__link">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="app-footer__links-column">
              <h3 className="app-footer__links-title">Entreprise</h3>
              <ul className="app-footer__links-list">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="app-footer__link">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="app-footer__links-column">
              <h3 className="app-footer__links-title">Légal</h3>
              <ul className="app-footer__links-list">
                {footerLinks.legal.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="app-footer__link">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="app-footer__divider" />

        {/* Bottom section */}
        <div className="app-footer__bottom">
          <p className="app-footer__copyright">
            © {currentYear} DevDocsHub. Tous droits réservés.
          </p>

          <div className="app-footer__powered">
            <span className="app-footer__powered-text">Propulsé par</span>
            <a
              href="https://nextjs.org"
              target="_blank"
              rel="noopener noreferrer"
              className="app-footer__powered-link"
            >
              Next.js
              <ExternalLinkIcon />
            </a>
            <HeartIcon />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default AppFooter;