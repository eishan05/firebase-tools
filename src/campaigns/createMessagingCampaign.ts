import { campaignsApiOrigin } from "../api";
import { Client } from "../apiv2";
import { logger } from "../logger";
import { FirebaseError } from "../error";

const TIMEOUT = 10000; // 10 seconds

const apiClient = new Client({
  urlPrefix: campaignsApiOrigin(),
  apiVersion: "v1beta",
});

export async function createMessagingCampaign(displayName: string, notificationTitle: string, notificationText: string, expiry: string, targetingCondition: string, projectId: string): Promise<any> {
  try {
    const body = {
        "display_name": displayName,
        "notification_options": {
            "message_title": notificationTitle,
            "message_text": notificationText,
            "expiry_time": expiry
        },
        "targeting_condition_json": targetingCondition,
        "on_start": {}
    }
    const res = await apiClient.request({
      method: "POST",
      path: `/projects/${projectId}/campaigns`,
      body: JSON.stringify(body),
      timeout: TIMEOUT,
      ignoreQuotaProject: false,
    });
    return res.body;
  } catch (err: any) {
    logger.debug(err.message);
    throw new FirebaseError("Failed to create campaigns: " + err.message, { original: err });
  }
}