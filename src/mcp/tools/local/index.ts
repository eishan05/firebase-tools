import { get_firebase_messaging_campaign_stats } from "../local/get_firebase_messaging_campaign_stats.js";
import { get_add_fcm_instructions } from "./get_add_fcm_instructions.js";
import { ServerTool } from "../../tool.js";
import { get_public_key } from "./get_public_key.js";

export const localTools: ServerTool[] = [
    get_firebase_messaging_campaign_stats,
    get_add_fcm_instructions,
    get_public_key,
]