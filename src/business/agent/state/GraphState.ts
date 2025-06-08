import { BaseMessage } from "@langchain/core/messages";
import { Annotation, Messages, messagesStateReducer } from "@langchain/langgraph";
import { AIModels } from "../../provider/AIModels";

export const GraphState = Annotation.Root({
    modelName: Annotation<AIModels>,
    modelApiKey: Annotation<string>,
    messages: Annotation<BaseMessage[], Messages>({
        reducer: messagesStateReducer,
    }),
});