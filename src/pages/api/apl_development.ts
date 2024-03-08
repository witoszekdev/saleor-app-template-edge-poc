import { AuthData, FileAPL } from "@saleor/app-sdk/APL";
import type { NextApiRequest, NextApiResponse } from "next";
import { DebugAPL, debugAPLAuth } from "../../debug-apl";
import { saleorApp } from "../../saleor-app";

/**
 * Safely narrow unknown object and infer property existence
 * @param obj
 * @param key
 */
export function hasProp<K extends PropertyKey>(
  obj: unknown,
  key: K | null | undefined
): obj is Record<K, unknown> {
  return key != null && obj != null && typeof obj === "object" && key in obj;
}

/**
 * Checks if given object has fields used by the AuthData
 */
export const hasAuthData = (data: unknown) => {
  return (
    hasProp(data, "domain") &&
    data.domain &&
    hasProp(data, "token") &&
    data.token &&
    hasProp(data, "appId") &&
    data.appId &&
    hasProp(data, "saleorApiUrl") &&
    data.saleorApiUrl
  );
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(req.body, req.headers);
  if (process.env.NODE_ENV !== "development" || process.env.VERCEL) {
    console.log("not development");
    return res.status(500).end();
  }

  if (!(saleorApp.apl instanceof DebugAPL)) {
    console.log("invalid apl");
    return res.status(500).end();
  }

  const sessionToken = req.headers["session-token"];
  if (!sessionToken) {
    console.log("missing session token");
    return res.status(403).end();
  }

  if (saleorApp.apl.token !== sessionToken) {
    console.log("invalid session token", { got: debugAPLAuth.getToken(), expected: sessionToken });
    return res.status(403).end();
  }

  const apl = new FileAPL();

  if (req.method === "GET") {
    const saleorApiUrl = req.body;
    if (saleorApiUrl && saleorApiUrl.includes("http")) {
      const authData = apl.get(req.body);
      return res.json(authData);
    }
    const allAuthData = await apl.getAll();
    return res.json(allAuthData);
  }

  if (req.method === "POST") {
    if (!req.body) {
      return res.status(400).json({ success: false, error: "Missing body" });
    }
    const authData: AuthData = req.body;
    console.log(authData);
    await apl.set(authData);
    return res.json({ success: true });
  }

  if (req.method === "DELETE") {
    const saleorApiUrl = req.body;
    if (!saleorApiUrl) {
      return res.status(400).json({ success: false, error: "Missing saleerApiUrl" });
    }
    await apl.delete(saleorApiUrl);
    return res.json({ success: true });
  }

  return res.status(400).json({ success: false, error: "Invalid HTTP method" });
}

export default handler;
