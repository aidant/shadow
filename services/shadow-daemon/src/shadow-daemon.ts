console.log(String.raw`
  _____________        _________                    ________
  __  ___/__  /_______ ______  /________      __    ___  __ \_____ ____________ ________________
  _____ \__  __ \  __ '/  __  /_  __ \_ | /| / /    __  / / /  __ '/  _ \_  __ '__ \  __ \_  __ \ 
  ____/ /_  / / / /_/ // /_/ / / /_/ /_ |/ |/ /     _  /_/ // /_/ //  __/  / / / / / /_/ /  / / /
  /____/ /_/ /_/\__,_/ \__,_/  \____/____/|__/      /_____/ \__,_/ \___//_/ /_/ /_/\____//_/ /_/
`.replace(/\s+$/gm, '').replace(/\\n/gm, '\n'))

import { Application } from 'oak'
import { PORT, HOST } from './environment.ts'
import { configuration } from './endpoints/configuration.ts'
import { interfaces } from './endpoints/interfaces.ts'
import { peers } from './endpoints/peers.ts'
import { systemStop, systemStart } from './system.ts'

const app = new Application()

app.use(configuration.routes())
app.use(configuration.allowedMethods())
app.use(interfaces.routes())
app.use(interfaces.allowedMethods())
app.use(peers.routes())
app.use(peers.allowedMethods())

await systemStart()

app.listen({
  hostname: HOST,
  port: PORT,
})

await Promise.race([
  Deno.signal(Deno.Signal.SIGTERM).then(systemStop),
  Deno.signal(Deno.Signal.SIGHUP).then(systemStop),
  Deno.signal(Deno.Signal.SIGINT).then(systemStop),
])

Deno.exit()
