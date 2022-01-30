import { ConnInfo, Handler } from "../deps/server.ts";
import { ParameterContext } from "../deps/brotoroutus.ts";
import { MiddlewareContext, runMiddlewarePipeline } from "../deps/waggon.ts";
import { body, html, pipe, toResponse } from "../deps/please-respond.ts";
import staticFiles from "../deps/static-files.ts";
import { rootHtml } from "./pages/index.tsx";

interface RouteContext extends MiddlewareContext, ParameterContext {}

export type RouteHandler = (
  request: Request,
  connInfo: ConnInfo,
  ctx?: RouteContext
) => Response | Promise<Response>;

interface Handlers {
  [name: string]: RouteHandler;
}

export function handleRouteHandlerPipeline(
  pipeline: RouteHandler[]
): RouteHandler {
  return (req, conn, ctx) => {
    return runMiddlewarePipeline(pipeline, req, conn, {
      ...ctx,
      response: new Response(),
    });
  };
}

export const handlers: Handlers = {
  root: () => toResponse(pipe([html, body(rootHtml)])),
  hello: (req, conn, ctx) => new Response(`hello ${ctx?.parameters.name}`),
  public: (req) => {
    return staticFiles("public")({
      request: req,
      respondWith: (r: Response) => r,
    });
  },
};