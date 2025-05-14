import {Main} from "@freelensapp/extensions";
import {PreferencesStore} from "./src/store/PreferencesStore";

export default class FluxExtensionExampleMain extends Main.LensExtension {
  async onActivate() {
    // @ts-ignore
    PreferencesStore.createInstance().loadExtension(this);
  }
}
