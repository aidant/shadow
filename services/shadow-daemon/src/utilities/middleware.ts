import { RouterMiddleware, RouteParams } from 'oak'

type Handler<T> = (body: T, params: RouteParams) => Promise<unknown>
type Validator<T> = (body: T, params: RouteParams) => void

export function middleware <T extends never>(handler: Handler<T>): RouterMiddleware
export function middleware <T>(handler: Handler<T>, validator: Validator<T>): RouterMiddleware
export function middleware <T>(
  handler: Handler<T>,
  validator?: Validator<T>
): RouterMiddleware {
  return async (ctx) => {
    let body: T
  
    if (validator) {
      try {
        body = await ctx.request.body({ type: 'json' }).value
      } catch {
        ctx.throw(400)
        return
      }
  
      try {
        validator(body, ctx.params)
      } catch (error) {
        const errors = (error.errors?.map((error: Error) => error?.message) ?? [error.message])
          .join('\n')
        ctx.throw(422, 'Unprocessable Entity\r\r' + errors)
        return
      }
    }
  
    try {
      ctx.response.body = JSON.stringify(await handler(body!, ctx.params), null, 2)
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}