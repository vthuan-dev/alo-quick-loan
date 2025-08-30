import { Module } from '@nestjs/common';
import { AdminWebSocketGateway } from './websocket.gateway';

@Module({
  providers: [AdminWebSocketGateway],
  exports: [AdminWebSocketGateway],
})
export class WebSocketModule {}
