import React from "react";
import {Renderer} from "@freelensapp/extensions";
import FreeLensAIIcon from "../freeLensAIIcon/FreeLensAIIcon";
import useMenuEntryHook from "./MenuEntryHook";
import {PreferencesStore} from "../../store/PreferencesStore";

const {
  Component: {MenuItem},
} = Renderer;

type KubeObjectMenuProps = Renderer.Component.KubeObjectMenuProps;

const MenuEntry = ({object}: KubeObjectMenuProps) => {
  // @ts-ignore
  const preferencesStore = PreferencesStore.getInstance();
  const menuEntryHook = useMenuEntryHook(preferencesStore);

  return (
    <MenuItem onClick={() => menuEntryHook.openTab(object.message)}>
      <FreeLensAIIcon/>
      <span className="title">Explain</span>
    </MenuItem>
  );
}

export default MenuEntry;
