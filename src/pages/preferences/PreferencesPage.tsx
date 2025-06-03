import { Renderer } from "@freelensapp/extensions";
import React from "react";
import { observer } from "mobx-react";
import { PreferencesStore } from "../../store/PreferencesStore";

const { Component: { Input } } = Renderer;

const PreferencesPage = observer(() => {
  // @ts-ignore
  const preferencesStore = PreferencesStore.getInstance();

  return (
    <>
      <Input
        placeholder="Set here your API key"
        value={preferencesStore.apiKey}
        onChange={(value: string) => preferencesStore.apiKey = value}
      />
    </>
  )
})

export default PreferencesPage;
