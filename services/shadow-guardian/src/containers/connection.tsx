import { Button } from '../components/button.tsx'
import { Input } from '../components/input.tsx'
import { address } from '../shadow-daemon.ts'
import { component } from '../utilities/component.tsx'
import { h, Fragment } from '../utilities/jsx-runtime.ts'

export const Connection = component('x-connection', () => {
  let value = address.get()
  
  const handleChange = ({ detail: newValue }: CustomEvent<string>) => {
    value = newValue
  }

  const handleSubmit = () => {
    address.set(value, true)
  }

  return (
    <>
      <Input
        label='Address'
        default={value}
        on:change={handleChange}
      />
      <Button
        className='x-connection-submit'
        on:submit={handleSubmit}
      >
        Connect
      </Button>
    </>
  )
})