import { Main, Renderer } from "@freelensapp/extensions";
import { tool } from "@langchain/core/tools";
import { interrupt } from "@langchain/langgraph";
import { z } from "zod";

export const getNamespaces = tool(
  (): string[] => {
    /**
     * Get all namespaces of the Kubernetes cluster
     */
    console.log("[Tool invocation: getNamespaces]");
    const namespaceStore = Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.namespacesApi);
    if (!namespaceStore) {
      console.log("Namespace store does not exist");
      return [];
    }
    const allNamespaces: Renderer.K8sApi.Namespace[] = namespaceStore.items.toJSON();
    const getNamespacesToolResult = allNamespaces.map((ns) => ns.getName());
    console.log("[Tool invocation result: getNamespaces] - ", getNamespacesToolResult);
    return getNamespacesToolResult;
  },
  {
    name: "getNamespaces",
    description: "Get all namespaces of the Kubernetes cluster",
  },
);

export const getWarningEventsByNamespace = tool(
  ({ namespace }: { namespace: string }): string => {
    /**
     * Get all events in status WARNING for a specific Kubernetes namespace
     */
    console.log("[Tool invocation: getWarningEventsForNamespace] - namespace: ", namespace);
    const eventStore = Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.eventApi);
    if (!eventStore) {
      return "Event store does not exist";
    }
    const allEventsByNs: Renderer.K8sApi.KubeEvent[] = eventStore.getAllByNs(namespace);
    console.log("[Tool invocation debug: getWarningEventsForNamespace] - all WARNING events: ", allEventsByNs);
    const getWarningEventsByNsToolResult = JSON.stringify(
      allEventsByNs
        .filter((event) => event.type === "Warning")
        .map((event) => ({
          event: {
            type: event.type,
            message: event.message,
            reason: event.reason,
            action: event.action,
            involvedObject: event.involvedObject,
            source: event.source,
          },
        })),
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
  },
);

export const createPod = tool(
  async ({ name, namespace, data }: { name: string; namespace: string; data: Main.K8sApi.Pod }): Promise<string> => {
    /**
     * Creates a pod in the Kubernetes cluster
     */
    console.log("[Tool invocation: createPod]");

    const interruptRequest = {
      question: "Approve this action...",
      options: ["yes", "no"],
      actionToApprove: { action: "CREATE POD", name, namespace, data },
      requestString: "Approve this action: " + JSON.stringify({ action: "CREATE POD", name, namespace, data }),
    };
    const review = interrupt(interruptRequest);
    console.log("Tool call review: ", review);
    if (review !== "yes") {
      console.log("[Tool invocation: createPod] - action not approved");
      return "The user denied the action";
    }

    try {
      const podsStore = Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.podsApi);
      if (!podsStore) {
        return "Unable to get the object that can create a pod";
      }
      const createPodResult: Renderer.K8sApi.Pod = await podsStore.create({ name, namespace }, data);
      console.log("[Tool invocation result: createPod] - ", createPodResult);
      return "Pod manifest applied successfully";
    } catch (error) {
      console.error("[Tool invocation error: createPod] - ", error);
      return JSON.stringify(error);
    }
  },
  {
    name: "createPod",
    description: "Creates a pod in the Kubernetes cluster",
    schema: z.object({
      namespace: z.string(),
      name: z.string(),
      data: z.object({
        apiVersion: z.string(),
        kind: z.string(),
        metadata: z.object({
          name: z.string(),
          namespace: z.string(),
        }),
        spec: z.object({
          containers: z.array(
            z.object({
              name: z.string(),
              image: z.string(),
              ports: z.array(
                z.object({
                  containerPort: z.number(),
                }),
              ),
            }),
          ),
        }),
      }),
    }).describe("Pod K8S manifest to create"),
  },
);

