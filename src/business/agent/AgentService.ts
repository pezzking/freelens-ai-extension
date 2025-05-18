import {isAIMessageChunk} from "@langchain/core/messages";
import {useAgentAnalyzer} from "../provider/AgentProvider";
import {PreferencesStore} from "../../store/PreferencesStore";
import getaPiKey from "../AIApiKeyProvider";


export interface AgentService {
  run(humanMessage: string): AsyncGenerator<string, void, unknown>;
}


export const useAgentService = (preferencesStore: PreferencesStore): AgentService => {
  const apiKey = getaPiKey(preferencesStore);
  const agent = useAgentAnalyzer(preferencesStore.selectedModel, apiKey).getAgent();

  const run = async function* (humanMessage: string) {
    console.log("Starting Freelens Agent run for message: ", humanMessage);

    // const podsStore = Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.podsApi) as Renderer.K8sApi.PodsStore;
    // console.log("Load pods: ", podsStore);
    // console.log(JSON.stringify(podsStore));

    // podsStore.create({ name: "programmatic-pod", namespace: "default" }, { spec: { containers: [{ name:"programmatic-pod-container-name" ,image: "nginx" }] } });
    // console.log("Pods store: ", podsStore.getByName("programmatic-pod", "default"));

    const streamResponse = await agent.stream(
      {messages: [{role: "user", content: humanMessage}],},
      {streamMode: "messages"}
    );

    for await (const [message, _metadata] of streamResponse) {
      if (isAIMessageChunk(message) && message.tool_call_chunks?.length) {
        // console.log(`${message.getType()} MESSAGE TOOL CALL CHUNK: ${message.tool_call_chunks[0].args}`);
      } else {
        // console.log(`${message.getType()} MESSAGE CONTENT: ${message.content}`);
        if (message.getType() === "ai") {
          yield String(message.content);
        }
      }
    }
  }

  return {run};

}
