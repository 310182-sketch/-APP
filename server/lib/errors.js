export function err(reply, code, message, details) {
  return reply.code(code).send({ error: message, code, details })
}

export function notFound(reply, what = 'resource') {
  return err(reply, 404, `${what} not found`)
}

export function badRequest(reply, message = 'bad request', details) {
  return err(reply, 400, message, details)
}