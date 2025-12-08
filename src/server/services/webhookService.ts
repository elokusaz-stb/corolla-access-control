/**
 * Webhook Service
 * Handles sending notifications to external webhooks (e.g., Slack)
 */

const SLACK_WEBHOOK_URL = 'https://workflow.sih.services/webhook/notify-slack-ai-bootcamp';

export interface AccessGrantNotification {
  grantedByUser: {
    name: string;
    email: string;
  };
  grantedToUser: {
    name: string;
    email: string;
  };
  system: {
    name: string;
    description?: string | null;
  };
  tier: {
    name: string;
  };
  instance?: {
    name: string;
  } | null;
  notes?: string | null;
  grantedAt: Date;
}

export const webhookService = {
  /**
   * Send a notification when access is granted
   */
  async notifyAccessGranted(data: AccessGrantNotification): Promise<void> {
    const payload = {
      event: 'access_granted',
      timestamp: data.grantedAt.toISOString(),
      granted_by: {
        name: data.grantedByUser.name,
        email: data.grantedByUser.email,
      },
      granted_to: {
        name: data.grantedToUser.name,
        email: data.grantedToUser.email,
      },
      system: {
        name: data.system.name,
        description: data.system.description || null,
      },
      access_tier: data.tier.name,
      instance: data.instance?.name || null,
      notes: data.notes || null,
      message: formatSlackMessage(data),
    };

    try {
      await fetch(SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch {
      // Swallow webhook errors; do not block main flow
    }
  },
};

function formatSlackMessage(data: AccessGrantNotification): string {
  const instanceInfo = data.instance ? ` (${data.instance.name})` : '';
  const notesInfo = data.notes ? `\nNotes: ${data.notes}` : '';
  
  return `🔐 *Access Granted*

*${data.grantedByUser.name}* has granted *${data.grantedToUser.name}* access to:

• *System:* ${data.system.name}${instanceInfo}
• *Access Tier:* ${data.tier.name}
• *User Email:* ${data.grantedToUser.email}${notesInfo}

_Granted at ${data.grantedAt.toLocaleString()}_`;
}

