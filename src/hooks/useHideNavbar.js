import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook para determinar si ocultar la navbar en la ruta actual.
 * - hideRoutes puede ser:
 *   - array de strings (exact match, wildcard '*' al final, o rutas con :param),
 *   - array de RegExp,
 *   - función (pathname) => boolean,
 *   - string (se convierte a array).
 *
 *
 * @param {Array<string|RegExp>|string|function} hideRoutes
 * @returns {boolean}
 */
export function useHideNavbar(hideRoutes = ['/login', '/register']) {
  const { pathname } = useLocation();

  return useMemo(() => {
    if (typeof hideRoutes === 'function') return Boolean(hideRoutes(pathname));

    const routes = Array.isArray(hideRoutes) ? hideRoutes : [hideRoutes];

    return routes.some((route) => {
      if (!route) return false;

      if (route instanceof RegExp) return route.test(pathname);

      if (typeof route !== 'string') return false;
      if (route === pathname) return true;

      if (route.endsWith('*')) {
        const prefix = route.slice(0, -1);
        return pathname.startsWith(prefix);
      }

      if (route.includes(':')) {
        const pattern = '^' + route.replace(/:[^/]+/g, '[^/]+') + '$';
        try {
          return new RegExp(pattern).test(pathname);
        } catch {
          return false;
        }
      }

      return false;
    });
  }, [hideRoutes, pathname]);
}
