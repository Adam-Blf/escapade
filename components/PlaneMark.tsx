"use client";

import { motion } from "framer-motion";

/**
 * Petit avion à côté du wordmark : la seule touche "mignonne" volontaire
 * dans un design par ailleurs sobre. S'envole au survol, revient se poser.
 */
export function PlaneMark() {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="h-4 w-4 text-corail"
      initial={{ x: 0, y: 0, rotate: -8 }}
      whileHover={{ x: 3, y: -3, rotate: 4, transition: { type: "spring", stiffness: 300, damping: 12 } }}
      animate={{ y: [0, -1.5, 0] }}
      transition={{ y: { duration: 2.6, repeat: Infinity, ease: "easeInOut" } }}
    >
      <path
        fill="currentColor"
        d="M21.7 2.3a1 1 0 0 0-1-.25L2.5 7.9a1 1 0 0 0-.06 1.9l6.9 2.6 2.6 6.9a1 1 0 0 0 1.9-.06l5.85-18.2a1 1 0 0 0-.25-1z"
      />
    </motion.svg>
  );
}
