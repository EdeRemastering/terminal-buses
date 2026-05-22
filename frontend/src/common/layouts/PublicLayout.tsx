import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

export const PublicLayout = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background"
    >
      <Outlet />
    </motion.div>
  );
};
