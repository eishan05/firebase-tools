import { z } from "zod";
import { tool } from "../../tool.js";
import { mcpError, toContent } from "../../util.js";
import { getCampaigns } from "../../../campaigns/getCampaigns.js";

export const get_firebase_messaging_campaigns = tool(
  {
    name: "get_firebase_messaging_campaigns",
    description: "Gets the Firebase Messaging campaigns for the project.",
    inputSchema: z.object({}),
    annotations: {
      title: "Gets Firebase Messaging campaigns",
      readOnlyHint: true,
    },
    _meta: {
      requiresAuth: false,
      requiresProject: true,
    },
  },
  async (_: unknown, { projectId }) => {
    if (projectId === undefined || projectId === null) {
      return mcpError(`No project id available in the tool`);
    }
    return toContent(await getCampaigns(projectId!));
  },
);