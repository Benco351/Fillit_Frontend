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
    fetchAuthSession()
      .then(({ tokens }) => {
        if (!tokens) return setAllowed(false);

        if (!requireGroup) return setAllowed(true);

        const rawGroups = tokens.idToken?.payload['cognito:groups'];
        let groups: string[] = [];
        if (Array.isArray(rawGroups)) {
          groups = rawGroups as string[];
        } else if (typeof rawGroups === 'string') {
          groups = [rawGroups];
        }
        //setAllowed(groups.includes(requireGroup));
        setAllowed(groups.includes("Admins"));
      })
      .catch(() => setAllowed(false));
  }, [requireGroup]);

  if (allowed === null) return null;           // spinner if desired
  return allowed ? children : <Navigate to={redirectTo} replace />;
};