export const createDeployment = tool(
  async ({
    name,
    namespace,
    data,
  }: { name: string; namespace: string; data: Main.K8sApi.Deployment }): Promise<string> => {
    /**
     * Creates a deployment in the Kubernetes cluster
     */
    console.log("[Tool invocation: createDeployment]");

    const interruptRequest = {
      question: "Approve this action...",
      options: ["yes", "no"],
      actionToApprove: { action: "CREATE DEPLOYMENT", name, namespace, data },
      requestString:
        "Approve this action: " +
        JSON.stringify({ action: "CREATE DEPLOYMENT", name, namespace, data }) +
        "\n\n\n options: [yes/no]",
    };
    const review = interrupt(interruptRequest);
    console.log("Tool call review: ", review);
    if (review !== "yes") {
      console.log("[Tool invocation] - action not approved");
      return "The user denied the action";
    }

    try {
      const deploymentsStore = Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.deploymentApi);
      if (!deploymentsStore) {
        return "Unable to get the object that can create a deployment";
      }
      const createDeploymentResult: Renderer.K8sApi.Deployment = await deploymentsStore.create(
        { name, namespace },
        data,
      );
      console.log("[Tool invocation result: createDeployment] - ", createDeploymentResult);
      return "Deployment manifest applied successfully";
    } catch (error) {
      console.error("[Tool invocation error: createDeployment] - ", error);
      return JSON.stringify(error);
    }
  },
  {
    name: "createDeployment",
    description: "Creates a deployment in the Kubernetes cluster",
    schema: z.object({
      namespace: z.string(),
      name: z.string(),
      data: z.object({
        apiVersion: z.string(),
        kind: z.string(),
        metadata: z.object({
          name: z.string(),
          namespace: z.string(),
        }),
        spec: z.object({
          replicas: z.number(),
          selector: z.object({
            matchLabels: z.record(z.string()),
          }),
          template: z.object({
            metadata: z.object({
              labels: z.record(z.string()),
            }),
            spec: z.object({
              containers: z.array(
                z.object({
                  name: z.string(),
                  image: z.string(),
                  ports: z.array(
                    z.object({
                      containerPort: z.number(),
                    }),
                  ),
                }),
              ),
            }),
          }),
        }),
      }),
    }).describe("Deployment K8S manifest to create"),
  },
);

export const deletePod = tool(
  async ({ name, namespace }: { name: string; namespace: string }): Promise<string> => {
    /**
     * Deletes a pod in the Kubernetes cluster
     */
    console.log("[Tool invocation: deletePod]");

    const interruptRequest = {
      question: "Approve this action...",
      options: ["yes", "no"],
      actionToApprove: { action: "DELETE POD", name, namespace },
      requestString: "Approve this action: " + JSON.stringify({ action: "DELETE POD", name, namespace }),
    };
    const review = interrupt(interruptRequest);
    console.log("Tool call review: ", review);
    if (review !== "yes") {
      console.log("[Tool invocation: deletePod] - action not approved");
      return "The user denied the action";
    }

    try {
      const podsStore = Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.podsApi);
      if (!podsStore) {
        return "Unable to get the object that can delete a pod";
      }
      const podToRemove = podsStore.getByName(name, namespace);
      if (!podToRemove) {
        return "The pod you want to delete does not exist";
      }
      await podsStore.remove(podToRemove);
      console.log("[Tool invocation result: deletePod] - Pod deleted successfully");
      return "Pod deleted successfully";
    } catch (error) {
      console.error("[Tool invocation error: deletePod] - ", error);
      return JSON.stringify(error);
    }
  },
  {
    name: "deletePod",
    description: "Deletes a pod in the Kubernetes cluster",
    schema: z.object({
      namespace: z.string(),
      name: z.string(),
    }),
  },
);

