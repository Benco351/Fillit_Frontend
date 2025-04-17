import React from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import AppRoutes from './components/Routers';

const App: React.FC = () => (
  // Provide Amplify’s context to the whole tree:
  <Authenticator.Provider>
    <AppRoutes />
  </Authenticator.Provider>
);

export default App;
