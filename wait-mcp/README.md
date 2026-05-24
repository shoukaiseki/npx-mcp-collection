# Wait MCP Server

A Model Context Protocol (MCP) server that provides a tool to wait for N seconds.

## Installation

This package can be used directly with `npx`:

```bash
npx shoukaiseki-wait-mcp
```

Or install locally:

```bash
npm install
```

## Usage

### As an MCP Server

Add to your MCP client configuration (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "shoukaiseki-wait": {
      "command": "npx",
      "args": ["shoukaiseki-wait-mcp"]
    }
  }
}
```

### Available Tools

#### wait

Wait for N seconds before returning.

**Parameters:**
- `seconds` (number, required): Number of seconds to wait (must be non-negative)

**Example:**
```json
{
  "seconds": 5
}
```

## Development

```bash
npm install
npm start
```

## License

MIT