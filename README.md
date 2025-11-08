# Todo MCP Server

A simple todo list application built with the Model Context Protocol (MCP). This server demonstrates how to create MCP tools that AI assistants like Claude can use to manage a todo list.

## What is MCP?

The Model Context Protocol (MCP) is an open standard that enables AI assistants to safely interact with external tools and data sources. Think of it like REST for AI - it standardizes how LLMs can discover and call functions in your applications.

## Features

This server provides two tools:
- **add_todo**: Add a new todo item with title, description, and priority
- **list_todos**: List all todo items

## Prerequisites

- Node.js 18 or higher
- pnpm (or npm/yarn)
- Claude Desktop (for testing)

## Installation

1. Clone this repository:
```bash
git clone git@github.com:oscarwang20/mcp-demo.git
cd mcp-demo
```

2. Install dependencies:
```bash
pnpm install
```

3. Build the project:
```bash
pnpm build
```

## Usage

### Testing with Claude Desktop

1. Build the server:
```bash
pnpm build
```

2. Add the server to your Claude Desktop configuration:

On macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
On Windows: `%APPDATA%/Claude/claude_desktop_config.json`
```json
{
  "mcpServers": {
    "todo": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-demo/build/index.js"]
    }
  }
}
```

3. Restart Claude Desktop

4. Test it out! Try asking Claude:
   - "Add 'buy groceries' to my todo list"
   - "Show me all my todos"
   - "Add a high priority task to finish the presentation"

## Project Structure
```
mcp-demo/
├── src/
│   └── index.ts          # Main server code
├── build/                # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── README.md
```

## How It Works

### 1. Server Setup
The server uses the MCP SDK to create a server that communicates via stdio:
```typescript
const server = new McpServer({
  name: "Todo App MCP Server",
  version: "1.0.0",
  description: "A simple TODO application using MCP",
  capabilities: {
    resources: {},
    tools: {},
  },
});
```

### 2. Tool Registration
Tools are registered with schemas that define their inputs and outputs:
```typescript
server.registerTool(
  "add_todo",
  {
    description: "Adds a new todo item",
    inputSchema: {
      title: z.string().min(1),
      description: z.string().optional(),
      priority: z.enum(["low", "medium", "high"]).default("medium").optional(),
    },
    outputSchema: {
      success: z.boolean(),
    },
  },
  async ({ title, description, priority }) => {
    // Your tool logic here
    return {
      content: [{ type: "text", text: "Success message" }],
      structuredContent: { success: true },
    };
  }
);
```

### 3. Response Format
**IMPORTANT**: MCP responses must follow this structure:
```typescript
return {
  content: [                          // Array of content items
    { type: "text", text: "..." }     // Human-readable text
  ],
  structuredContent: { /* ... */ }    // Optional: structured data
};
```

The `content` array is **required** - omitting it will cause validation errors!

## Hackathon Challenges

Want to extend this server? Try adding:

### Beginner:
- `delete_todo(id)` - Delete a todo by ID
- `complete_todo(id)` - Mark a todo as complete/incomplete
- `update_priority(id, priority)` - Change a todo's priority

### Intermediate:
- `search_todos(query)` - Search todos by title or description
- `filter_todos(priority, completed)` - Filter todos by criteria
- Add due dates to todos

### Advanced:
- Persist todos to a JSON file or database
- Add todo categories/tags
- Implement todo sharing between users
- Add recurring todos

## Development

### Running in development:
```bash
pnpm build && node build/index.js
```

### Making changes:
1. Edit `src/index.ts`
2. Run `pnpm build`
3. Restart Claude Desktop to see changes

## Common Issues

### "Output validation error"
Make sure your tool returns the correct format with a `content` array:
```typescript
return {
  content: [{ type: "text", text: "..." }],  // ← Don't forget this!
  structuredContent: { /* your data */ }
};
```

### Claude can't find the server
- Check that the path in `claude_desktop_config.json` is absolute
- Make sure you ran `pnpm build`
- Restart Claude Desktop after config changes

### Changes not appearing
- Always run `pnpm build` after code changes
- Restart Claude Desktop to reload the server

## Resources

- [MCP Documentation](https://modelcontextprotocol.io/)
- [MCP SDK (TypeScript)](https://github.com/anthropic-ai/anthropic-sdk-typescript)
- [Example MCP Servers](https://github.com/modelcontextprotocol/servers)
- [MCP Specification](https://spec.modelcontextprotocol.io/)

## Contributing

Feel free to submit issues and enhancement requests!

---

**Built for the MCP Crash Course presentation**
