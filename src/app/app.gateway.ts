import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway()
export class AppGateway {
  /**
   * A list of the currently active game lobbies
   *
   * @private
   */
  private lobbies: string[] = [];

  /**
   * Creates a game lobby and returns the join code
   *
   * @param socket The Socket making the request
   * @returns The join code of the created lobby
   */
  @SubscribeMessage('create')
  createLobby(socket: Socket): string {
    // Create the lobby with a new code
    const code = this.createLobbyCode(4);
    this.lobbies.push(code);

    // Add this socket to a socket.io room with the lobby code
    socket.join(code);

    return code;
  }

  /**
   * Joins a game lobby with the given code
   *
   * @param socket The Socket making the request
   * @param code The lobby code to join
   * @returns Whether the join attempt was successful
   */
  @SubscribeMessage('join')
  joinLobby(socket: Socket, code: string): boolean {
    // Make sure that the lobby exists
    if (!this.lobbies.includes(code)) return false;

    // Add this socket to the socket.io room
    socket.join(code);

    return true;
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
    } while (this.lobbies.includes(output));

    return output;
  }
}
