import * as k8s from '@kubernetes/client-node';

export interface K8sEvent {
    timestamp: string | null;
    type: string | undefined;
    reason: string | undefined;
    message: string | undefined;
    count: number | undefined;
    source: {
        component: string | undefined;
        host: string | undefined;
    };
    involved_object: {
        kind: string | undefined;
        namespace: string | undefined;
        name: string | undefined;
    };
}

export async function listK8sEvents(context: string, namespace: string, limit = 100): Promise<K8sEvent[]> {
    try {
        const kc = new k8s.KubeConfig();
        kc.loadFromDefault();

        // Set the context
        kc.setCurrentContext(context);

        const coreV1Api = kc.makeApiClient(k8s.CoreV1Api);

        const res = await coreV1Api.listNamespacedEvent({ namespace });

        const events = res.items;

        const limitedEvents = limit > 0 ? events.slice(0, limit) : events;

        const result: K8sEvent[] = limitedEvents.map(event => {
            const timestamp =
                event.lastTimestamp?.toISOString() ??
                event.eventTime?.toISOString() ??
                event.metadata?.creationTimestamp?.toISOString() ??
                null;

            return {
                timestamp,
                type: event.type,
                reason: event.reason,
                message: event.message,
                count: event.count,
                source: {
                    component: event.source?.component,
                    host: event.source?.host,
                },
                involved_object: {
                    kind: event.involvedObject?.kind,
                    namespace: event.involvedObject?.namespace,
                    name: event.involvedObject?.name,
                },
            };
        });

        return result;
    } catch (err: any) {
        throw new Error(`Failed to list events in context '${context}', namespace '${namespace}': ${err.message}. Stack: ${err?.stack}`);
    }
}
