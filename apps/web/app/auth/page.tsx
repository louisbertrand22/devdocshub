"use client"

import { motion } from "framer-motion"
import AuthPanel from "@/components/auth-panel"
import styles from "./auth.module.css"

export default function AuthPage() {
  return (
    <div className={styles.authContainer}>
      {/* Decorative background elements */}
      <div className={styles.decorativeCircle} />
      <div className={styles.decorativeCircle} />
      
      <div className={styles.contentWrapper}>
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={styles.heroSection}
        >
          <div className={styles.logoIcon}>
            🧭
          </div>
          <h1 className={styles.heroTitle}>
            Bienvenue sur <span className={styles.brandName}>DevDocsHub</span>
          </h1>
          <p className={styles.heroDescription}>
            Gérez vos documents, notes et collections de développement en un seul endroit.
            Connectez-vous pour accéder à votre espace personnel et commencer à organiser votre travail.
          </p>
          
          {/* Feature badges */}
          <div className={styles.featureBadges}>
            <div className={styles.featureBadge}>
              <span className={styles.featureBadgeIcon}>📚</span>
              <span>Documentation organisée</span>
            </div>
            <div className={styles.featureBadge}>
              <span className={styles.featureBadgeIcon}>🔒</span>
              <span>Sécurisé</span>
            </div>
            <div className={styles.featureBadge}>
              <span className={styles.featureBadgeIcon}>⚡</span>
              <span>Rapide</span>
            </div>
          </div>
        </motion.div>

        {/* Auth Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
          className={styles.authPanelWrapper}
        >
          <AuthPanel />
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className={styles.footerInfo}
        >
          <p>🎉 Première visite ? Créez un compte pour commencer votre aventure et découvrir toutes les fonctionnalités.</p>
        </motion.div>
      </div>
    </div>
  )
}
