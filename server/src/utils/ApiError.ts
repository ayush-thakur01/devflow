class ApiError extends Error {
  statusCode = undefined
  errors = null

  constructor(statusCode, message, errors = null) {
    super(message)
    this.statusCode = statusCode
    this.errors = errors
    Error.captureStackTrace(this, this.constructor)
  }
}

export default ApiError
