import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { PreferencesStore } from "../../../common/store";

const {
  Component: { Input, Switch, SubTitle, HorizontalLine },
} = Renderer;

export const PreferencesPage = observer(() => {
  const preferencesStore: PreferencesStore = PreferencesStore.getInstanceOrCreate<PreferencesStore>();

  return (
    <>
      <div style={{ marginTop: 8, fontWeight: "bold" }}>API Key</div>
      <Input
        placeholder="Set here your API key"
        value={preferencesStore.apiKey}
        onChange={(value: string) => (preferencesStore.apiKey = value)}
      />
      <HorizontalLine />
      <div>
        <SubTitle title="Ollama settings" />
        If you're using Ollama, there's no need for an API key.
        <div style={{ marginTop: 8, fontWeight: "bold" }}>Ollama host</div>
        <Input
          style={{ marginBottom: 8 }}
          placeholder="Set here your ollama host"
          value={preferencesStore.ollamaHost}
          onChange={(value: string) => (preferencesStore.ollamaHost = value)}
        />
        <div style={{ marginTop: 8, fontWeight: "bold" }}>Ollama port</div>
        <Input
          placeholder="Set here your ollama port"
          value={preferencesStore.ollamaPort}
          onChange={(value: string) => (preferencesStore.ollamaPort = value)}
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
        <div>
          <div style={{ marginBottom: 8, fontWeight: "bold" }}>MCP JSON Configuration</div>
          <textarea
            style={{
              width: "100%",
              minHeight: 100,
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
