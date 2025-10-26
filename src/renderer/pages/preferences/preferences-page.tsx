import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { PreferencesStore } from "../../../common/store";

const {
  Component: { Input, Switch, HorizontalLine },
} = Renderer;

export const PreferencesPage = observer(() => {
  const preferencesStore: PreferencesStore = PreferencesStore.getInstanceOrCreate<PreferencesStore>();

  return (
    <>
      <div style={{ marginTop: 8, fontWeight: "bold" }}>OpenAI Key</div>
      <Input
        placeholder="Put here your OpenAI API key"
        value={preferencesStore.openAIKey}
        onChange={(value: string) => (preferencesStore.openAIKey = value)}
      />
      <div style={{ marginTop: 8, fontWeight: "bold" }}>GoogleAI Key</div>
      <Input
        placeholder="Put here your GoogleAI API key"
        value={preferencesStore.googleAIKey}
        onChange={(value: string) => (preferencesStore.googleAIKey = value)}
      />

      <HorizontalLine />
      <div>
        <div style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>Custom OpenAI Endpoint</div>
        <div style={{ fontSize: 13, marginBottom: 8, color: "#aaa" }}>
          Use this for OpenAI-compatible APIs like DeepSeek, Groq, or other providers.
        </div>
        <div style={{ marginTop: 8, fontWeight: "bold" }}>Base URL</div>
        <Input
          placeholder="e.g., https://api.deepseek.com/v1"
          value={preferencesStore.customOpenAIBaseUrl}
          onChange={(value: string) => (preferencesStore.customOpenAIBaseUrl = value)}
        />
        <div style={{ marginTop: 8, fontWeight: "bold" }}>API Key (optional for some providers)</div>
        <Input
          placeholder="API key if required"
          value={preferencesStore.customOpenAIKey}
          onChange={(value: string) => (preferencesStore.customOpenAIKey = value)}
        />
        <div style={{ marginTop: 8, fontWeight: "bold" }}>Model Name</div>
        <Input
          placeholder="e.g., gpt-4o or deepseek-chat"
          value={preferencesStore.customOpenAIModelName}
          onChange={(value: string) => (preferencesStore.customOpenAIModelName = value)}
        />
      </div>

      <HorizontalLine />
      <div>
        <div style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>LM Studio</div>
        <div style={{ fontSize: 13, marginBottom: 8, color: "#aaa" }}>
          Run models locally with LM Studio. No API key required.
        </div>
        <div style={{ marginTop: 8, fontWeight: "bold" }}>Base URL</div>
        <Input
          placeholder="e.g., http://127.0.0.1:1234/v1"
          value={preferencesStore.lmStudioBaseUrl}
          onChange={(value: string) => (preferencesStore.lmStudioBaseUrl = value)}
        />
        <div style={{ marginTop: 8, fontWeight: "bold" }}>Model Name</div>
        <Input
          placeholder="e.g., local-model or llama-3.2-3b"
          value={preferencesStore.lmStudioModelName}
          onChange={(value: string) => (preferencesStore.lmStudioModelName = value)}
        />
      </div>

      <HorizontalLine />
      <div>
        <div style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>Ollama</div>
        <div style={{ fontSize: 13, marginBottom: 8, color: "#aaa" }}>
          Run models locally with Ollama. No API key required.
        </div>
        <div style={{ marginTop: 8, fontWeight: "bold" }}>Base URL</div>
        <Input
          placeholder="e.g., http://127.0.0.1:11434"
          value={preferencesStore.ollamaBaseUrl}
          onChange={(value: string) => (preferencesStore.ollamaBaseUrl = value)}
        />
        <div style={{ marginTop: 8, fontWeight: "bold" }}>Model Name</div>
        <Input
          placeholder="e.g., llama3.2 or mistral:7b"
          value={preferencesStore.ollamaModelName}
          onChange={(value: string) => (preferencesStore.ollamaModelName = value)}
        />
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
