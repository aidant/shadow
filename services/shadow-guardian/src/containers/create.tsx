import { component } from '../utilities/component.tsx'
import { isKey } from '../utilities/is-key.ts'
import { Fragment, h } from '../utilities/jsx-runtime.ts'
import { Button } from '../components/button.tsx'
import { Input } from '../components/input.tsx'
import { createStore } from '../utilities/create-store.ts'
import { configuration, createPeer, createInterface } from '../shadow-daemon.ts'
import { download } from '../utilities/download.ts'

export const Create = component('x-create', () => {
  let type = 'peer'
  let name = ''

  const handleTypeChange = (event: Event) => {
    type = (event.target as HTMLSelectElement)?.value
    console.log(type, name)
  }

  const handleNameChange = ({ detail: newName }: CustomEvent<string>) => {
    name = newName
    console.log(type, name)
  }


  const handleCreateCtaClick = () => {
    const config = configuration.get()
    
    if (type === 'peer') {
      createPeer(config?.interfaces[0].name as string, name)
        .then(config => {
          download('vpn.conf', config)
        })
    }

    if (type === 'interface') {
      createInterface({ name, port: 51820, ipv4: '10.0.0.0/24' })
    }
  }

  return (
    <>
      <div class='x-type-selection'>
        <label class='x-input-label' for='type-selection'>Type</label>
        <select name='type' id='type-selection' on:change={handleTypeChange}>
          <option value='interface'>Interface</option>
          <option value='peer' selected>Peer</option>
        </select>
      </div>
      <Input
        className='x-create-input'
        on:change={handleNameChange}
      />
      <Button
        className='cta'
        on:submit={handleCreateCtaClick}
      >
        <img src='plus.svg' alt='Add' />
      </Button>
    </>
  )
})