import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { DefaultChatTransport } from "ai";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import {
  Sources,
  Source,
  SourcesContent,
  SourcesTrigger,
} from "@/components/ai-elements/sources";
import { TooltipProvider } from "@/components/ui/tooltip";

const transport = new DefaultChatTransport({
  api: "http://localhost:3000/api/chat",
});

function extractSources(message: UIMessage) {
  const sources = new Set<string>();
  for (const part of message.parts) {
    if (part.type.startsWith("tool-") && "output" in part && part.state === "output-available") {
      const result = String(part.output ?? "");
      for (const match of result.matchAll(/\[([^\]]+)\]/g)) {
        sources.add(match[1]);
      }
    }
  }
  return [...sources];
}

function getTextContent(message: UIMessage): string {
  return message.parts
    .filter((p) => p.type === "text")
    .map((p) => p.text)
    .join("");
}

export default function App() {
  const { sendMessage, messages, status } = useChat({ transport });

  return (
    <TooltipProvider>
      <div className="flex h-dvh flex-col">
        <header className="border-b px-4 py-3">
          <h1 className="text-lg font-semibold">RAG Chat</h1>
        </header>

        <Conversation className="flex-1">
          <ConversationContent className="mx-auto max-w-3xl space-y-6 px-4 py-6">
            {messages.map((message) => {
              const sources =
                message.role === "assistant" ? extractSources(message) : [];
              const text = getTextContent(message);

              return (
                <Message key={message.id} from={message.role}>
                  <MessageContent>
                    {message.role === "user" ? (
                      <p>{text}</p>
                    ) : (
                      <MessageResponse>{text}</MessageResponse>
                    )}
                    {sources.length > 0 && (
                      <Sources>
                        <SourcesTrigger count={sources.length} />
                        <SourcesContent>
                          {sources.map((source) => (
                            <Source key={source} title={source} />
                          ))}
                        </SourcesContent>
                      </Sources>
                    )}
                  </MessageContent>
                </Message>
              );
            })}

            {status === "submitted" && (
              <Message from="assistant">
                <MessageContent>
                  <p className="text-muted-foreground">Thinking...</p>
                </MessageContent>
              </Message>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="mx-auto w-full max-w-3xl px-4 pb-4">
          <PromptInput
            onSubmit={(msg) => {
              sendMessage({ text: msg.text });
            }}
          >
            <PromptInputTextarea placeholder="Ask a question..." />
            <PromptInputSubmit />
          </PromptInput>
        </div>
      </div>
    </TooltipProvider>
  );
}
