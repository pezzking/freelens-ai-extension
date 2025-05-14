import {Renderer} from "@freelensapp/extensions";
import React from "react";
import svgIcon from "../../icons/extension-icon.svg";

const {
  Component: {Icon},
} = Renderer;

const FreeLensAIIcon = (props: Renderer.Component.IconProps) => {
  return <Icon {...props} svg={svgIcon}/>;
}

export default FreeLensAIIcon;
