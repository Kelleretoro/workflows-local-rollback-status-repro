import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from 'cloudflare:workers'
import { NonRetryableError } from 'cloudflare:workflows'

export class ReproWorkflow extends WorkflowEntrypoint {
  async run(_event: WorkflowEvent<unknown>, step: WorkflowStep) {
    await step.do('reserve', async () => 'reservation-1', {
      rollback: async ({ output }) => {
        console.log(`rollback reserve output=${String(output)}`)
      }
    })
    await step.do('charge', async () => {
      throw new NonRetryableError('charge rejected')
    })
  }
}

export default {
  async fetch(request: Request, env: { REPRO: Workflow }) {
    const url = new URL(request.url)
    if (url.pathname === '/start') {
      const instance = await env.REPRO.create()
      return Response.json({ id: instance.id })
    }
    if (url.pathname === '/status') {
      const instance = await env.REPRO.get(url.searchParams.get('id') ?? '')
      return Response.json(await instance.status())
    }
    return new Response('GET /start, then GET /status?id=<id>')
  }
}
