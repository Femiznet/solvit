export class ClientError extends Error {
    status = 400
    constructor(message: string) {
      super(message);
      this.name = "ClientError";
    }
}