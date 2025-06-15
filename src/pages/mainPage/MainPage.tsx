import {Renderer} from "@freelensapp/extensions";
import React from "react";
import "./MainPage.scss";
import Chat from "../../components/chat/Chat";

type MainPageProps = {
  extension: Renderer.LensExtension;
};

const MainPage = ({extension}: MainPageProps) => {
  return (
    <div className="main-page">
      <Chat/>
    </div>
  );
}

export default MainPage;
