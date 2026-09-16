import { Container, getContainer } from "@cloudflare/containers";

// The Flask app inside the container listens on 8080 (see Dockerfile).
// A single named instance ("default") is used deliberately — this is a
// small internal team tool, not something that needs to be sharded across
// multiple container instances, and keeping everyone on one instance keeps
// gunicorn's single worker process simple.
export class ProductionTerminalContainer extends Container {
  defaultPort = 8080;
  sleepAfter = "10m";

  // Flask reads DATABASE_URL and SECRET_KEY from its process environment
  // (see app/config.py). Both are set as Worker secrets (wrangler secret
  // put ...) rather than plain vars in wrangler.jsonc, since DATABASE_URL
  // embeds the D1 API token. We forward them into the container's env here.
  constructor(ctx, env) {
    super(ctx, env);
    this.envVars = {
      DATABASE_URL: env.DATABASE_URL,
      SECRET_KEY: env.SECRET_KEY,
    };
  }
}

export default {
  async fetch(request, env) {
    const container = getContainer(env.PRODUCTION_TERMINAL, "default");
    return container.fetch(request);
  },
};
