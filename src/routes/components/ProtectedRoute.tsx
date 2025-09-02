import { ReactElement, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { fetchAuthSession } from '@aws-amplify/auth';

type Props = {
  children: ReactElement;
  redirectTo: string;
  requireGroup?: string;           // optional group check
};

export const ProtectedRoute = ({ children, redirectTo, requireGroup }: Props) => {
  const [allowed, setAllowed] = useState<null | boolean>(null);

  useEffect(() => {
    let isMounted = true;
    const checkAccess = async () => {
      try {
        const { tokens } = await fetchAuthSession();
        if (!tokens || !tokens.idToken) {
          if (isMounted) setAllowed(false);
          return;
        }
        // Validate token expiration
        const exp = tokens.idToken.payload['exp'];
        if (typeof exp === 'number' && Date.now() / 1000 > exp) {
          if (isMounted) setAllowed(false);
          return;
        }
        if (!requireGroup) {
          if (isMounted) setAllowed(true);
          return;
        }
        // Cognito groups can be string or array
        const rawGroups = tokens.idToken.payload['cognito:groups'];
        let groups: string[] = [];
        if (Array.isArray(rawGroups)) {
          groups = rawGroups as string[];
        } else if (typeof rawGroups === 'string') {
          groups = [rawGroups];
        }
        if (isMounted) setAllowed(groups.includes(requireGroup));
      } catch (err) {
        if (isMounted) setAllowed(false);
      }
    };
    checkAccess();
    return () => { isMounted = false; };
  }, [requireGroup]);

  if (allowed === null) return null;           // spinner if desired
  return allowed ? children : <Navigate to={redirectTo} replace />;
};
