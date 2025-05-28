import { z } from "zod";
import { tool } from "../../tool.js";
import { mcpError, toContent } from "../../util.js";
import { createMessagingCampaign } from "../../../campaigns/createMessagingCampaign.js";

function isTimestampInSecondsFormat(input: string): boolean {
  // Regex explanation:
  // ^       : Asserts position at the start of the string.
  // \d+     : Matches one or more digits (0-9).
  // s       : Matches the literal character 's'.
  // $       : Asserts position at the end of the string.
  const timestampRegex = /^\d+s$/;
  return timestampRegex.test(input);
}

export const create_messaging_campaign = tool(
  {
    name: "create_messaging_campaign",
    description:
      "Creates a Firebase Messaging Campaign",
    inputSchema: z.object({
      displayName: z
        .string()
        .describe(
          "The display name of the Messaing Campaign",
        ),
      notificationTitle: z
        .string()
        .describe("The title of the notification sent by the campaign"),
      notificationText: z.string().describe("The content of the notification sent by the campaign"),
      expiry: z.string().describe("The timestamp in seconds of format \"2419200s\""),
      targetingCondition: z.string().describe("The targeting condition in json format, something like \"{\"topic\":{\"topicName\":\"/topics/your_actual_topic_name\"}}\""),
    }),
    annotations: {
      title: "Create a messaging campaign",
      readOnlyHint: true,
    },
    _meta: {
      requiresAuth: true,
      requiresProject: true,
    },
  },
  async ({ displayName, notificationTitle, notificationText, expiry, targetingCondition }, { projectId }) => {
    try {
        JSON.parse(targetingCondition)
    } catch (e: any) {
        mcpError("Pass in targetingCondition as valid JSON")
    }
    if (!isTimestampInSecondsFormat(expiry)) {
        mcpError("Timestamp should be passed in the correct format (example \"2419200s\")")
    }
    if (displayName === undefined || notificationText === undefined || notificationTitle === undefined) {
        mcpError("Neither of displayName, notificationTitle or notificationText should be undefined")
    }
    return toContent(
      await createMessagingCampaign(displayName, notificationTitle, notificationText, expiry, targetingCondition, projectId!),
    );
  },
);