export const deleteDeployment = tool(
  async ({ name, namespace }: { name: string; namespace: string }): Promise<string> => {
    /**
     * Deletes a deployment in the Kubernetes cluster
     */
    console.log("[Tool invocation: deleteDeployment]");

    const interruptRequest = {
      question: "Approve this action...",
      options: ["yes", "no"],
      actionToApprove: { action: "DELETE DEPLOYMENT", name, namespace },
      requestString: "Approve this action: " + JSON.stringify({ action: "DELETE DEPLOYMENT", name, namespace }),
    };
    const review = interrupt(interruptRequest);
    console.log("Tool call review: ", review);
    if (review !== "yes") {
      console.log("[Tool invocation: deleteDeployment] - action not approved");
      return "The user denied the action";
    }

    try {
      const deploymentsStore = Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.deploymentApi);
      if (!deploymentsStore) {
        return "The object that can delete a deployment does not exist";
      }
      const deploymentToRemove = deploymentsStore.getByName(name, namespace);
      if (!deploymentToRemove) {
        return "The deployment you want to delete does not exist";
      }
      await deploymentsStore.remove(deploymentToRemove);
      console.log("[Tool invocation result: deleteDeployment] - Deployment deleted successfully");
      return "Deployment deleted successfully";
    } catch (error) {
      console.error("[Tool invocation error: deleteDeployment] - ", error);
      return JSON.stringify(error);
    }
  },
  {
    name: "deleteDeployment",
    description: "Deletes a deployment in the Kubernetes cluster",
    schema: z.object({
      namespace: z.string(),
      name: z.string(),
    }),
  },
);


export const createService = tool(
  async ({
    name, namespace, data,
  }: { name: string; namespace: string; data: Main.K8sApi.Service }): Promise<string> => {
    /**
     * Creates a service in the Kubernetes cluster
     */
    console.log("[Tool invocation: createService]");

    const interruptRequest = {
      question: "Approve this action...",
      options: ["yes", "no"],
      actionToApprove: { action: "CREATE SERVICE", name, namespace, data },
      requestString:
        "Approve this action: " +
        JSON.stringify({ action: "CREATE SERVICE", name, namespace, data }) +
        "\n\n\n options: [yes/no]",
    };
    const review = interrupt(interruptRequest);
    console.log("Tool call review: ", review);
    if (review !== "yes") {
      console.log("[Tool invocation: createService] - action not approved");
      return "The user denied the action";
    }

    try {
      const servicesStore = Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.serviceApi);
      if (!servicesStore) {
        return "The object that can create a service does not exist";
      }
      const createServiceResult: Renderer.K8sApi.Service = await servicesStore.create({ name, namespace }, data);
      console.log("[Tool invocation result: createService] - ", createServiceResult);
      return "Service manifest applied successfully";
    } catch (error) {
      console.error("[Tool invocation error: createService] - ", error);
      return JSON.stringify(error);
    }
  },
  {
    name: "createService",
    description: "Creates a service in the Kubernetes cluster",
    schema: z.object({
      namespace: z.string(),
      name: z.string(),
      data: z.object({
        apiVersion: z.string(),
        kind: z.string(),
        metadata: z.object({
          name: z.string(),
          namespace: z.string(),
        }),
        spec: z.object({
          type: z.string().optional(),
          selector: z.record(z.string()),
          ports: z.array(
            z.object({
              port: z.number(),
              targetPort: z.union([z.number(), z.string()]),
              protocol: z.string().optional(),
              name: z.string().optional(),
            }),
          ),
        }),
      }),
    }).describe("Service K8S manifest to create"),
  },
);


