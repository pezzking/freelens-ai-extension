import { Renderer } from "@freelensapp/extensions";
import React from "react";
import "./MainPage.scss";
import Chat from "../../components/chat/Chat";

export class MainPage extends React.Component<{ extension: Renderer.LensExtension }> {
  constructor(props: { extension: Renderer.LensExtension }) {
    super(props);
  }

  render() {
    return (
      <div className="example-page">
        <Chat />
      </div>
    );
  }
}
