/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import {Renderer} from "@freelensapp/extensions";
import React from "react";
import MainPage from "./src/pages/mainPage/MainPage";
import PreferencesPage from "./src/pages/preferences/PreferencesPage";
import MenuEntry from "./src/components/menuEntry/MenuEntry";
import FreeLensAIIcon from "./src/components/freeLensAIIcon/FreeLensAIIcon";
import {PreferencesStore} from "./src/store/PreferencesStore";

type KubeObjectMenuProps = Renderer.Component.KubeObjectMenuProps;

export default class FreeLensAIRenderer extends Renderer.LensExtension {
  async onActivate() {
    // @ts-ignore
    PreferencesStore.createInstance().loadExtension(this);
  }

  clusterPages = [
    {
      id: "freelens-ai-page",
      components: {
        Page: () => <MainPage extension={this}/>,
      },
    },
  ];

  clusterPageMenus = [
    {
      id: "freelens-ai",
      title: "Freelens AI",
      target: {pageId: "freelens-ai-page"},
      components: {
        Icon: FreeLensAIIcon,
      },
    },
  ];

  appPreferences = [
    {
      title: "API key",
      components: {
        Input: () => <PreferencesPage/>,
        Hint: () => <span></span>
      },
    },
  ];

  kubeObjectMenuItems = [
    {
      kind: "Event",
      apiVersions: ["v1"],
      components: {
        MenuItem: (props: KubeObjectMenuProps) => (
          <MenuEntry {...props} />
        ),
      },
    },
  ];
}
