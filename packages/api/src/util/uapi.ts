import {UAPI} from '@byu-oit/uapi-ts'
import {Query} from 'express-serve-static-core'
import {ErrorObject} from 'ajv'

export enum HttpStatus {
  SUCCESS = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_ERROR = 500,
}

export function getResponseForReturnCode(code: number): string {
  if (code===HttpStatus.SUCCESS) return 'Success'
  if (code===HttpStatus.CREATED) return 'Created'
  if (code===HttpStatus.ACCEPTED) return 'Accepted'
  if (code===HttpStatus.NO_CONTENT) return 'No Content'
  if (code===HttpStatus.BAD_REQUEST) return 'Bad Request'
  if (code===HttpStatus.UNAUTHORIZED) return 'Unauthorized'
  if (code===HttpStatus.FORBIDDEN) return 'Forbidden'
  if (code===HttpStatus.NOT_FOUND) return 'Not Found'
  if (code===HttpStatus.CONFLICT) return 'Conflict'
  if (code===HttpStatus.INTERNAL_ERROR) return 'Internal Error'
  return ''
}

export function generateValidationResponseObj(code: number, message?: string | null, validation?: string[] | null): UAPI.Metadata.Simple {
  if ([
    HttpStatus.SUCCESS,
    HttpStatus.CREATED,
    HttpStatus.ACCEPTED,
    HttpStatus.NO_CONTENT,
    HttpStatus.BAD_REQUEST,
    HttpStatus.UNAUTHORIZED,
    HttpStatus.FORBIDDEN,
    HttpStatus.NOT_FOUND,
    HttpStatus.CONFLICT,
    HttpStatus.INTERNAL_ERROR
  ].indexOf(code)=== -1) code = HttpStatus.INTERNAL_ERROR
  if (!message) message = getResponseForReturnCode(code)
  return {
    validation_response: {code, message},
    ...validation && {validation_information: validation}
  }
}

export function generateMetadataResponseObj(code: number, message?: string | null, validation?: string[] | null): { metadata: UAPI.Metadata.Simple } {
  return {metadata: generateValidationResponseObj(code, message, validation)}
}

export function generateCollectionMetadataResponseObj(
  size: number,
  code: number,
  message?: string,
  validation: string[] = []
): UAPI.Metadata.Collection {
  return {
    collection_size: size,
    ...generateValidationResponseObj(code, message, validation)
  }
}

export class ValidationError extends Error {
  errors?: string[] | null // AJV ErrorObject definition works perfectly with validation information handling
  constructor(errors?: ErrorObject[] | null) {
    super('Validation Error')
    this.errors = errors?.reduce((messages, {message}) => {
      return message ? messages.concat(message) : messages
    }, [] as string[])
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export function parseQueryToInt (query: Query[0], def = 0): number {
  let result: number = def
  if (Array.isArray(query)) {
    query = query[0]
  }
  if (typeof query === 'string') result = parseInt(query)
  if (typeof query === 'number') result = query
  return result
}


