"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const chat_models = require("../../node_modules/.pnpm/@langchain_google-genai@0.2.13_@langchain_core@0.3.61_openai@5.7.0_ws@8.18.3_zod@3.25.67__/node_modules/@langchain/google-genai/dist/chat_models.js");
require("../../node_modules/.pnpm/@google_generative-ai@0.24.1/node_modules/@google/generative-ai/dist/index.js");
require("../../_virtual/index3.js");
require("../../_virtual/index4.js");
require("../../node_modules/.pnpm/openai@5.7.0_ws@8.18.3_zod@3.25.67/node_modules/openai/client.js");
require("../../node_modules/.pnpm/openai@5.7.0_ws@8.18.3_zod@3.25.67/node_modules/openai/core/api-promise.js");
require("../../node_modules/.pnpm/openai@5.7.0_ws@8.18.3_zod@3.25.67/node_modules/openai/core/pagination.js");
const chat_models$1 = require("../../node_modules/.pnpm/@langchain_openai@0.5.18_@langchain_core@0.3.61_openai@5.7.0_ws@8.18.3_zod@3.25.67___ws@8.18.3/node_modules/@langchain/openai/dist/chat_models.js");
require("../../node_modules/.pnpm/@langchain_core@0.3.61_openai@5.7.0_ws@8.18.3_zod@3.25.67_/node_modules/@langchain/core/dist/utils/js-sha1/hash.js");
require("../../node_modules/.pnpm/@langchain_core@0.3.61_openai@5.7.0_ws@8.18.3_zod@3.25.67_/node_modules/@langchain/core/dist/utils/js-sha256/hash.js");
require("../../_virtual/index.js");
require("../../_virtual/index2.js");
require("../../node_modules/.pnpm/js-tiktoken@1.0.20/node_modules/js-tiktoken/dist/chunk-ZDNLBERF.js");
require("../../node_modules/.pnpm/langsmith@0.3.33_openai@5.7.0_ws@8.18.3_zod@3.25.67_/node_modules/langsmith/dist/run_trees.js");
require("../../node_modules/.pnpm/@langchain_core@0.3.61_openai@5.7.0_ws@8.18.3_zod@3.25.67_/node_modules/@langchain/core/dist/tracers/console.js");
require("../../_virtual/index5.js");
require("../../node_modules/.pnpm/langsmith@0.3.33_openai@5.7.0_ws@8.18.3_zod@3.25.67_/node_modules/langsmith/dist/utils/fast-safe-stringify/index.js");
require("../../node_modules/.pnpm/zod-to-json-schema@3.24.5_zod@3.25.67/node_modules/zod-to-json-schema/dist/esm/parsers/string.js");
const preferencesStore = require("../../src/common/store/preferences-store.js");
const aiModels = require("./ai-models.js");
const normalizeBaseUrl = (baseUrl) => {
  if (!baseUrl) return baseUrl;
  const trimmed = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  return trimmed.endsWith("/v1") ? trimmed : `${trimmed}/v1`;
};
const deepRemoveVisionParams = (obj) => {
  if (obj === null || obj === void 0) return obj;
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => deepRemoveVisionParams(item));
  }
  const cleaned = {};
  for (const key in obj) {
    if (key === "vision" || key === "imageResizeSettings") {
      continue;
    }
    cleaned[key] = deepRemoveVisionParams(obj[key]);
  }
  return cleaned;
};
const injectVisionFieldsIntoStream = (originalBody) => {
  const reader = originalBody.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        console.log("[injectVisionFieldsIntoStream] Starting stream processing");
        while (true) {
          const {
            done,
            value
          } = await reader.read();
          if (done) {
            console.log("[injectVisionFieldsIntoStream] Stream ended");
            controller.close();
            break;
          }
          const text = decoder.decode(value, {
            stream: true
          });
          console.log("[injectVisionFieldsIntoStream] Received chunk:", text.substring(0, 200));
          const lines = text.split("\n");
          let modifiedText = "";
          for (const line of lines) {
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              try {
                const jsonStr = line.slice(6);
                const data = JSON.parse(jsonStr);
                if (!data.vision) {
                  data.vision = {
                    imageResizeSettings: null
                  };
                  console.log("[injectVisionFieldsIntoStream] Added vision field to root");
                }
                if (data.choices && Array.isArray(data.choices)) {
                  for (const choice of data.choices) {
                    if (!choice.vision) {
                      choice.vision = {
                        imageResizeSettings: null
                      };
                      console.log("[injectVisionFieldsIntoStream] Added vision field to choice", choice.index);
                    }
                  }
                }
                const modifiedLine = `data: ${JSON.stringify(data)}
`;
                console.log("[injectVisionFieldsIntoStream] Modified line:", modifiedLine.substring(0, 200));
                modifiedText += modifiedLine;
              } catch (e) {
                console.error("[LocalChatOpenAI] Failed to parse SSE line:", e);
                modifiedText += line + "\n";
              }
            } else {
              modifiedText += line + "\n";
            }
          }
          controller.enqueue(encoder.encode(modifiedText));
        }
      } catch (error) {
        controller.error(error);
      }
    },
    cancel() {
      reader.cancel();
    }
  });
};
const createVisionFreeFetch = (originalFetch) => {
  return async (url, init) => {
    const urlStr = url.toString();
    console.log("[LocalChatOpenAI] Custom fetch called:", urlStr);
    if (urlStr.includes("vision")) {
      console.log('[LocalChatOpenAI] ⚠️ FOUND "vision" in URL!');
    }
    console.log("[LocalChatOpenAI] Request method:", init?.method);
    console.log("[LocalChatOpenAI] Request headers:", init?.headers);
    if (init && init.body) {
      if (typeof init.body === "string") {
        try {
          const body = JSON.parse(init.body);
          console.log("[LocalChatOpenAI] Request body BEFORE cleaning (full):", init.body);
          const bodyStr = JSON.stringify(body);
          if (bodyStr.includes("vision")) {
            console.log('[LocalChatOpenAI] ⚠️ FOUND "vision" in request body!');
            console.log("[LocalChatOpenAI] Full body:", bodyStr);
          }
          const cleanedBody = deepRemoveVisionParams(body);
          const cleanedBodyStr = JSON.stringify(cleanedBody);
          if (cleanedBodyStr.includes("vision")) {
            console.log('[LocalChatOpenAI] ⚠️ WARNING: "vision" still present after cleaning!');
          }
          console.log("[LocalChatOpenAI] Request body AFTER cleaning:", cleanedBodyStr);
          const cleanedInit = {
            ...init,
            body: JSON.stringify(cleanedBody)
          };
          const response2 = await originalFetch(url, cleanedInit);
          console.log("[LocalChatOpenAI] Response status:", response2.status, response2.statusText);
          const contentType2 = response2.headers.get("content-type") || "";
          console.log("[LocalChatOpenAI] Response content-type:", contentType2);
          if (contentType2.includes("stream") && response2.body) {
            console.log("[LocalChatOpenAI] Wrapping streaming response to inject vision fields");
            const modifiedBody = injectVisionFieldsIntoStream(response2.body);
            return new Response(modifiedBody, {
              status: response2.status,
              statusText: response2.statusText,
              headers: response2.headers
            });
          }
          return response2;
        } catch (e) {
          console.log("[LocalChatOpenAI] Failed to parse body, passing through:", e);
          const response2 = await originalFetch(url, init);
          const contentType2 = response2.headers.get("content-type") || "";
          if (contentType2.includes("stream") && response2.body) {
            console.log("[LocalChatOpenAI] Wrapping streaming response (fallback path)");
            const modifiedBody = injectVisionFieldsIntoStream(response2.body);
            return new Response(modifiedBody, {
              status: response2.status,
              statusText: response2.statusText,
              headers: response2.headers
            });
          }
          return response2;
        }
      } else {
        console.log("[LocalChatOpenAI] Body is not a string, type:", typeof init.body);
      }
    }
    const response = await originalFetch(url, init);
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("stream") && response.body) {
      console.log("[LocalChatOpenAI] Wrapping streaming response (default path)");
      const modifiedBody = injectVisionFieldsIntoStream(response.body);
      return new Response(modifiedBody, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });
    }
    return response;
  };
};
class LocalChatOpenAI extends chat_models$1.ChatOpenAI {
  constructor(config) {
    const originalFetch = fetch.bind(globalThis);
    const customFetch = createVisionFreeFetch(originalFetch);
    super({
      model: config.model,
      apiKey: config.apiKey,
      configuration: {
        baseURL: config.baseURL,
        fetch: customFetch
      },
      streamUsage: false,
      maxRetries: 0
    });
    console.log("[LocalChatOpenAI] Instance created with custom fetch for model:", config.model);
  }
  // Override invocationParams to remove vision parameters
  invocationParams(options) {
    console.log("[LocalChatOpenAI] invocationParams called with options:", options);
    const params = super.invocationParams(options);
    console.log("[LocalChatOpenAI] Parent invocationParams result:", JSON.stringify(params, null, 2));
    const cleanedParams = deepRemoveVisionParams(params);
    console.log("[LocalChatOpenAI] Cleaned invocationParams:", JSON.stringify(cleanedParams, null, 2));
    return cleanedParams;
  }
  // Override withStructuredOutput to log when it's called
  // @ts-ignore - Complex union type
  withStructuredOutput(...args) {
    console.log("[LocalChatOpenAI] withStructuredOutput called with args:", args[0]);
    const result = super.withStructuredOutput(...args);
    console.log("[LocalChatOpenAI] withStructuredOutput result created");
    return result;
  }
}
const useModelProvider = () => {
  const preferencesStore$1 = preferencesStore.PreferencesStore.getInstanceOrCreate();
  const getModel = () => {
    switch (preferencesStore$1.selectedModel) {
      case aiModels.AIModelsEnum.GPT_3_5_TURBO:
      case aiModels.AIModelsEnum.O3_MINI:
      case aiModels.AIModelsEnum.GPT_4_1:
      case aiModels.AIModelsEnum.GPT_4_O:
      case aiModels.AIModelsEnum.GPT_5:
        const openAiApiKey = process.env.OPENAI_API_KEY || preferencesStore$1.openAIKey;
        return new chat_models$1.ChatOpenAI({
          model: preferencesStore$1.selectedModel,
          apiKey: openAiApiKey
        });
      case aiModels.AIModelsEnum.CUSTOM_OPENAI:
        const customOpenAIKey = process.env.CUSTOM_OPENAI_API_KEY || preferencesStore$1.customOpenAIKey;
        const customOpenAIBaseUrl = process.env.CUSTOM_OPENAI_BASE_URL || preferencesStore$1.customOpenAIBaseUrl;
        const customOpenAIModelName = process.env.CUSTOM_OPENAI_MODEL_NAME || preferencesStore$1.customOpenAIModelName;
        if (!customOpenAIBaseUrl) {
          throw new Error("Custom OpenAI base URL is required. Please configure it in settings.");
        }
        return new LocalChatOpenAI({
          baseURL: normalizeBaseUrl(customOpenAIBaseUrl),
          apiKey: customOpenAIKey || "not-needed-for-some-endpoints",
          model: customOpenAIModelName
        });
      case aiModels.AIModelsEnum.LMSTUDIO:
        const lmStudioBaseUrl = process.env.LMSTUDIO_BASE_URL || preferencesStore$1.lmStudioBaseUrl;
        const lmStudioModelName = process.env.LMSTUDIO_MODEL_NAME || preferencesStore$1.lmStudioModelName;
        if (!lmStudioBaseUrl) {
          throw new Error("LM Studio base URL is required. Please configure it in settings.");
        }
        return new LocalChatOpenAI({
          baseURL: normalizeBaseUrl(lmStudioBaseUrl),
          apiKey: "lm-studio",
          model: lmStudioModelName
        });
      case aiModels.AIModelsEnum.OLLAMA:
        const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || preferencesStore$1.ollamaBaseUrl;
        const ollamaModelName = process.env.OLLAMA_MODEL_NAME || preferencesStore$1.ollamaModelName;
        if (!ollamaBaseUrl) {
          throw new Error("Ollama base URL is required. Please configure it in settings.");
        }
        return new LocalChatOpenAI({
          baseURL: normalizeBaseUrl(ollamaBaseUrl),
          apiKey: "ollama",
          model: ollamaModelName
        });
      case aiModels.AIModelsEnum.GEMINI_2_FLASH:
        const googleApiKey = process.env.GOOGLE_API_KEY || preferencesStore$1.googleAIKey;
        return new chat_models.ChatGoogleGenerativeAI({
          model: preferencesStore$1.selectedModel,
          temperature: 0,
          apiKey: googleApiKey,
          streamUsage: false
        });
      default:
        throw new Error(`Unsupported model: ${preferencesStore$1.selectedModel}`);
    }
  };
  return {
    getModel
  };
};
exports.useModelProvider = useModelProvider;
//# sourceMappingURL=model-provider.js.map
