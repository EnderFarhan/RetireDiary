'use client';

import { motion } from 'framer-motion';

export function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5 }}
      className={`space-y-4 ${className}`}
    >
      {children}
    </motion.section>
  );
}
