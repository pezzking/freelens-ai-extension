import {Renderer} from "@freelensapp/extensions";
import React from "react";
import {observer} from "mobx-react";
import {PreferencesStore} from "../../store/PreferencesStore";

const {Component: {Checkbox, Input}} = Renderer;

const PreferencesPage = observer(() => {
  // @ts-ignore
  const preferencesStore = PreferencesStore.getInstance();

  return (
    <>
      {/*<Checkbox label="I have my own chatgpt API key"*/}
      {/*          value={preferencesStore.isChatGptApiKeySelected}*/}
      {/*          onChange={(value: boolean) => preferencesStore.isChatGptApiKeySelected = value}/>*/}
      <Input
        disabled={!preferencesStore.isChatGptApiKeySelected}
        placeholder="ChatGpt key"
        value={preferencesStore.chatGptApiKey}
        onChange={(value: string) => preferencesStore.chatGptApiKey = value}
      />
    </>
  )
})

export default PreferencesPage;
