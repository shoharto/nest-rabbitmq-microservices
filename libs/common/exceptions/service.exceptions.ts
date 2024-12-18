export class OrderProcessingException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrderProcessingException';
  }
}
