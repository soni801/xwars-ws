import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Lobby } from '../models/lobby.model';
import { Player } from '../models/player.model';
import { JoinLobbyDto } from '../dto/join-lobby.dto';

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
   */
  @SubscribeMessage('create')
  createLobby(
    @MessageBody() player: Player,
    @ConnectedSocket() socket: Socket,
  ): Lobby {
    // Create the lobby with a new code
    const code = this.createLobbyCode(4);
    const lobby: Lobby = { code, players: [player] };
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
   */
  @SubscribeMessage('join')
  joinLobby(
    @MessageBody() body: JoinLobbyDto,
    @ConnectedSocket() socket: Socket,
  ): Lobby {
    // Make sure that the lobby exists
    if (!this.lobbies.some((lobby) => lobby.code === body.code)) return null;

    // Add this player to the lobby
    this.lobbies
      .find((lobby) => lobby.code === body.code)
      .players.push(body.player);

    // Add this socket to the socket.io room
    socket.join(body.code);

    return this.lobbies.find((lobby) => lobby.code === body.code);
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
