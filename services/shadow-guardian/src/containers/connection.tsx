import { Button } from '../components/button.tsx'
import { Card } from '../components/card.tsx'
import { Input } from '../components/input.tsx'
import { component } from '../utilities/component.tsx'
import { h } from '../utilities/jsx-runtime.ts'

export const Connection = component('x-connection', (instance) => {
  console.log(instance.autoconnect)
  return (
    <Card>
      <Input></Input>
      <Button>Connect</Button>
    </Card>
  )
})