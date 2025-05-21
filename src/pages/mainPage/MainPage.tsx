import {Renderer} from "@freelensapp/extensions";
import React from "react";
import "./MainPage.scss";
import Chat from "../../components/chat/Chat";

type MainPageProps = {
  extension: Renderer.LensExtension;
};

const generateConversationId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const MainPage = ({extension}: MainPageProps) => {
  return (
    <div className="example-page">
      <Chat conversationId={generateConversationId()}/>
    </div>
  );
}

export default MainPage;
