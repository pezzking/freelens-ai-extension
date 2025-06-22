// @ts-ignore
import React from "react";

import { Chat } from "../../components/chat";
import { ApplicationContextProvider } from "../../context/application-context";
import styleInline from "./main-page.scss?inline";

export const MainPage = () => {
  return (
    <ApplicationContextProvider>
      <style>{styleInline}</style>
      <div className="ai-extension-main-page">
        <Chat />
      </div>
    </ApplicationContextProvider>
  );
};
