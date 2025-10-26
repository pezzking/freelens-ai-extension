import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { useState } from "react";
import { PreferencesStore } from "../../../common/store";
import { fetchAvailableModels } from "../../utils/model-fetcher";

const {
  Component: { Input, Switch, HorizontalLine, Select },
} = Renderer;

type SelectOption = Renderer.Component.SelectOption<string>;

export const PreferencesPage = observer(() => {
  const preferencesStore: PreferencesStore = PreferencesStore.getInstanceOrCreate<PreferencesStore>();

  // State for fetched models
  const [customOpenAIModels, setCustomOpenAIModels] = useState<string[]>([]);
  const [lmStudioModels, setLmStudioModels] = useState<string[]>([]);
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);

  // Loading states
  const [customOpenAILoading, setCustomOpenAILoading] = useState(false);
  const [lmStudioLoading, setLmStudioLoading] = useState(false);
  const [ollamaLoading, setOllamaLoading] = useState(false);

  // Error states
  const [customOpenAIError, setCustomOpenAIError] = useState<string | null>(null);
  const [lmStudioError, setLmStudioError] = useState<string | null>(null);
  const [ollamaError, setOllamaError] = useState<string | null>(null);

  // Fetch models handlers
  const handleFetchCustomOpenAIModels = async () => {
    if (!preferencesStore.customOpenAIBaseUrl) {
      setCustomOpenAIError("Please enter a base URL first");
      return;
    }

    setCustomOpenAILoading(true);
    setCustomOpenAIError(null);

    try {
      const models = await fetchAvailableModels(
        preferencesStore.customOpenAIBaseUrl,
        preferencesStore.customOpenAIKey || undefined,
      );
      setCustomOpenAIModels(models);
      if (models.length > 0 && !preferencesStore.customOpenAIModelName) {
        preferencesStore.customOpenAIModelName = models[0];
      }
    } catch (error) {
      setCustomOpenAIError(error instanceof Error ? error.message : String(error));
    } finally {
      setCustomOpenAILoading(false);
    }
  };

  const handleFetchLmStudioModels = async () => {
    if (!preferencesStore.lmStudioBaseUrl) {
      setLmStudioError("Please enter a base URL first");
      return;
    }

    setLmStudioLoading(true);
    setLmStudioError(null);

    try {
      const models = await fetchAvailableModels(preferencesStore.lmStudioBaseUrl);
      setLmStudioModels(models);
      if (models.length > 0 && !preferencesStore.lmStudioModelName) {
        preferencesStore.lmStudioModelName = models[0];
      }
    } catch (error) {
      setLmStudioError(error instanceof Error ? error.message : String(error));
    } finally {
      setLmStudioLoading(false);
    }
  };

  const handleFetchOllamaModels = async () => {
    if (!preferencesStore.ollamaBaseUrl) {
      setOllamaError("Please enter a base URL first");
      return;
    }

    setOllamaLoading(true);
    setOllamaError(null);

    try {
      const models = await fetchAvailableModels(preferencesStore.ollamaBaseUrl);
      setOllamaModels(models);
      if (models.length > 0 && !preferencesStore.ollamaModelName) {
        preferencesStore.ollamaModelName = models[0];
      }
    } catch (error) {
      setOllamaError(error instanceof Error ? error.message : String(error));
    } finally {
      setOllamaLoading(false);
    }
  };

  return (
    <>
      <div>
        <div style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>OpenAI</div>
        <Switch
          style={{ marginBottom: 8 }}
          label="Enable OpenAI"
          checked={preferencesStore.openAIEnabled}
          onChange={(checked: boolean) => (preferencesStore.openAIEnabled = checked)}
        />
        <div style={{ marginTop: 8, fontWeight: "bold" }}>API Key</div>
        <Input
          placeholder="Put here your OpenAI API key"
          value={preferencesStore.openAIKey}
          onChange={(value: string) => (preferencesStore.openAIKey = value)}
          disabled={!preferencesStore.openAIEnabled}
        />
      </div>

      <HorizontalLine />
      <div>
        <div style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>Google AI</div>
        <Switch
          style={{ marginBottom: 8 }}
          label="Enable Google AI"
          checked={preferencesStore.googleAIEnabled}
          onChange={(checked: boolean) => (preferencesStore.googleAIEnabled = checked)}
        />
        <div style={{ marginTop: 8, fontWeight: "bold" }}>API Key</div>
        <Input
          placeholder="Put here your GoogleAI API key"
          value={preferencesStore.googleAIKey}
          onChange={(value: string) => (preferencesStore.googleAIKey = value)}
          disabled={!preferencesStore.googleAIEnabled}
        />
      </div>

      <HorizontalLine />
      <div>
        <div style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>Custom OpenAI Endpoint</div>
        <Switch
          style={{ marginBottom: 8 }}
          label="Enable Custom OpenAI Endpoint"
          checked={preferencesStore.customOpenAIEnabled}
          onChange={(checked: boolean) => (preferencesStore.customOpenAIEnabled = checked)}
        />
        <div style={{ fontSize: 13, marginBottom: 8, color: "#aaa" }}>
          Use this for OpenAI-compatible APIs like DeepSeek, Groq, or other providers.
        </div>
        <div style={{ marginTop: 8, fontWeight: "bold" }}>Base URL</div>
        <Input
          placeholder="e.g., https://api.deepseek.com/v1"
          value={preferencesStore.customOpenAIBaseUrl}
          onChange={(value: string) => (preferencesStore.customOpenAIBaseUrl = value)}
          disabled={!preferencesStore.customOpenAIEnabled}
        />
        <div style={{ marginTop: 8, fontWeight: "bold" }}>API Key (optional for some providers)</div>
        <Input
          placeholder="API key if required"
          value={preferencesStore.customOpenAIKey}
          onChange={(value: string) => (preferencesStore.customOpenAIKey = value)}
          disabled={!preferencesStore.customOpenAIEnabled}
        />
        <div style={{ marginTop: 8, fontWeight: "bold" }}>Model Name</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {customOpenAIModels.length > 0 ? (
            <Select
              options={customOpenAIModels.map((model) => ({ value: model, label: model } as SelectOption))}
              value={preferencesStore.customOpenAIModelName}
              onChange={(option: SelectOption | null) => {
                if (option) preferencesStore.customOpenAIModelName = option.value;
              }}
              themeName="lens"
              isDisabled={!preferencesStore.customOpenAIEnabled}
            />
          ) : (
            <Input
              placeholder="e.g., gpt-4o or deepseek-chat"
              value={preferencesStore.customOpenAIModelName}
              onChange={(value: string) => (preferencesStore.customOpenAIModelName = value)}
              disabled={!preferencesStore.customOpenAIEnabled}
              style={{ flex: 1 }}
            />
          )}
          <button
            onClick={handleFetchCustomOpenAIModels}
            disabled={!preferencesStore.customOpenAIEnabled || customOpenAILoading}
            style={{
              padding: "6px 12px",
              borderRadius: 4,
              border: "1px solid #ccc",
              background: "#00A7A0",
              color: "#fff",
              cursor: customOpenAILoading ? "wait" : "pointer",
              whiteSpace: "nowrap",
              fontSize: 13,
            }}
          >
            {customOpenAILoading ? "Fetching..." : "Fetch"}
          </button>
        </div>
        {customOpenAIError && <div style={{ color: "#ff4444", fontSize: 12, marginTop: 4 }}>{customOpenAIError}</div>}
      </div>

      <HorizontalLine />
      <div>
        <div style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>LM Studio</div>
        <Switch
          style={{ marginBottom: 8 }}
          label="Enable LM Studio"
          checked={preferencesStore.lmStudioEnabled}
          onChange={(checked: boolean) => (preferencesStore.lmStudioEnabled = checked)}
        />
        <div style={{ fontSize: 13, marginBottom: 8, color: "#aaa" }}>
          Run models locally with LM Studio. No API key required.
        </div>
        <div style={{ marginTop: 8, fontWeight: "bold" }}>Base URL</div>
        <Input
          placeholder="e.g., http://127.0.0.1:1234 or http://127.0.0.1:1234/v1"
          value={preferencesStore.lmStudioBaseUrl}
          onChange={(value: string) => (preferencesStore.lmStudioBaseUrl = value)}
          disabled={!preferencesStore.lmStudioEnabled}
        />
        <div style={{ marginTop: 8, fontWeight: "bold" }}>Model Name</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {lmStudioModels.length > 0 ? (
            <Select
              options={lmStudioModels.map((model) => ({ value: model, label: model } as SelectOption))}
              value={preferencesStore.lmStudioModelName}
              onChange={(option: SelectOption | null) => {
                if (option) preferencesStore.lmStudioModelName = option.value;
              }}
              themeName="lens"
              isDisabled={!preferencesStore.lmStudioEnabled}
            />
          ) : (
            <Input
              placeholder="e.g., local-model or llama-3.2-3b"
              value={preferencesStore.lmStudioModelName}
              onChange={(value: string) => (preferencesStore.lmStudioModelName = value)}
              disabled={!preferencesStore.lmStudioEnabled}
              style={{ flex: 1 }}
            />
          )}
          <button
            onClick={handleFetchLmStudioModels}
            disabled={!preferencesStore.lmStudioEnabled || lmStudioLoading}
            style={{
              padding: "6px 12px",
              borderRadius: 4,
              border: "1px solid #ccc",
              background: "#00A7A0",
              color: "#fff",
              cursor: lmStudioLoading ? "wait" : "pointer",
              whiteSpace: "nowrap",
              fontSize: 13,
            }}
          >
            {lmStudioLoading ? "Fetching..." : "Fetch"}
          </button>
        </div>
        {lmStudioError && <div style={{ color: "#ff4444", fontSize: 12, marginTop: 4 }}>{lmStudioError}</div>}
      </div>

      <HorizontalLine />
      <div>
        <div style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>Ollama</div>
        <Switch
          style={{ marginBottom: 8 }}
          label="Enable Ollama"
          checked={preferencesStore.ollamaEnabled}
          onChange={(checked: boolean) => (preferencesStore.ollamaEnabled = checked)}
        />
        <div style={{ fontSize: 13, marginBottom: 8, color: "#aaa" }}>
          Run models locally with Ollama. No API key required.
        </div>
        <div style={{ marginTop: 8, fontWeight: "bold" }}>Base URL</div>
        <Input
          placeholder="e.g., http://127.0.0.1:11434 or http://127.0.0.1:11434/v1"
          value={preferencesStore.ollamaBaseUrl}
          onChange={(value: string) => (preferencesStore.ollamaBaseUrl = value)}
          disabled={!preferencesStore.ollamaEnabled}
        />
        <div style={{ marginTop: 8, fontWeight: "bold" }}>Model Name</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {ollamaModels.length > 0 ? (
            <Select
              options={ollamaModels.map((model) => ({ value: model, label: model } as SelectOption))}
              value={preferencesStore.ollamaModelName}
              onChange={(option: SelectOption | null) => {
                if (option) preferencesStore.ollamaModelName = option.value;
              }}
              themeName="lens"
              isDisabled={!preferencesStore.ollamaEnabled}
            />
          ) : (
            <Input
              placeholder="e.g., llama3.2 or mistral:7b"
              value={preferencesStore.ollamaModelName}
              onChange={(value: string) => (preferencesStore.ollamaModelName = value)}
              disabled={!preferencesStore.ollamaEnabled}
              style={{ flex: 1 }}
            />
          )}
          <button
            onClick={handleFetchOllamaModels}
            disabled={!preferencesStore.ollamaEnabled || ollamaLoading}
            style={{
              padding: "6px 12px",
              borderRadius: 4,
              border: "1px solid #ccc",
              background: "#00A7A0",
              color: "#fff",
              cursor: ollamaLoading ? "wait" : "pointer",
              whiteSpace: "nowrap",
              fontSize: 13,
            }}
          >
            {ollamaLoading ? "Fetching..." : "Fetch"}
          </button>
        </div>
        {ollamaError && <div style={{ color: "#ff4444", fontSize: 12, marginTop: 4 }}>{ollamaError}</div>}
      </div>

      <HorizontalLine />
      <div>
        <div style={{ fontWeight: "bold" }}>Enable MCP</div>
        <Switch
          style={{ marginBottom: 8 }}
          label="Enable MCP"
          checked={preferencesStore.mcpEnabled}
          onChange={(checked: boolean) => (preferencesStore.mcpEnabled = checked)}
        />
        Please note that MCP servers currently do not work with Gemini 2.0 Flash
        <div>
          <div style={{ marginBottom: 8, fontWeight: "bold" }}>MCP JSON Configuration</div>
          <textarea
            style={{
              width: "100%",
              minHeight: 250,
              fontFamily: "monospace",
              fontSize: 14,
              padding: 8,
              borderRadius: 4,
              border: "1px solid #ccc",
              background: "#222",
              color: "#fff",
            }}
            placeholder="Paste or edit your MCP JSON configuration here"
            value={preferencesStore.mcpConfiguration}
            onChange={async (e) => preferencesStore.updateMcpConfiguration(e.target.value).then(() => {})}
          />
        </div>
      </div>
    </>
  );
});
