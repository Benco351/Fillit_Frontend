// src/aws-amplify.d.ts
import 'aws-amplify';

declare module 'aws-amplify' {
  interface AuthConfig {
    region?: string;
    identityPoolId?: string;
  }
}
