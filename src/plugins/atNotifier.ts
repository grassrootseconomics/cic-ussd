import { FastifyPluginAsync } from 'fastify';
import { Notifier } from '@lib/ussd';
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyInstance {
    atNotifier: Notifier
  }
}

interface ATNotifierPluginOptions {
  active: boolean;
  apiKey: string;
  senderId?: string;
  url: string;
  username: string;
}

interface ATRecipient {
  statusCode: number,
  number: string,
  status: string,
  cost: string,
  messageId: string
}

interface AtResponse {
  SMSMessageData: {
    Message: string,
    Recipients: ATRecipient[]
  }
}

export class ATNotifier implements Notifier {

  active: boolean
  apiKey: string;
  senderId: string | undefined;
  url: string;
  username: string;

  constructor(active: boolean, apiKey: string, url: string, username: string, senderId?: string) {
    this.active = active;
    this.apiKey = apiKey;
    this.url = url;
    this.username = username;

    if (senderId) {
      this.senderId = senderId;
    }
  }

  async send(message: string, recipients: string[]): Promise<void> {
    const payload: Record<string, string> = {
      username: this.username,
      to: recipients.join(','),
      message: message,
    }

    if (this.senderId) {
      payload['from'] = this.senderId;
    }

    const urlEncodedPayload = new URLSearchParams(payload).toString();

    let response = await fetch(this.url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'apiKey': this.apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: urlEncodedPayload,
    })

    if (!response.ok) {
      throw new Error(`Failed to send SMS: ${response.status} ${response.statusText}`)
    }
  }
}

const atNotifierPlugin: FastifyPluginAsync<ATNotifierPluginOptions> = async (fastify, options) => {
  const notifier = new ATNotifier(
    options.active,
    options.apiKey,
    options.url,
    options.username,
    options.senderId,
  )

  fastify.decorate('atNotifier', notifier)
}

export default fp(atNotifierPlugin, {
  fastify: '4.x',
  name: 'at-notifier',
});