import { Outlet, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import TopNavigation from './TopNavigation';

const pageVariants = {
  initial: {
    opacity: 0,
    scale: 0.98,
    filter: 'blur(10px)'
  },
  animate: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1] as const
    }
  },
  exit: {
    opacity: 0,
    scale: 1.02,
    filter: 'blur(10px)',
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1] as const
    }
  }
};

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />

      <main className="pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
