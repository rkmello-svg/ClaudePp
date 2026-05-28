import { Injectable } from '@nestjs/common';
import { APP_VERSION } from '@claudepp/shared';

@Injectable()
export class AppService {
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: `ClaudePP Backend v${APP_VERSION}`,
    };
  }
}
