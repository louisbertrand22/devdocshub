"use client"

import { motion } from "framer-motion"
import AuthPanel from "@/components/auth-panel"

export default function AuthPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-2xl mb-4">
            🧭
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Bienvenue sur <span className="text-indigo-600">DevDocsHub</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Gérez vos documents, notes et collections de développement en un seul endroit.
            Connectez-vous pour accéder à votre espace personnel.
          </p>
        </motion.div>

        {/* Auth Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <AuthPanel />
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-center text-sm text-muted-foreground"
        >
          <p>Première visite ? Créez un compte pour commencer votre aventure.</p>
        </motion.div>
      </div>
    </div>
  )
}
