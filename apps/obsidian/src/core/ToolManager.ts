import { Tool, ToolParameter } from "../types/index.types";
import { Logger } from "../services/Logger";
import { MCPToolAdapter } from "../integrations/MCPToolAdapter";

export interface ToolExecutionContext {
  sessionId: string;
  projectId: string;
  activeNoteContent?: string;
  userId?: string;
}

export interface ToolExecutionResult {
  success: boolean;
  output: unknown;
  error?: string;
  executedAt: string;
}

export class ToolManager {
  private mcpAdapter: MCPToolAdapter;

  constructor(
    private logger: Logger,
    notionApiKey?: string,
    airtableApiKey?: string,
    clickupApiKey?: string,
  ) {
    this.mcpAdapter = new MCPToolAdapter(
      notionApiKey,
      airtableApiKey,
      clickupApiKey,
    );
  }

  validateParameters(
    tool: Tool,
    params: Record<string, unknown>,
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    tool.parameters.forEach((param) => {
      if (param.required && !(param.name in params)) {
        errors.push(`Missing required parameter: ${param.name}`);
        return;
      }

      const value = params[param.name];
      if (value === undefined || value === null) {
        return;
      }

      const actualType = Array.isArray(value) ? "array" : typeof value;
      if (param.type === "dropdown") {
        if (!param.options?.includes(String(value))) {
          errors.push(
            `Invalid option for ${param.name}: ${value} not in [${param.options?.join(", ")}]`,
          );
        }
      } else if (actualType !== param.type) {
        errors.push(
          `Parameter ${param.name} expected ${param.type} but got ${actualType}`,
        );
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  async execute(
    tool: Tool,
    params: Record<string, unknown>,
    context: ToolExecutionContext,
  ): Promise<ToolExecutionResult> {
    try {
      const validation = this.validateParameters(tool, params);
      if (!validation.valid) {
        return {
          success: false,
          output: null,
          error: validation.errors.join("; "),
          executedAt: new Date().toISOString(),
        };
      }

      let output: unknown;

      switch (tool.actionType) {
        case "javascript":
          output = await this.executeJavaScript(tool, params, context);
          break;

        case "notion":
        case "airtable":
        case "clickup":
          output = await this.mcpAdapter.callTool(
            `${tool.actionType}_${tool.name.toLowerCase()}`,
            params,
          );
          break;

        case "acp_slash":
          output = { message: "ACP tool execution delegated to agent" };
          break;

        default:
          throw new Error(`Unknown action type: ${tool.actionType}`);
      }

      this.logger.info("Tool executed successfully", {
        toolId: tool.id,
        sessionId: context.sessionId,
      });

      return {
        success: true,
        output,
        executedAt: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      this.logger.error("Tool execution failed", {
        toolId: tool.id,
        sessionId: context.sessionId,
        error: errorMessage,
      });

      return {
        success: false,
        output: null,
        error: errorMessage,
        executedAt: new Date().toISOString(),
      };
    }
  }

  getMCPTools() {
    return this.mcpAdapter.toMCPTools();
  }

  private async executeJavaScript(
    tool: Tool,
    params: Record<string, unknown>,
    context: ToolExecutionContext,
  ): Promise<unknown> {
    if (!tool.javascriptCode) {
      throw new Error("No JavaScript code provided");
    }

    const sandbox = {
      params,
      context,
      console: {
        log: (...args: unknown[]) => console.log("[Tool JS]", ...args),
      },
    };

    const fn = new Function(
      "params",
      "context",
      "console",
      tool.javascriptCode,
    );

    return fn(params, context, sandbox.console);
  }
}
