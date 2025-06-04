import { z } from "zod";
import { tool } from "../../tool.js";
import { toContent } from "../../util.js";
import { getFcmAddInstructions } from "../../../local/getFcmAddInstructions.js";

export const get_add_fcm_instructions = tool(
  {
    name: "get_fcm_add_to_project_instructions",
    description: "Gets official instructions on how to add FCM to app.",
    inputSchema: z.object({}),
    annotations: {
      title: "Gets official instructions on how to add FCM to app.",
      readOnlyHint: true,
    },
    _meta: {
      requiresAuth: false,
      requiresProject: false,
    },
  },
  async (_, {  }) => {
    return toContent(await getFcmAddInstructions());
  },
);