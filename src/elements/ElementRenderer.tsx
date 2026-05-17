import { Button } from '@/components/Button'
import { Heading } from '@/components/Heading'
import { Input } from '@/components/Input'

import type { ElementNode } from './types'

export function ElementRenderer({ element }: { element: ElementNode }) {
  if (element.type === 'heading') {
    return (
      <Heading level={element.props.level}>
        {element.props.text}
      </Heading>
    )
  }

  if (element.type === 'text') {
    return <p className="element-text">{element.props.text}</p>
  }

  if (element.type === 'input') {
    return (
      <Input
        name={element.props.name}
        placeholder={element.props.placeholder}
      />
    )
  }

  return (
    <Button variant={element.props.variant}>
      {element.props.text}
    </Button>
  )
}
