/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { Renderer } from "@freelensapp/extensions";
import React from "react";
import svgIcon from "./src/icons/extension-icon.svg";
import { MainPage } from "./src/pages/mainPage/mainPage";

const {
  Component: { Icon },
} = Renderer;

export function FreeLensAIIcon(props: Renderer.Component.IconProps) {
  return <Icon {...props} svg={svgIcon} />;
}

export default class FreeLensAIRenderer extends Renderer.LensExtension {
  clusterPages = [
    {
      id: "freelens-ai-page",
      components: {
        Page: () => <MainPage extension={this} />,
      },
    },
  ];

  clusterPageMenus = [
    {
      id: "freelens-ai",
      title: "Freelens AI",
      target: { pageId: "freelens-ai-page" },
      components: {
        Icon: FreeLensAIIcon,
      },
    },
  ];
}
