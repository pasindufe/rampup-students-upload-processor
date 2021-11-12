import { Injectable, Logger } from '@nestjs/common';
import * as io from 'socket.io-client';
import { WebSocketClientResponse } from './types/web-socket-client-response';
import { WEB_SOCKET_API_URL } from './util/constants';

@Injectable()
export class WebSocketClientService {
  private socket: io.Socket;

  constructor() {
    this.socket = io.connect(WEB_SOCKET_API_URL, {
      reconnection: true,
    });
  }

  private readonly logger = new Logger(WebSocketClientService.name);

  emitMessage(data: WebSocketClientResponse) {
    try {
      this.socket.emit('response', data);
      this.logger.log(`${data} emitted to web-socket service`);
    } catch (ex) {
      this.logger.error(ex);
    }
  }
}
