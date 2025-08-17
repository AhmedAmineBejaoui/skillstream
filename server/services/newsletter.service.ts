import { sendEmail } from './email.service';
import type { NewsletterSubscribe, NewsletterPreference, NewsletterCampaign } from '@shared/schema';

interface Subscriber {
  email: string;
  preferences: { promotions: boolean; updates: boolean };
  subscribed: boolean;
}

const subscribers: Subscriber[] = [];

export const newsletterService = {
  subscribe(data: NewsletterSubscribe) {
    let sub = subscribers.find(s => s.email === data.email);
    if (!sub) {
      sub = { email: data.email, preferences: data.preferences, subscribed: true };
      subscribers.push(sub);
    } else {
      sub.preferences = data.preferences;
      sub.subscribed = true;
    }
    return sub;
  },
  unsubscribe(email: string) {
    const sub = subscribers.find(s => s.email === email);
    if (sub) sub.subscribed = false;
  },
  updatePreferences(data: NewsletterPreference) {
    let sub = subscribers.find(s => s.email === data.email);
    if (!sub) {
      sub = { email: data.email, preferences: { promotions: data.preferences.promotions ?? true, updates: data.preferences.updates ?? true }, subscribed: true };
      subscribers.push(sub);
      return sub;
    }
    sub.preferences = { ...sub.preferences, ...data.preferences };
    return sub;
  },
  async sendCampaign(data: NewsletterCampaign) {
    const recipients = subscribers.filter(s => s.subscribed && s.preferences[data.type]);
    for (const sub of recipients) {
      await sendEmail({ to: sub.email, subject: data.subject, text: data.content });
    }
    return recipients.length;
  }
};
