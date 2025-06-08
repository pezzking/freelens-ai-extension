import { Renderer } from "@freelensapp/extensions";
import React from "react";
import { observer } from "mobx-react";
import { PreferencesStore } from "../../store/PreferencesStore";

const { Component: { Input, Switch } } = Renderer;

const PreferencesPage = observer(() => {
  // @ts-ignore
  const preferencesStore = PreferencesStore.getInstance();

  return (
    <>
      <div style={{ marginBottom: 8, fontWeight: 'bold' }}>API Key</div>
      <Input
        placeholder="Set here your API key"
        value={preferencesStore.apiKey}
        onChange={(value: string) => preferencesStore.apiKey = value}
      />
      <div style={{ marginTop: 24 }}>
        <div style={{ marginBottom: 8, fontWeight: 'bold' }}>Enable MCP</div>
        <Switch
          label="Enable MCP"
          checked={preferencesStore.mcpEnabled}
          onChange={(checked: boolean) => preferencesStore.mcpEnabled = checked}
        />
      </div>
    </>
  )
})

export default PreferencesPage;
