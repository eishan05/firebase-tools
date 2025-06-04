import { z } from "zod";
import { tool } from "../../tool.js";
import { toContent } from "../../util.js";
import { getVapidPublicKey } from "../../../local/getVapidPublicKey.js";

export const get_public_key = tool(
  {
    name: "get_public_key",
    description: "Gets the VAPID public key (singleton for now) for the user who is currently chatting",
    inputSchema: z.object({}),
    annotations: {
      title: "Gets the VAPID public key (singleton for now) for the user who is currently chatting",
      readOnlyHint: true,
    },
    _meta: {
      requiresAuth: false,
      requiresProject: false,
    },
  },
  async (_, {  }) => {
    return toContent(await getVapidPublicKey());
  },
);