import { z } from "zod";
import { tool } from "../../tool.js";
import { mcpError, toContent } from "../../util.js";
import { getCampaignStats } from "../../../campaigns/getCampaignStats.js";

export const get_firebase_messaging_campaign_stats = tool(
  {
    name: "get_firebase_messaging_campaign_stats",
    description: "Gets Firebase Messaging campaign stats for the project.",
    inputSchema: z.object({
        projectNumber: z
        .string()
        .describe("The project number of your Firebase Project"),
        campaignIds: z.array(
            z.string()
        )
        .describe("List of campaign IDs you want the stats of. Campaign IDs can be queried from the get_firebase_messaging_campaigns tool (a campaign ID looks like 3182974794344582507)."),
    }),
    annotations: {
      title: "Gets stats related to Firebase Messaging Campaigns",
      readOnlyHint: true,
    },
    _meta: {
      requiresAuth: true,
      requiresProject: true,
    },
  },
  async ({projectNumber, campaignIds}, {  }) => {
    if (campaignIds === null || campaignIds === undefined || campaignIds.length == 0) {
      return mcpError(`Please provide atleast 1 campaignID`);
    }
    return toContent(await getCampaignStats(projectNumber, campaignIds));
  },
);