export const deleteService = tool(
  async ({ name, namespace }: { name: string; namespace: string }): Promise<string> => {
    /**
     * Deletes a service in the Kubernetes cluster
     */
    console.log("[Tool invocation: deleteService]");

    const interruptRequest = {
      question: "Approve this action...",
      options: ["yes", "no"],
      actionToApprove: { action: "DELETE SERVICE", name, namespace },
      requestString: "Approve this action: " + JSON.stringify({ action: "DELETE SERVICE", name, namespace }),
    };
    const review = interrupt(interruptRequest);
    console.log("Tool call review: ", review);
    if (review !== "yes") {
      console.log("[Tool invocation: deleteService] - action not approved");
      return "The user denied the action";
    }

    try {
      const servicesStore = Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.serviceApi);
      if (!servicesStore) {
        return "The object that can delete a service does not exist";
      }
      const serviceToRemove = servicesStore.getByName(name, namespace);
      if (!serviceToRemove) {
        return "The service you want to delete does not exist";
      }
      await servicesStore.remove(serviceToRemove);
      console.log("[Tool invocation result: deleteService] - Service deleted successfully");
      return "Service deleted successfully";
    } catch (error) {
      console.error("[Tool invocation error: deleteService] - ", error);
      return JSON.stringify(error);
    }
  },
  {
    name: "deleteService",
    description: "Deletes a service in the Kubernetes cluster",
    schema: z.object({
      namespace: z.string(),
      name: z.string(),
    }),
  },
);


export const getPods = tool(
  ({ namespace }: { namespace: string }): string => {
    /**
     * Get all pods in a specific Kubernetes namespace
     */
    console.log("[Tool invocation: getPods] - namespace: ", namespace);
    const podsStore = Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.podsApi);
    if (!podsStore) {
      return "The object that can get pods does not exist";
    }
    const allPodsByNs: Renderer.K8sApi.Pod[] = podsStore.getAllByNs(namespace);
    const getPodsToolResult = JSON.stringify(
      allPodsByNs.map((pod) => ({
        name: pod.getName(),
        namespace: pod.getNs(),
        status: pod.status,
        spec: pod.spec,
        metadata: pod.metadata,
      })),
    );
    console.log("[Tool invocation result: getPods] - ", getPodsToolResult);
    return getPodsToolResult;
  },
  {
    name: "getPods",
    description: "Get all pods in a specific Kubernetes namespace",
    schema: z.object({
      namespace: z.string(),
    }),
  },
);


export const getDeployments = tool(
  ({ namespace }: { namespace: string }): string => {
    /**
     * Get all deployments in a specific Kubernetes namespace
     */
    console.log("[Tool invocation: getDeployments] - namespace: ", namespace);
    const deploymentsStore = Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.deploymentApi);
    if (!deploymentsStore) {
      return "The object that can get deployments does not exist";
    }
    const allDeploymentsByNs: Renderer.K8sApi.Deployment[] = deploymentsStore.getAllByNs(namespace);
    const getDeploymentsToolResult = JSON.stringify(
      allDeploymentsByNs.map((deployment) => ({
        name: deployment.getName(),
        namespace: deployment.getNs(),
        status: deployment.status,
        spec: deployment.spec,
        metadata: deployment.metadata,
      })),
    );
    console.log("[Tool invocation result: getDeployments] - ", getDeploymentsToolResult);
    return getDeploymentsToolResult;
  },
  {
    name: "getDeployments",
    description: "Get all deployments in a specific Kubernetes namespace",
    schema: z.object({
      namespace: z.string(),
    }),
  },
);

export const getServices = tool(
  ({ namespace }: { namespace: string }): string => {
    /**
     * Get all services in a specific Kubernetes namespace
     */
    console.log("[Tool invocation: getServices] - namespace: ", namespace);
    const servicesStore = Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.serviceApi);
    if (!servicesStore) {
      return "The object that can get services does not exist";
    }
    const allServicesByNs: Renderer.K8sApi.Service[] = servicesStore.getAllByNs(namespace);
    const getServicesToolResult = JSON.stringify(
      allServicesByNs.map((service) => ({
        name: service.getName(),
        namespace: service.getNs(),
        spec: service.spec,
        metadata: service.metadata,
        status: service.status,
      })),
    );
    console.log("[Tool invocation result: getServices] - ", getServicesToolResult);
    return getServicesToolResult;
  },
  {
    name: "getServices",
    description: "Get all services in a specific Kubernetes namespace",
    schema: z.object({
      namespace: z.string(),
    }),
  },
);
