import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
  RequestTimeoutException
} from '@nestjs/common'
import { isUUID } from 'class-validator'
import { Request, Response } from 'express'
import { Observable, from, of, throwError } from 'rxjs'
import { catchError, map, mergeMap } from 'rxjs/operators'
import { CACHE_SERVICE, type CacheService } from 'src/common/service/cache.service'

interface CachedResponse {
  statusCode: number
  body: unknown
  headers?: Record<string, string>
}

const IDEMPOTENCY_HEADER = 'X-Idempotency-Key'
const IDEMPOTENCY_CACHE_PREFIX = 'idempotency'
const PROCESSING_TTL_S = 5 // since the API is simple, the processing TTL is low, but ideally it should be based on metricts
const PROCESSING_TTL_MS = PROCESSING_TTL_S * 1000
const PROCESSING_POLL_INTERVAL_MS = 500
const RESPONSE_TTL_S = 900
const FORWARD_RESPONSE_HEADERS = new Set(['content-type', 'cache-control', 'etag', 'last-modified', 'location'])

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(@Inject(CACHE_SERVICE) private readonly cache: CacheService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const httpContext = context.switchToHttp()

    const request = httpContext.getRequest<Request>()
    const response = httpContext.getResponse<Response>()

    const key = request.header(IDEMPOTENCY_HEADER)

    if (!key || request.method.toUpperCase() === 'GET') {
      return next.handle()
    }

    if (key && !isUUID(key)) {
      throw new BadRequestException(`${IDEMPOTENCY_HEADER} must be a valid UUID`)
    }

    const cacheKey = this.buildCacheKey({ key, request })

    const cachedResponse = await this.getCachedResponse(cacheKey)
    if (cachedResponse) {
      this.applyCachedResponse(response, cachedResponse)
      return of(cachedResponse.body)
    }

    const claimed = await this.claimProcessing(cacheKey)
    if (!claimed) {
      // According to the Idempotency-Key RFC recommendation, we should respond with 409.
      // However, to improve UX (e.g. if the client lost connection and retried),
      // we wait for up to PROCESSING_TTL_MS for the first request to complete.
      // If it still hasn’t finished, respond with 408.

      const start = Date.now()
      while (Date.now() - start < PROCESSING_TTL_MS) {
        const cachedResponse = await this.getCachedResponse(cacheKey)
        if (cachedResponse) {
          this.applyCachedResponse(response, cachedResponse)
          return of(cachedResponse.body)
        }
        await new Promise((r) => setTimeout(r, PROCESSING_POLL_INTERVAL_MS))
      }

      throw new RequestTimeoutException('Another request with the same idempotency key is still in progress')
    }

    return next.handle().pipe(
      mergeMap((body) => from(this.persistResponse(cacheKey, response, body)).pipe(map(() => body))),
      catchError((error) => from(this.releaseClaim(cacheKey)).pipe(mergeMap(() => throwError(() => error)))),
    )
  }

  private buildCacheKey({ key, request }: { key: string; request: Request }): string {
    const method = request.method.toUpperCase()
    const url = request.originalUrl || request.url || ''
    return `${IDEMPOTENCY_CACHE_PREFIX}:${method}:${url}:${key}`
  }

  private async claimProcessing(cacheKey: string): Promise<boolean> {
    return await this.cache.set(`lock:${cacheKey}`, 'true', 'ifNotExists', 'seconds', PROCESSING_TTL_S)
  }

  private async releaseClaim(cacheKey: string): Promise<void> {
    await this.cache.remove(`lock:${cacheKey}`)
  }

  private async persistResponse(cacheKey: string, response: Response, body: unknown): Promise<void> {
    const headers = this.pickForwardHeaders(response.getHeaders())
    try {
      await this.cache.set(
        cacheKey,
        {
          statusCode: response.statusCode,
          body,
          headers: Object.keys(headers).length ? headers : undefined,
        },
        'always',
        'seconds',
        RESPONSE_TTL_S,
      )
    } finally {
      await this.releaseClaim(cacheKey)
    }
  }

  private async getCachedResponse(cacheKey: string): Promise<CachedResponse | null> {
    return await this.cache.get<CachedResponse | null>(cacheKey)
  }

  private applyCachedResponse(response: Response, cached: CachedResponse): void {
    if (cached.headers) {
      for (const [name, value] of Object.entries(cached.headers)) {
        response.setHeader(name, value)
      }
    }
    response.status(cached.statusCode)
  }

  private pickForwardHeaders(headers: NodeJS.Dict<number | string | string[]>): Record<string, string> {
    return Object.entries(headers).reduce<Record<string, string>>((acc, [name, value]) => {
      const lower = name.toLowerCase()
      if (!FORWARD_RESPONSE_HEADERS.has(lower)) {
        return acc
      }
      acc[lower] = Array.isArray(value) ? value.join(',') : String(value)
      return acc
    }, {})
  }
}
