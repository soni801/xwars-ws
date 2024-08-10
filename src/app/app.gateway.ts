import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsException,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Lobby } from '../models/lobby.model';
import { Player } from '../models/player.model';
import { JoinLobbyDto } from '../dto/join-lobby.dto';
import { TakeTileDto } from '../dto/take-tile.dto';
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { BadRequestTransformationFilter } from '../filter/bad-request-transformation.filter';

@UseFilters(BadRequestTransformationFilter)
@UsePipes(new ValidationPipe())
@WebSocketGateway()
export class AppGateway {
  /**
   * A list of the currently active game lobbies
   *
   * @private
   */
  private lobbies: Lobby[] = [];

  /**
   * Creates a new game lobby
   *
   * @param player The Player that is creating the lobby
   * @param socket The Socket making the request
   * @returns The created lobby
   *
   * @throws {WsException} This Socket is already in a lobby
   */
  @SubscribeMessage('create')
  createLobby(
    @MessageBody() player: Player,
    @ConnectedSocket() socket: Socket,
  ): Lobby {
    // Make sure this Socket isn't already in a lobby
    if (socket.rooms.size > 1)
      throw new WsException('This Socket is already in a lobby');

    // Add this Socket ID to the player properties
    player.socketId = socket.id;

    // Create the lobby with a new code
    const code = this.createLobbyCode(4);
    const lobby: Lobby = { code, players: [player], currentPlayer: 0 };
    this.lobbies.push(lobby);

    // Add this socket to a socket.io room with the lobby code
    socket.join(code);

    return lobby;
  }

  /**
   * Joins a game lobby with the given code
   *
   * @param body The request body
   * @param socket The Socket making the request
   * @returns The lobby updated with this player
   *
   * @throws {WsException} This Socket is already in a lobby
   * @throws {WsException} The specified lobby is full
   */
  @SubscribeMessage('join')
  joinLobby(
    @MessageBody() body: JoinLobbyDto,
    @ConnectedSocket() socket: Socket,
  ): Lobby {
    // Make sure this Socket isn't already in a lobby
    if (socket.rooms.size > 1)
      throw new WsException('This Socket is already in a lobby');

    // Make sure that the lobby exists
    if (!this.lobbies.some((lobby) => lobby.code === body.code)) return null;

    // Make sure that the lobby isn't full
    const lobby = this.lobbies.find((lobby) => lobby.code === body.code);
    if (lobby.players.length > 1)
      throw new WsException('The specified lobby is full');

    // Add this Socket ID to the player properties
    body.player.socketId = socket.id;

    // Add this player to the lobby
    lobby.players.push(body.player);

    // Add this socket to the socket.io room
    socket.join(body.code);

    return this.lobbies.find((lobby) => lobby.code === body.code);
  }

  /**
   * Broadcasts a tile placement to all other sockets in the same rooms as this socket
   *
   * @param body The tile placement data to broadcast
   * @param socket The Socket making the request
   * @returns Always `true`
   *
   * @throws {WsException} This Socket is not in a lobby
   * @throws {WsException} It is not this Socket's player's turn
   */
  @SubscribeMessage('take')
  takeTile(
    @MessageBody() body: TakeTileDto,
    @ConnectedSocket() socket: Socket,
  ): boolean {
    // Make sure the Socket is in a lobby
    if (socket.rooms.size < 2)
      throw new WsException('This Socket is not in a lobby');

    // Get the lobby this Socket is in
    const lobby = this.lobbies.find(
      (lobby) => lobby.code === [...socket.rooms][1],
    );

    // Make sure this Socket is the current player's turn
    if (lobby.players[lobby.currentPlayer].socketId !== socket.id)
      throw new WsException("It is not this Socket's player's turn");

    // Increment current player
    if (++lobby.currentPlayer > 1) lobby.currentPlayer = 0;

    // Broadcast tile placement in socket.io room
    return socket.broadcast.in(Array.from(socket.rooms)).emit('take', body);
  }

  /**
   * Creates a unique lobby code
   *
   * @param length How many symbols the code will include
   * @returns A unique lobby code
   * @private
   */
  private createLobbyCode(length: number): string {
    const validSymbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let output: string;

    // Repeatedly generate new codes until the output is unique
    do {
      output = '';
      for (let i = 0; i < length; i++) {
        output += validSymbols.charAt(
          Math.floor(Math.random() * validSymbols.length),
        );
      }
    } while (this.lobbies.some((lobby) => lobby.code === output));

    return output;
  }
}
