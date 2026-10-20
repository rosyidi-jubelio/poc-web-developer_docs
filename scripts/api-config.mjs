// The API base URL shown across the portal: the spec's server, the API testing tool and the
// docs examples. Override with PUBLIC_API_BASE_URL at build time.
// Temporary: points at the staging environment until the production host is ready.
export const DEFAULT_API_BASE_URL = 'https://poc-open-api.qm-staging-k8s.jubelio.io/openapi/v1';

export const PUBLIC_API_BASE_URL = process.env.PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL;
