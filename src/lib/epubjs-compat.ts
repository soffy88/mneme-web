// epubjs 0.5 removed the default export that react-reader's public API still
// consumes.  This adapter is server-owned and is never exposed to the client
// as configuration; it only preserves that package boundary during bundling.
// @ts-expect-error epubjs ships this ESM browser bundle without declarations.
import { Epub } from '../../node_modules/epubjs/dist/epub.esm.js';

export default Epub;
