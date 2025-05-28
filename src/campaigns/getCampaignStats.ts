import { logger } from "../logger";
import { FirebaseError } from "../error";

const TIMEOUT = 10000; // 10 seconds

export async function getCampaignStats(projectNumber: string, campaignIDs: string[]): Promise<any> {
  try {
    const url = `http://localhost:8080/?senderId=${projectNumber}&campaignIds=${campaignIDs.join(',')}`;
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      throw new FirebaseError(`HTTP error! status: ${response.status}, text: ${errorText}`);
    }
    const data = await response.json();
    return data;
  } catch (err: any) {
    logger.debug(err.message);
    throw new FirebaseError("Failed to get campaigns:" + err.message, { original: err });
  }
}