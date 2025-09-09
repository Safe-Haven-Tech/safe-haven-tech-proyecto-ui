import { useLocation } from 'react-router-dom';

export function useHideNavbar(hideRoutes = ['/login', '/register']) {
  const location = useLocation();
  return hideRoutes.includes(location.pathname);
}
