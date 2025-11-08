import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import express from "express";
import { z } from "zod";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const USER_AGENT = "todo-app/1.0.0";

interface TodoItem {
  id: string;
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  completed: boolean;
}

const TODOLIST: TodoItem[] = [];

const server = new McpServer({
  name: "Todo App MCP Server",
  version: "1.0.0",
  description: "A simple TODO application using MCP",
  capabilities: {
    resources: {},
    tools: {},
  },
});

server.registerTool(
  "add_todo",
  {
    description: "Adds a new todo item",
    inputSchema: {
      title: z.string().min(1, "Title cannot be empty"),
      description: z.string().optional(),
      priority: z.enum(["low", "medium", "high"]).default("medium").optional(),
    },
    outputSchema: {
      success: z.boolean(),
    },
  },
  async ({ title, description, priority }) => {
    // Logic to add the todo item
    const newTodo: TodoItem = {
      id: (TODOLIST.length + 1).toString(),
      title,
      description,
      priority,
      completed: false,
    };
    TODOLIST.push(newTodo);

    return {
      content: [
        { type: "text", text: `Todo item "${title}" added successfully.` },
      ],
      structuredContent: { success: true },
    };
  }
);

server.registerTool(
  "list_todos",
  {
    description: "Lists all todo items",
    inputSchema: {},
    outputSchema: {
      todos: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          description: z.string().optional(),
          priority: z.enum(["low", "medium", "high"]).optional(),
          completed: z.boolean(),
        })
      ),
    },
  },
  async () => {
    // Logic to list all todo items
    const output = {
      todos: TODOLIST,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
      structuredContent: output,
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Todo App MCP Server is running...");
}

main().catch((error) => {
  console.error("Error starting Todo App MCP Server:", error);
  process.exit(1);
});
