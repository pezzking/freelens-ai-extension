/**
 * Utility to fetch available models from OpenAI-compatible API endpoints
 * Uses Node.js http/https modules to bypass CORS restrictions in Electron
 */

import * as http from "http";
import * as https from "https";

export interface ModelInfo {
  id: string;
  object: string;
  created?: number;
  owned_by?: string;
}

export interface ModelsResponse {
  object: string;
  data: ModelInfo[];
}

/**
 * Makes an HTTP/HTTPS request using Node.js modules (bypasses CORS)
 */
function makeRequest(url: string, apiKey?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === "https:";
    const client = isHttps ? https : http;

    const options: http.RequestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (apiKey) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${apiKey}`,
      };
    }

    const req = client.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    req.end();
  });
}

/**
 * Fetches available models from an OpenAI-compatible /v1/models endpoint
 * @param baseUrl - The base URL of the API (e.g., "https://api.deepseek.com/v1")
 * @param apiKey - Optional API key for authentication
 * @returns Array of model IDs
 */
export async function fetchAvailableModels(baseUrl: string, apiKey?: string): Promise<string[]> {
  try {
    // Ensure baseUrl ends with /v1
    const normalizedBaseUrl = baseUrl.endsWith("/v1") ? baseUrl : `${baseUrl}/v1`;
    const modelsUrl = `${normalizedBaseUrl}/models`;

    const responseData = await makeRequest(modelsUrl, apiKey);
    const data: ModelsResponse = JSON.parse(responseData);

    if (!data.data || !Array.isArray(data.data)) {
      throw new Error("Invalid response format from models endpoint");
    }

    return data.data.map((model) => model.id);
  } catch (error) {
    throw new Error(`Error fetching models: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Validates that a base URL is accessible and returns an OpenAI-compatible response
 * @param baseUrl - The base URL to validate
 * @param apiKey - Optional API key for authentication
 * @returns true if valid, throws error otherwise
 */
export async function validateEndpoint(baseUrl: string, apiKey?: string): Promise<boolean> {
  try {
    await fetchAvailableModels(baseUrl, apiKey);
    return true;
  } catch (error) {
    throw error;
  }
}
