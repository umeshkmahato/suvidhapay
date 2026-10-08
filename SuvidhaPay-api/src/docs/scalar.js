// eslint-disable-next-line import/no-unresolved
import { getJsAsset, renderApiReference } from '@scalar/server-side-rendering';

const SCALAR_ASSET_PATH = '/docs/scalar.js';

/**
 * Generates self-hosted Scalar API Reference HTML.
 */
export const getScalarHTML = async (openApiDocument) => renderApiReference({
  pageTitle: 'SuvidhaPay API Documentation',
  cdn: SCALAR_ASSET_PATH,
  config: {
    content: JSON.stringify(openApiDocument),
    documentDownloadType: 'direct',
    documentUrl: '/openapi.json',
    theme: 'saturn',
  },
});

/**
 * Returns the bundled Scalar browser asset so the docs stay self-hosted.
 */
export const getScalarJavaScript = () => getJsAsset();

/**
 * Content-Security-Policy for the Scalar docs page.
 * Scalar SSR emits inline bootstrap script and styles, so those are explicitly allowed.
 */
export const scalarContentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "img-src 'self' data: https:",
  "font-src 'self' data: https:",
  "connect-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "worker-src 'self' blob:",
].join('; ');
