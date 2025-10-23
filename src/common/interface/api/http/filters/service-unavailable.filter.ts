import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common'
import { Response } from 'express'
import { CircuitOpenError } from 'src/common/errors/circuit-open.error'
import { TransientInfrastructureError } from 'src/common/errors/transient-infrastructure.error'

@Catch(CircuitOpenError, TransientInfrastructureError)
export class ServiceUnavailableFilter implements ExceptionFilter {
  catch(err: CircuitOpenError | TransientInfrastructureError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    response
      .setHeader('Retry-After', Math.ceil(err.retryAfter / 1000))
      .status(HttpStatus.SERVICE_UNAVAILABLE)
      .json({
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Service temporarily unavailable. Please retry later.',
      })
  }
}
