// import {
//   ConnectedSocket,
//   MessageBody,
//   OnGatewayConnection,
//   OnGatewayDisconnect,
//   OnGatewayInit,
//   SubscribeMessage,
//   WebSocketGateway,
//   WebSocketServer,
// } from '@nestjs/websockets';
// import { Server } from 'http';
// import { Socket } from 'socket.io';

// @WebSocketGateway({ cors: { origin: '*' } })
// export class ChatGateway
//   implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
// {
//   @WebSocketServer()
//   server: Server;

//   afterInit(server: Server) {
//     console.log('WebSocket server initialized');
//   }

//   // Khi user/host connects vào server
//   handleConnection(client: Socket) {
//     const userId = client.handshake.query.userId;
//     console.log(`User connected: ${userId} (socket: ${client.id})`);

//     // Join vào room riêng
//     if (userId) {
//       client.join(userId.toString()); // mỗi user có 1 room riêng để nhận tin nhắn
//     }
//   }

//   handleDisconnect(client: Socket) {
//     console.log(`User disconnected: ${client.id}`);
//   }

//   @SubscribeMessage('sendMessage')
//   handleMessage(
//     @MessageBody()
//     payload: {
//       fromUserId: string;
//       toUserId: string;
//       message: string;
//     },
//     @ConnectedSocket() client: Socket,
//   ) {
//     console.log(
//       `Message from ${payload.fromUserId} to ${payload.toUserId}: ${payload.message}`,
//     );

//     const messageData = {
//       fromUserId: payload.fromUserId,
//       message: payload.message,
//       timestamp: new Date(),
//     };

//     // Send message to recipient's room
//     this.server.to(payload.toUserId).emit('receiveMessage', messageData);

//     return {
//       status: 'success',
//       message: 'Message sent successfully',
//       data: messageData,
//     };
//   }
// }
