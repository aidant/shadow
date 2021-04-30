console.log(String.raw`
  _____________        _________                    _________                    _____________
  __  ___/__  /_______ ______  /________      __    __  ____/___  _______ _____________  /__(_)_____ _______
  _____ \__  __ \  __ '/  __  /_  __ \_ | /| / /    _  / __ _  / / /  __ '/_  ___/  __  /__  /_  __ '/_  __ \ 
  ____/ /_  / / / /_/ // /_/ / / /_/ /_ |/ |/ /     / /_/ / / /_/ // /_/ /_  /   / /_/ / _  / / /_/ /_  / / /
  /____/ /_/ /_/\__,_/ \__,_/  \____/____/|__/      \____/  \__,_/ \__,_/ /_/    \__,_/  /_/  \__,_/ /_/ /_/
`.replace(/\s+$/gm, '').replace(/(?:\\r)?\\n/gm, '\n'))

import { h } from './utilities/jsx-runtime.ts'
import { ConnectionManager } from './containers/connection-manager.tsx'

addEventListener('load', () => {
  document.body.append(
    <ConnectionManager />
  )
})