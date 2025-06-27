import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "684f63a79ad475ecf8c21735", 
  requiresAuth: true // Ensure authentication is required for all operations
});
