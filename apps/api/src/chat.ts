import { createInterface } from "readline";
import { streamText, stepCountIs } from "ai";
import { provider } from "./provider.js";
import { getInformation } from "./rag.js";

async function main() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const messages: { role: "user" | "assistant"; content: string }[] = [];

  console.log("RAG Chat (type 'exit' to quit)\n");

  const ask = () => {
    rl.question("> ", async (input) => {
      if (input.trim().toLowerCase() === "exit") {
        rl.close();
        process.exit(0);
      }

      messages.push({ role: "user", content: input });

      const result = streamText({
        model: provider.chatModel(process.env.CHAT_MODEL || "llama3.2"),
        system:
          "You are a helpful assistant. Use the getInformation tool to search the knowledge base before answering questions. Base your answers on the retrieved information.",
        messages,
        tools: { getInformation },
        stopWhen: stepCountIs(3),
      });

      let fullResponse = "";
      process.stdout.write("\n");
      for await (const chunk of result.textStream) {
        process.stdout.write(chunk);
        fullResponse += chunk;
      }
      process.stdout.write("\n\n");

      messages.push({ role: "assistant", content: fullResponse });
      ask();
    });
  };

  ask();
}

main();
