import { ServerTool } from "../../tool.js";
import { create_messaging_campaign } from "./create_messaging_campaign.js";
import {get_firebase_messaging_campaigns} from "./get_firebase_messaging_campaigns.js";

export const campaignTools: ServerTool[] = [
    get_firebase_messaging_campaigns,
    create_messaging_campaign,
];
