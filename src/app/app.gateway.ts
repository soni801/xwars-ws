import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';

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
   */
  @SubscribeMessage('create')
  createLobby(): string {
    const code = this.createLobbyCode(4);
    this.lobbies.push(code);
    return code;
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
