export class MachineError extends Error {
  code: string;
  constructor(code:string, message: string) {
    super(message);
    this.name = 'MachineError';
    this.code = code;
  }
}