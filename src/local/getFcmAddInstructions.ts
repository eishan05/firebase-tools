import { logger } from "../logger";
import { FirebaseError } from "../error";

const TIMEOUT = 10000; // 10 seconds

export async function getFcmAddInstructions(): Promise<string> {
  try {
    const url = `http://localhost:8080`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new FirebaseError(`HTTP error! Status: ${response.status} ${response.statusText}`)
    }

    const textData = await response.json();
    return textData;
  } catch (err: any) {
    logger.debug(err.message);
    throw new FirebaseError("Failed to get FCM Add Instructions:" + err.message, { original: err });
  }
}