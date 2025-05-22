enum CampaignState {
    UNSPECIFIED = 0,
    RUNNING = 1,
    DRAFT = 2,
    FINISHED = 3,
    SCHEDULED = 4,
}

/**
 * Represents a campaign with its display name, description, state, and targeting condition.
 *
 * @property displayName - The human-readable name of the campaign.
 * @property description - A brief description of the campaign.
 * @property state - The current state of the campaign.
 * @property targetingCondition - The condition used to target recipients for the campaign.
 */
export interface Campaign {
    displayName: string;
    description: string;
    state: CampaignState;
    targetingCondition?: string;
}