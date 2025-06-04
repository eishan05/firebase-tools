import { logger } from "../logger";
import { FirebaseError } from "../error";

export async function getVapidPublicKey(): Promise<string> {
  try {
    const url = `http://localhost:8080/getPublicKey`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new FirebaseError(`HTTP error! Status: ${response.status} ${response.statusText}`)
    }

    const textData = await response.json();
    return textData;
  } catch (err: any) {
    logger.debug(err.message);
    throw new FirebaseError("Failed to get VAPID public key:" + err.message, { original: err });
  }
}