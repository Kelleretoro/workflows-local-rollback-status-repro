# Workflows: `instance.status()` has no `rollback` field under `wrangler dev`

The docs say that after a Workflow instance reaches a terminal state, `status()` carries `rollback`: an `outcome` of `"complete"` or `"failed"`, and an `error` or `null` ([Workers API](https://developers.cloudflare.com/workflows/build/workers-api/)). A deployed Worker returns it. Under `wrangler dev` (4.151.0) the field is absent, though the rollback handler runs.

## Reproduce

```sh
npm install
npx wrangler dev
# in another shell
curl -s localhost:8787/start            # {"id":"<id>"}
sleep 5
curl -s "localhost:8787/status?id=<id>"
```

The `wrangler dev` output logs `rollback reserve output=reservation-1`, so the rollback ran.

## Expected (a deployed Worker, same code)

```json
{"status":"errored","error":{"name":"Error","message":"NonRetryableError: charge rejected"},"output":null,"rollback":{"outcome":"complete","error":null}}
```

## Actual (`wrangler dev`)

```json
{"status":"errored","__LOCAL_DEV_STEP_OUTPUTS":["reservation-1"],"output":null,"error":{"name":"WorkflowFatalError","message":"The execution of the Workflow instance was terminated, as a step threw an NonRetryableError and it was not handled"}}
```

No `rollback` key.
