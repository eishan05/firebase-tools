export const SERVER_FEATURES = [
  "firestore",
  "storage",
  "dataconnect",
  "auth",
  "messaging",
  "remoteconfig",
  "crashlytics",
  "apphosting",
  "campaigns",
  "firebase_local_tool",
] as const;
export type ServerFeature = (typeof SERVER_FEATURES)[number];

export interface ClientConfig {
  /** The current project root directory for this client. */
  projectRoot?: string | null;
}
