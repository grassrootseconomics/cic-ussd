export enum ErrorCodes {
  MISSING_PROPERTY = 'MISSING_PROPERTY',
  SYSTEM_ERROR = 'SYSTEM_ERROR',
}

export enum ContextError {
  MALFORMED_CONTEXT = 'MALFORMED_CONTEXT',
}

class CustomError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message)
    this.code = code
    this.name = this.constructor.name
  }
}

export class MachineError extends CustomError {
  constructor(code: string, message: string) {
    super(code, message)
  }
}

export class MissingProperty extends CustomError {
  constructor(message: string) {
    super(ErrorCodes.MISSING_PROPERTY, message)
  }
}

export class SystemError extends CustomError {
  constructor(message: string) {
    super(ErrorCodes.SYSTEM_ERROR, message)
  }
}