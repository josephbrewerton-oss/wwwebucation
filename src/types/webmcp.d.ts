// src/types/webmcp.d.ts
/**
 * W3C Web Machine Learning Community Group — WebMCP Ambient Type Definitions
 * Specification: https://github.com/webmachinelearning/webmcp-types
 * Vendored locally to eliminate unscoped third-party supply-chain dependency.
 */

declare global {
  namespace WebMCP {
    type ToolExecuteCallback<TInput = object> = (input: TInput) => Promise<unknown>;

    interface ToolAnnotations {
      readOnlyHint?: boolean;
      untrustedContentHint?: boolean;
      consequentialHint?: boolean;
      debugging?: boolean;
    }

    interface ModelContextTool {
      name: string;
      title?: string;
      description: string;
      inputSchema?: object;
      execute: ToolExecuteCallback;
      annotations?: ToolAnnotations;
    }

    type ModelContextToolFromSchema<TInputSchema extends object> = Omit<ModelContextTool, 'inputSchema' | 'execute'> & {
      inputSchema: TInputSchema;
      execute: ToolExecuteCallback<any>;
    };

    interface ModelContextRegisterToolOptions {
      signal?: AbortSignal;
      exposedTo?: string[];
    }

    interface ModelContextGetToolOptions {
      fromOrigins?: string[];
    }

    interface ModelContextExecuteToolOptions {
      signal?: AbortSignal;
    }

    interface RegisteredTool {
      name: string;
      title: string;
      description: string;
      inputSchema?: object;
      window: Window;
      origin: string;
      annotations?: ToolAnnotations;
    }

    interface ModelContextEventMap {
      toolchange: Event;
      toolactivated: Event;
      toolcancel: Event;
    }

    interface ModelContext extends EventTarget {
      registerTool<const TInputSchema extends object>(
        tool: ModelContextToolFromSchema<TInputSchema>,
        options?: ModelContextRegisterToolOptions
      ): Promise<void>;
      registerTool(tool: ModelContextTool, options?: ModelContextRegisterToolOptions): Promise<void>;
      getTools(options?: ModelContextGetToolOptions): Promise<RegisteredTool[]>;
      executeTool(tool: RegisteredTool, inputObject?: object, options?: ModelContextExecuteToolOptions): Promise<string>;
      ontoolchange: ((this: ModelContext, ev: Event) => any) | null;
      ontoolactivated: ((this: ModelContext, ev: Event) => any) | null;
      ontoolcancel: ((this: ModelContext, ev: Event) => any) | null;
    }
  }

  interface Document {
    readonly modelContext?: WebMCP.ModelContext;
  }
}

export {};
