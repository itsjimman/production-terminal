import { Container, getContainer } from "@cloudflare/containers";

// The Flask app inside the container listens on 8080 (see Dockerfile).
// A single named instance ("default") is used deliberately — this is a
// small internal team tool, not something that needs to be sharded across
// multiple container instances, and keeping everyone on one instance keeps
// gunicorn's single worker process simple.
export class ProductionTerminalContainer extends Container {
  defaultPort = 8080;
  // Usage is sporadic (a handful of requests/hour from a small team), so a
  // short sleep window meant almost every visit was a cold start — the
  // container waking up and booting gunicorn/Flask from scratch, which is
  // most of why the app felt slow. A longer window keeps it warm across
  // normal gaps between visits during the day, at the cost of a bit more
  // idle compute time (negligible for how lightly this is used).
  sleepAfter = "1h";

  // Flask reads DATABASE_URL and SECRET_KEY from its process environment
  // (see app/config.py). Both are set as Worker secrets (wrangler secret
  // put ...) rather than plain vars in wrangler.jsonc, since DATABASE_URL
  // embeds the D1 API token. We forward them into the container's env here.
  constructor(ctx, env) {
    super(ctx, env);
    this.envVars = {
      DATABASE_URL: env.DATABASE_URL,
      SECRET_KEY: env.SECRET_KEY,
      // The D1 schema was provisioned by hand and is already known-correct,
      // so skip the app's startup migration/introspection checks — each one
      // is a real REST round trip to D1, and enough of them in sequence can
      // blow past how long Cloudflare waits for the container's port to
      // open. See app/__init__.py for the flag itself.
      SKIP_STARTUP_MIGRATIONS: "1",
    };
  }
}

export default {
  async fetch(request, env) {
    const container = getContainer(env.PRODUCTION_TERMINAL, "default");
    // container.fetch() alone races the container's own startup: on a cold
    // start (container was asleep) it can throw "container is not running"
    // even though the container goes on to boot successfully moments later.
    // Waiting for the port explicitly first — with a generous timeout that
    // covers a cold container-image pull plus gunicorn/Flask boot — makes
    // cold starts a bit slower but reliable instead of occasionally failing
    // outright. Once warm (sleepAfter is 1h), this resolves immediately.
    await container.startAndWaitForPorts({
      cancellationOptions: { portReadyTimeoutMS: 30_000 },
    });
    return container.fetch(request);
  },
};
