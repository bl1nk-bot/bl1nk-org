import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js"

export class GatewayClient {
  private client: Client | null = null

  constructor(private gatewayUrl: string) {}

  async connect(): Promise<void> {
    const transport = new SSEClientTransport(new URL(this.gatewayUrl))
    this.client = new Client(
      {
        name: "obsidian-smart-assistant",
        version: "0.1.0",
      },
      {
        capabilities: {
          experimental: {},
          sampling: {},
        },
      }
    )

    await this.client.connect(transport)
    console.log("Connected to MCP Gateway")
  }

  async listTools(): Promise<any> {
    if (!this.client) throw new Error("Client not connected")
    return await this.client.listTools()
  }

  async callTool(name: string, args: any): Promise<any> {
    if (!this.client) throw new Error("Client not connected")
    return await this.client.callTool({ name, arguments: args })
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      // In a real implementation, we would close the transport
      this.client = null
    }
  }

  isConnected(): boolean {
    return this.client !== null
  }
}
