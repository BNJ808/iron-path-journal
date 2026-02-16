import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  index?: number;
  className?: string;
}

export const AnimatedCard = ({ children, index = 0, className }: AnimatedCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 16, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{
      duration: 0.35,
      delay: Math.min(index * 0.06, 0.3),
      ease: [0.25, 0.1, 0.25, 1],
    }}
    className={className}
  >
    {children}
  </motion.div>
);
