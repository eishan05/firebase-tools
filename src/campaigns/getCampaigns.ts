import { campaignsApiOrigin } from "../api";
import { Client } from "../apiv2";
import { logger } from "../logger";
import { FirebaseError } from "../error";

const TIMEOUT = 10000; // 10 seconds

const apiClient = new Client({
  urlPrefix: campaignsApiOrigin(),
  apiVersion: "v1beta",
});

export async function getCampaigns(projectId: string): Promise<any> {
  try {
    const res = await apiClient.request({
      method: "GET",
      path: `/projects/${projectId}/campaigns`,
      body: {},
      timeout: TIMEOUT,
    });
    return res.body;
  } catch (err: any) {
    logger.debug(err.message);
    throw new FirebaseError("Failed to get campaigns", { original: err });
  }
}
