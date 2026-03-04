import { AirtableClient } from "./AirtableClient"
import { ClickUpClient } from "./ClickUpClient"
import { NotionClient } from "./NotionClient"

export interface MCPToolDefinition {
  name: string
  description: string
  inputSchema: {
    type: "object"
    properties: Record<string, { type: string; description?: string }>
    required?: string[]
  }
}

export class MCPToolAdapter {
  private notionClient: NotionClient
  private airtableClient: AirtableClient
  private clickupClient: ClickUpClient
  private tools: MCPToolDefinition[] = []

  constructor(notionApiKey?: string, airtableApiKey?: string, clickupApiKey?: string) {
    this.notionClient = new NotionClient(notionApiKey)
    this.airtableClient = new AirtableClient(airtableApiKey)
    this.clickupClient = new ClickUpClient(clickupApiKey)

    this.registerTools()
  }

  private registerTools(): void {
    this.tools.push(
      {
        name: "notion_create_page",
        description: "Create a new page in Notion",
        inputSchema: {
          type: "object",
          properties: {
            parent_id: {
              type: "string",
              description: "Parent page or database ID",
            },
            title: { type: "string", description: "Page title" },
            content: { type: "string", description: "Page content" },
          },
          required: ["parent_id", "title"],
        },
      },
      {
        name: "notion_query_database",
        description: "Query a Notion database",
        inputSchema: {
          type: "object",
          properties: {
            database_id: { type: "string", description: "Database ID" },
            filter: { type: "object", description: "Query filter" },
          },
          required: ["database_id"],
        },
      },
      {
        name: "notion_update_page",
        description: "Update a Notion page",
        inputSchema: {
          type: "object",
          properties: {
            page_id: { type: "string", description: "Page ID" },
            properties: { type: "object", description: "Properties to update" },
          },
          required: ["page_id"],
        },
      },
      {
        name: "airtable_create_record",
        description: "Create a new record in Airtable",
        inputSchema: {
          type: "object",
          properties: {
            table_id: { type: "string", description: "Table ID" },
            fields: { type: "object", description: "Record fields" },
          },
          required: ["table_id", "fields"],
        },
      },
      {
        name: "airtable_list_records",
        description: "List records from Airtable",
        inputSchema: {
          type: "object",
          properties: {
            table_id: { type: "string", description: "Table ID" },
            filter: { type: "string", description: "Filter formula" },
            max_records: {
              type: "number",
              description: "Max records to return",
            },
          },
          required: ["table_id"],
        },
      },
      {
        name: "airtable_update_record",
        description: "Update an Airtable record",
        inputSchema: {
          type: "object",
          properties: {
            table_id: { type: "string", description: "Table ID" },
            record_id: { type: "string", description: "Record ID" },
            fields: { type: "object", description: "Fields to update" },
          },
          required: ["table_id", "record_id"],
        },
      },
      {
        name: "clickup_create_task",
        description: "Create a new task in ClickUp",
        inputSchema: {
          type: "object",
          properties: {
            list_id: { type: "string", description: "List ID" },
            name: { type: "string", description: "Task name" },
            description: { type: "string", description: "Task description" },
            priority: { type: "number", description: "Task priority (1-4)" },
          },
          required: ["list_id", "name"],
        },
      },
      {
        name: "clickup_list_tasks",
        description: "List tasks from ClickUp",
        inputSchema: {
          type: "object",
          properties: {
            list_id: { type: "string", description: "List ID" },
            status: { type: "string", description: "Filter by status" },
          },
          required: ["list_id"],
        },
      },
      {
        name: "clickup_update_task",
        description: "Update a ClickUp task",
        inputSchema: {
          type: "object",
          properties: {
            task_id: { type: "string", description: "Task ID" },
            name: { type: "string", description: "New task name" },
            status: { type: "string", description: "New status" },
          },
          required: ["task_id"],
        },
      }
    )
  }

  getTools(): MCPToolDefinition[] {
    return this.tools
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    const [provider, ...actionParts] = name.split("_")
    const action = actionParts.join("_")

    switch (provider) {
      case "notion":
        return this.notionClient.execute({ name: action } as any, args)
      case "airtable":
        return this.airtableClient.execute({ name: action } as any, args)
      case "clickup":
        return this.clickupClient.execute({ name: action } as any, args)
      default:
        throw new Error(`Unknown tool provider: ${provider}`)
    }
  }

  toMCPTools(): Array<{ name: string; description: string; inputSchema: any }> {
    return this.tools.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    }))
  }
}
