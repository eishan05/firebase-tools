import { z } from "zod";
import { tool } from "../../tool.js";
import { mcpError, toContent } from "../../util.js";
import { getCampaigns } from "../../../campaigns/getMessagingCampaigns.js";

export const list_firebase_messaging_campaigns = tool(
  {
    name: "list_firebase_messaging_campaigns",
    description: "Lists the Firebase Messaging campaigns for the project.",
    inputSchema: z.object({}),
    annotations: {
      title: "Lists Firebase Messaging campaigns",
      readOnlyHint: true,
    },
    _meta: {
      requiresAuth: true,
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