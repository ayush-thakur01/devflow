const responseMiddleware = (req, res, next) => {
  res.success = (data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({ success: true, message, data })
  }

  next()
}

export default responseMiddleware
