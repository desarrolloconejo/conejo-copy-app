import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError, config, flattenError, locales } from "zod";
import type { TrpcContext } from "./context";

// Zod default messages are English. Switching the locale once translates every
// rule that does not carry its own wording, so a field nobody annotated still
// answers in the language of the interface.
config(locales.es());

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
  /**
   * Hands validation failures to the client as structured data.
   *
   * Without this, a rejected input arrives as `message` holding the stringified
   * array of Zod issues, and any form that renders the message shows the raw
   * JSON — regular expressions included — to the person filling it in.
   */
  errorFormatter({ shape, error }) {
    const zodError =
      error.cause instanceof ZodError ? flattenError(error.cause) : null;

    return {
      ...shape,
      data: {
        ...shape.data,
        fieldErrors: zodError?.fieldErrors ?? null,
        formErrors: zodError?.formErrors ?? null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);
