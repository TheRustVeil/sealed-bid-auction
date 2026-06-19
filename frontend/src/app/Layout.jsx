import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';

function useNavBack() {
  const { pathname } = useLocation();
  if (pathname === '/operator/create' || pathname.startsWith('/operator/distribution/')) {
    return { label: 'Operator', to: '/operator' };
  }
  return undefined;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export function Layout() {
  const location = useLocation();
  const back = useNavBack();

  return (
    <>
      <ScrollToTop />
      <Navbar back={back} />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12, ease: 'easeOut' }}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </>
  );
}
