import { assistantId } from "./../../assistant-config";
import { openai } from "@/app/openai";

export const runtime = "nodejs";
// update a new assistant
export async function PUT(request: Request) {
  const { name, instructions, model } = await request.json();
  const assistant = await openai.beta.assistants.update(assistantId, {
    instructions: instructions,
    name: name,
    model: model || "gpt-4o-mini",
    tools: [
      { type: "file_search" },
      { type: "code_interpreter" },
      {
        type: "function",
        function: {
          name: "downloadPDF",
          description: "Download the generated Report",
          parameters: {
            type: "object",
            properties: {
              url: {
                type: "string",
                description: "Thge URL for the PDF to download",
              },
              outputPath: {
                type: "string",
                description: "The path to save the downloaded PDF",
              },
            },
            required: ["url", "outputPath"],
          },
        },
      },
    ],
  });
  return Response.json({
    assistantId: assistant.id,
  });
}

export async function GET() {
  const assistant = await openai.beta.assistants.retrieve(assistantId);

  return Response.json(assistant);
}
