import rateLimit from "express-rate-limit";

/**
 * General API rate limiter.
 *
 * Protects the backend from accidental
 * or abusive excessive requests.
 */
export const apiRateLimiter =
  rateLimit({
    windowMs: 15 * 60 * 1000,

    max: 100,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
      success: false,
      message:
        "Too many requests. Please try again later.",
    },
  });

/**
 * Strict limiter for authentication
 * endpoints.
 *
 * This helps protect login/register
 * endpoints from brute-force attempts.
 */
export const authRateLimiter =
  rateLimit({
    windowMs: 15 * 60 * 1000,

    max: 10,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
      success: false,
      message:
        "Too many authentication attempts. Please try again later.",
    },
  });

/**
 * AI endpoint limiter.
 *
 * AI requests can be expensive because
 * they may involve embeddings, Pinecone,
 * Groq and multi-agent workflows.
 */
export const aiRateLimiter =
  rateLimit({
    windowMs: 60 * 1000,

    max: 20,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
      success: false,
      message:
        "AI request limit reached. Please wait before sending more requests.",
    },
  });