import { APL, AuthData } from "@saleor/app-sdk/APL";

export class DebugAPL implements APL {
  constructor(private baseAppUrl: string, public token: string) {}

  private endpointUrl = `${this.baseAppUrl}/api/apl_development`;

  async set(authData: AuthData) {
    console.log("Saving auth data", authData);
    try {
      const result = await fetch(this.endpointUrl, {
        body: JSON.stringify(authData),
        headers: {
          "Session-token": this.token,
        },

        method: "POST",
      });

      if (!result.ok) {
        console.log(await result.text());
        throw new Error("Failed to set auth data in APL");
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async get(saleorApiUrl: string) {
    const result = await fetch(this.endpointUrl, {
      body: saleorApiUrl,
      headers: {
        "Session-token": this.token,
      },
      method: "GET",
    });
    if (!result.ok) {
      throw new Error("Failed to get auth data from APL");
    }

    const json = await result.json();
    if (!json) {
      throw new Error("Failed to parse auth data from APL");
    }

    return json as AuthData;
  }

  async delete(saleorApiUrl: string) {
    await fetch(this.endpointUrl, {
      body: saleorApiUrl,
      headers: {
        "Session-token": this.token,
      },
      method: "DELETE",
    });
  }

  async getAll() {
    const result = await fetch(this.endpointUrl, {
      method: "GET",
      headers: {
        "Session-token": this.token,
      },
    });

    if (!result.ok) {
      throw new Error("Failed to get auth data from APL");
    }

    const json = await result.json();
    if (!json) {
      throw new Error("Failed to parse auth data from APL");
    }

    return json as AuthData[];
  }

  async isReady() {
    return {
      ready: true,
    } as const;
  }

  async isConfigured() {
    return {
      configured: true,
    } as const;
  }
}
