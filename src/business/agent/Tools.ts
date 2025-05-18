import { Renderer } from "@freelensapp/extensions";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const getNamespaces = tool(
    (): string[] => {
        /**
         * Get all namespaces of the Kubernetes cluster
         */
        console.log("[Tool invocation: getNamespaces]");
        const namespaceStore = Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.namespacesApi) as Renderer.K8sApi.NamespaceStore;
        const allNamespaces: Renderer.K8sApi.Namespace[] = namespaceStore.items.toJSON();
        const getNamespacesToolResult = allNamespaces.map((ns) => ns.getName());
        console.log("[Tool invocation result: getNamespaces] - ", getNamespacesToolResult);
        return getNamespacesToolResult;
    },
    {
        name: "getNamespaces",
        description: "Get all namespaces of the Kubernetes cluster",
    }
);

export const getWarningEventsByNamespace = tool(
    ({ namespace }: { namespace: string }): string => {
        /**
         * Get all events in status WARNING for a specific Kubernetes namespace
         */
        console.log("[Tool invocation: getWarningEventsForNamespace] - namespace: ", namespace);
        const eventStore = Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.eventApi) as Renderer.K8sApi.EventStore;
        const allEventsByNs: Renderer.K8sApi.KubeEvent[] = eventStore.getAllByNs(namespace);
        console.log("[Tool invocation debug: getWarningEventsForNamespace] - all WARNING events: ", allEventsByNs);
        const getWarningEventsByNsToolResult = JSON.stringify(
            allEventsByNs
                .filter((event) => event.type === "Warning")
                .map((event) => ({
                    event:
                    {
                        type: event.type,
                        message: event.message,
                        reason: event.reason,
                        action: event.action,
                        involvedObject: event.involvedObject,
                        source: event.source
                    }
                }))
        );
        console.log("[Tool invocation result: getWarningEventsForNamespace] - ", getWarningEventsByNsToolResult);
        return getWarningEventsByNsToolResult;
    },
    {
        name: "getEventsForNamespace",
        description: "Get all events in status WARNING for a specific Kubernetes namespace",
        schema: z.object({
            namespace: z.string(),
        }),
    }
);