import {Renderer} from "@freelensapp/extensions";
import React from "react";
import {observer} from "mobx-react";
import {PreferencesStore} from "../../store/PreferencesStore";

const {Component: {SubTitle, Input}} = Renderer;

const PreferencesPage = observer(() => {
  // @ts-ignore
  const preferencesStore = PreferencesStore.getInstance();

  return (
    <>
      <Input
        placeholder="OpenAI API key"
        value={preferencesStore.openAIApiKey}
        onChange={(value: string) => preferencesStore.openAIApiKey = value}
      />

      <br/>
      <SubTitle title="Deep seek API key"/>
      <Input
        placeholder="Deep seek API key"
        value={preferencesStore.deepSeekApiKey}
        onChange={(value: string) => preferencesStore.deepSeekApiKey = value}
      />
    </>
  )
})

export default PreferencesPage;
