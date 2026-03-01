import { spawn, ChildProcess } from "child_process";
import { Readable, Writable } from "stream";
import {
  ClientSideConnection,
  ndJsonStream,
  PROTOCOL_VERSION,
} from "@agentclientprotocol/sdk";
import type { Client, Agent } from "@agentclientprotocol/sdk";

const QWEN_PATH = "qwen";
const GEMINI_PATH = "gemini";

interface TestResult {
  success: boolean;
  error?: string;
  data?: unknown;
}

async function testAgent(
  agentPath: string,
  agentName: string,
): Promise<TestResult> {
  console.log(`\n=== Testing ${agentName} ACP ===\n`);

  let proc: ChildProcess | null = null;
  let connection: ClientSideConnection | null = null;
  const cwd = process.cwd();

  try {
    proc = spawn(agentPath, ["--acp"], {
      env: process.env,
      shell: false,
      stdio: ["pipe", "pipe", "pipe"],
    });

    if (!proc.stdin || !proc.stdout || !proc.stderr) {
      throw new Error("Failed to create stdio streams");
    }

    proc.stderr.on("data", (data) => {
      console.error(`[${agentName} stderr]`, data.toString());
    });

    const outputStream = Writable.toWeb(
      proc.stdin,
    ) as WritableStream<Uint8Array>;
    const inputStream = Readable.toWeb(
      proc.stdout,
    ) as ReadableStream<Uint8Array>;

    const stream = ndJsonStream(outputStream, inputStream);

    const toClient = (_agent: Agent): Client => ({
      async requestPermission(params: unknown) {
        console.log(
          `[${agentName}] Permission requested:`,
          JSON.stringify(params, null, 2),
        );
        return Promise.resolve({
          outcome: { outcome: "accepted" },
        } as any);
      },
      async sessionUpdate(params: unknown) {
        const update = (params as any).update;
        if (update?.sessionUpdate === "agent_message_chunk") {
          if (update.content?.type === "text") {
            process.stdout.write(update.content.text);
          }
        } else if (update?.sessionUpdate === "tool_call") {
          console.log(
            `\n[${agentName}] Tool: ${update.title} (${update.status})`,
          );
        } else {
          console.log(`[${agentName}] Update:`, update?.sessionUpdate);
        }
      },
    });

    connection = new ClientSideConnection(toClient, stream);

    const initResult = await connection.initialize({
      protocolVersion: PROTOCOL_VERSION,
      clientCapabilities: {
        fs: { readTextFile: true, writeTextFile: true },
        terminal: true,
      },
      clientInfo: {
        name: "test-qwen-acp",
        version: "0.1.0",
      },
    });

    console.log(
      `[${agentName}] Initialized:`,
      JSON.stringify(initResult, null, 2),
    );

    const sessionResult = await connection.newSession({
      cwd,
      mcpServers: [],
    });

    console.log(`[${agentName}] Session created:`, sessionResult.sessionId);

    console.log(`[${agentName}] Sending prompt...`);
    console.log(`[${agentName}] Response: `);

    const promptResult = await connection.prompt({
      sessionId: sessionResult.sessionId,
      prompt: [{ type: "text", text: "Say hello in one sentence." }],
    });

    console.log(`\n[${agentName}] Completed: ${promptResult.stopReason}`);

    return {
      success: true,
      data: { initResult, sessionId: sessionResult.sessionId, promptResult },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[${agentName}] Error:`, errorMessage);
    return { success: false, error: errorMessage };
  } finally {
    if (connection) {
      connection = null;
    }
    if (proc) {
      proc.kill();
      proc = null;
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const agentArg = args[0] || "qwen";

  let agentPath: string;
  let agentName: string;

  switch (agentArg.toLowerCase()) {
    case "gemini":
      agentPath = GEMINI_PATH;
      agentName = "Gemini";
      break;
    case "qwen":
    case "qwencode":
      agentPath = QWEN_PATH;
      agentName = "Qwen Code";
      break;
    default:
      console.error(`Unknown agent: ${agentArg}`);
      console.log("Usage: npx ts-node test-qwen-acp.ts [qwen|gemini]");
      process.exit(1);
  }

  console.log(`Starting ACP test for ${agentName}...`);
  console.log(`Agent path: ${agentPath}`);

  const result = await testAgent(agentPath, agentName);

  if (result.success) {
    console.log(`\n✅ ${agentName} ACP test PASSED`);
  } else {
    console.log(`\n❌ ${agentName} ACP test FAILED: ${result.error}`);
    process.exit(1);
  }
}

main().catch(console.error);
