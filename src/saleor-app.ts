import { SaleorApp } from "@saleor/app-sdk/saleor-app";
import { APL, UpstashAPL } from "@saleor/app-sdk/APL";
import { _experimental_VercelKvApl } from "@saleor/app-sdk/APL/vercel-kv";
import { DebugAPL } from "./debug-apl";

/**
 * By default auth data are stored in the `.auth-data.json` (FileAPL).
 * For multi-tenant applications and deployments please use UpstashAPL.
 *
 * To read more about storing auth data, read the
 * [APL documentation](https://github.com/saleor/saleor-app-sdk/blob/main/docs/apl.md)
 */

export let apl: APL;
switch (process.env.APL) {
  case "upstash":
    // Require `UPSTASH_URL` and `UPSTASH_TOKEN` environment variables
    apl = new UpstashAPL();
    break;
  case "vercel-kv":
    apl = new _experimental_VercelKvApl();
  default:
    if (!process.env.VERCEL && process.env.NODE_ENV === "development") {
      if (!process.env.BASE_APP_URL) {
        throw new Error("Missing BASE_APP_URL environment variable");
      }
      if (!process.env.DEBUG_APL_TOKEN) {
        throw new Error("Missing DEBUG_APL_TOKEN environment variable");
      }

      apl = new DebugAPL(process.env.BASE_APP_URL, process.env.DEBUG_APL_TOKEN);
    } else {
      throw new Error("APL is not configured, cannot use DebugAPL");
    }
}

export const saleorApp = new SaleorApp({
  apl,
});
