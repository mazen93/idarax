import { Injectable, Logger } from '@nestjs/common';
import Pusher from 'pusher';

@Injectable()
export class PusherService {
  private pusher: Pusher;
  private readonly logger = new Logger(PusherService.name);

  constructor() {
    this.pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID || '1958543',
      key: process.env.PUSHER_KEY || '7d588279cd6a9ac136a1',
      secret: process.env.PUSHER_SECRET || '7ec1377f40ad8c6f29bc',
      cluster: process.env.PUSHER_CLUSTER || 'us2', // default fallback, normally not used in custom host
      host: process.env.PUSHER_HOST || 'mosaada.ae',
      port: process.env.PUSHER_PORT || '443',
      useTLS: true,
    });
  }

  async trigger(channel: string | string[], event: string, data: any) {
    try {
      this.logger.log(`Triggering ${event} on ${channel}`);
      await this.pusher.trigger(channel, event, data);
    } catch (error) {
      this.logger.error(`Error triggering ${event} on ${channel}`, error);
    }
  }
}
