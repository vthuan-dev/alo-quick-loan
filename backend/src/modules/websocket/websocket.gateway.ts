import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
  namespace: '/admin',
})
export class AdminWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AdminWebSocketGateway.name);
  private connectedAdmins = new Map<string, Socket>();

  handleConnection(client: Socket) {
    this.logger.log(`Admin client connected: ${client.id}`);
    
    // Join admin room for broadcasting
    client.join('admin-room');
    
    // Store connected admin
    this.connectedAdmins.set(client.id, client);
    
    // Send current connection count
    this.server.to('admin-room').emit('adminConnected', {
      connectedCount: this.connectedAdmins.size,
      timestamp: new Date().toISOString(),
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Admin client disconnected: ${client.id}`);
    
    // Remove from connected admins
    this.connectedAdmins.delete(client.id);
    
    // Send updated connection count
    this.server.to('admin-room').emit('adminDisconnected', {
      connectedCount: this.connectedAdmins.size,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('joinAdminRoom')
  handleJoinAdminRoom(@ConnectedSocket() client: Socket) {
    client.join('admin-room');
    this.logger.log(`Admin ${client.id} joined admin room`);
  }

  @SubscribeMessage('leaveAdminRoom')
  handleLeaveAdminRoom(@ConnectedSocket() client: Socket) {
    client.leave('admin-room');
    this.logger.log(`Admin ${client.id} left admin room`);
  }

  // Method to emit new loan application notification
  emitNewLoanApplication(loanData: {
    loanApplicationId: string;
    fullName: string;
    phoneNumber: string;
    loanAmount: number;
    loanTerm: number;
    status: string;
    createdAt: string;
  }) {
    this.logger.log(`Emitting new loan application: ${loanData.loanApplicationId}`);
    
    this.server.to('admin-room').emit('newLoanApplication', {
      type: 'NEW_LOAN_APPLICATION',
      data: loanData,
      timestamp: new Date().toISOString(),
    });
  }

  // Method to emit loan status update
  emitLoanStatusUpdate(loanData: {
    loanApplicationId: string;
    status: string;
    updatedBy: string;
    updatedAt: string;
  }) {
    this.logger.log(`Emitting loan status update: ${loanData.loanApplicationId}`);
    
    this.server.to('admin-room').emit('loanStatusUpdate', {
      type: 'LOAN_STATUS_UPDATE',
      data: loanData,
      timestamp: new Date().toISOString(),
    });
  }

  // Method to get connected admin count
  getConnectedAdminCount(): number {
    return this.connectedAdmins.size;
  }

  // Method to check if any admins are connected
  hasConnectedAdmins(): boolean {
    return this.connectedAdmins.size > 0;
  }
}
