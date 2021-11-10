import { Injectable } from '@nestjs/common';
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

  emitMessage(data: WebSocketClientResponse) {
    try {
      this.socket.emit('response', data);
    } catch (ex) {
      console.log(ex);
    }
  }
}
