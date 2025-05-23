import { tool } from "../../tool.js";
import { mcpError, toContent } from "../../util.js";
import { z } from "zod";
export const testTool = tool(
    {
        name: "test tool",
        description: "test tool ",
        inputSchema: z.object({}),

    },async () => {
   
        return toContent("hello!");
      },
)