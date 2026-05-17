import type {
  LayoutAttributes,
  LayoutContainerNode,
  LayoutNode,
  LayoutSlotNode
} from './types'

type LayoutRendererProps = {
  node: LayoutNode
  onSelect?: (id: string) => void
  selectedId?: string
}

function getCustomAttributes(attributes?: LayoutAttributes) {
  const customAttributes: Record<string, string> = {}

  if (!attributes) {
    return customAttributes
  }

  if (attributes.id) {
    customAttributes.id = attributes.id
  }

  Object.entries(attributes.data || {}).forEach(([key, value]) => {
    if (key) {
      customAttributes[`data-${key}`] = value
    }
  })

  Object.entries(attributes.aria || {}).forEach(([key, value]) => {
    if (key) {
      customAttributes[`aria-${key}`] = value
    }
  })

  return customAttributes
}

function getContainerClassName(node: LayoutContainerNode, selectedId?: string) {
  const classes = [
    'layout-node',
    'layout-container',
    `layout-${node.type}`,
    node.id === selectedId ? 'selected' : '',
    node.attributes?.className
  ]

  if ('padding' in node.props) {
    classes.push(`layout-padding-${node.props.padding}`)
  }

  if ('gap' in node.props) {
    classes.push(`layout-gap-${node.props.gap}`)
  }

  if ('align' in node.props) {
    classes.push(`layout-align-${node.props.align}`)
  }

  if (node.type === 'section') {
    classes.push(`layout-width-${node.props.width}`)
  }

  if (node.type === 'row') {
    classes.push(`layout-justify-${node.props.justify}`)
    classes.push(`layout-mobile-${node.props.mobile}`)
    if (node.props.wrap) {
      classes.push('layout-wrap')
    }
  }

  if (node.type === 'grid') {
    classes.push(`layout-columns-${node.props.columns}`)
    classes.push(`layout-mobile-columns-${node.props.mobileColumns}`)
  }

  return classes.filter(Boolean).join(' ')
}

function getSlotClassName(node: LayoutSlotNode, selectedId?: string) {
  return [
    'layout-node',
    'layout-slot',
    node.id === selectedId ? 'selected' : '',
    `slot-padding-${node.props.padding}`,
    `slot-align-${node.props.align}`,
    `slot-min-${node.props.minHeight}`,
    node.props.span ? `slot-span-${node.props.span}` : '',
    node.attributes?.className
  ]
    .filter(Boolean)
    .join(' ')
}

export function LayoutRenderer({
  node,
  onSelect,
  selectedId
}: LayoutRendererProps) {
  const customAttributes = getCustomAttributes(node.attributes)

  if (node.type === 'slot') {
    return (
      <div
        {...customAttributes}
        className={getSlotClassName(node, selectedId)}
        onClick={(event) => {
          event.stopPropagation()
          onSelect?.(node.id)
        }}
        role="button"
        tabIndex={0}
      >
        <span>{node.props.name}</span>
      </div>
    )
  }

  const Component = node.type === 'section' ? 'section' : 'div'

  return (
    <Component
      {...customAttributes}
      className={getContainerClassName(node, selectedId)}
      onClick={(event) => {
        event.stopPropagation()
        onSelect?.(node.id)
      }}
    >
      {node.children.length ? (
        node.children.map((child) => (
          <LayoutRenderer
            key={child.id}
            node={child}
            onSelect={onSelect}
            selectedId={selectedId}
          />
        ))
      ) : (
        <div className="layout-empty-child">Empty {node.type}</div>
      )}
    </Component>
  )
}
