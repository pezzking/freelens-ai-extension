import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { listK8sEvents, K8sEvent } from "./K8sGetEvents";

const useAnalysisSvc = () => {
    const analyze = async (message: string) => {
        console.log("Analyzing message:", message);
        const events: K8sEvent[] = await listK8sEvents("minikube", "default");
        console.log("All events from cluster: ", events);

        // parse all events from the result
        const warning_cluster_events: Array<K8sEvent> = [];
        if (events != null && events.length > 0) {
            events.forEach((event: K8sEvent) => {
                console.log("Parsing event: ", event);
                if (event != null && "reason" in event && event.reason === "Failed") {
                    warning_cluster_events.push(event);
                }
            });
        } else {
            console.error("Unexpected result format:", events);
        }
        console.log("Warning events from cluster: ", warning_cluster_events);

        // Call the model to analyze the events
        console.log("Calling model to analyze events: ", warning_cluster_events);
        const messages = [
            new SystemMessage("You are an AI assistant that helps users interact with Kubernetes clusters."),
            new HumanMessage("Analyze and explain the following events: "
                + JSON.stringify(warning_cluster_events)
                + ". Also provide a possible fix for the issues found. "
                + "Be concise and provide a summary of the issues and fixes."),
        ];
        const model = new ChatOpenAI({ model: "gpt-4" });
        const response = await model.invoke("raccontami una storia");
        console.log("Response from model: ", response.content);
        return "" +response.content;
    }

    return { analyze }
}

export default useAnalysisSvc;