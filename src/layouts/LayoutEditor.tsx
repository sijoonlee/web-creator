'use client'

import { useEffect, useMemo, useState } from 'react'

import { Heading } from '@/components/Heading'
import { Input } from '@/components/Input'
import { Label } from '@/components/Label'
import {
  createLayoutId,
  createDefaultLayout,
  createDefaultLayoutNode,
  defaultLayouts,
  layoutStorageKey
} from './defaults'
import { LayoutRenderer } from './LayoutRenderer'
import {
  cloneLayout,
  findLayoutNode,
  findParentNode,
  getFirstNodeId,
  getLayoutName,
  isContainerNode,
  refreshNodeIds,
  removeLayoutNode,
  updateLayoutNode
} from './tree'
import type {
  Align,
  Justify,
  LayoutAttributes,
  LayoutContainerNode,
  LayoutNode,
  LayoutNodeType,
  LayoutTemplate,
  Spacing
} from './types'

type LayoutEditorProps = {
  initialLayouts?: LayoutTemplate[]
}

const layoutNodeOptions: Array<{
  label: string
  type: LayoutNodeType
}> = [
  { label: 'Section', type: 'section' },
  { label: 'Stack', type: 'stack' },
  { label: 'Row', type: 'row' },
  { label: 'Grid', type: 'grid' },
  { label: 'Slot', type: 'slot' }
]

const spacingOptions: Spacing[] = ['none', 'sm', 'md', 'lg']
const alignOptions: Align[] = ['start', 'center', 'end', 'stretch']
const justifyOptions: Justify[] = ['start', 'center', 'end', 'between']

function recordToLines(record: Record<string, string> | undefined) {
  return Object.entries(record || {})
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')
}

function linesToRecord(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((record, line) => {
      const [key, ...rest] = line.split('=')
      const normalizedKey = key.trim()
      const normalizedValue = rest.join('=').trim()

      if (normalizedKey) {
        record[normalizedKey] = normalizedValue
      }

      return record
    }, {})
}

function scopeCustomCss(css: string | undefined, layoutId: string) {
  if (!css?.trim()) {
    return ''
  }

  const scope = `[data-layout-template-id="${layoutId}"]`

  return css
    .split('}')
    .map((block) => {
      const [selectorPart, bodyPart] = block.split('{')

      if (!selectorPart || !bodyPart) {
        return ''
      }

      const selector = selectorPart.trim()
      const body = bodyPart.trim()

      if (!selector || !body || selector.startsWith('@')) {
        return ''
      }

      const scopedSelector = selector
        .split(',')
        .map((part) => {
          const trimmed = part.trim()
          return trimmed.includes(':scope')
            ? trimmed.replaceAll(':scope', scope)
            : `${scope} ${trimmed}`
        })
        .join(', ')

      return `${scopedSelector} { ${body} }`
    })
    .filter(Boolean)
    .join('\n')
}

function getNodeLabel(node: LayoutNode) {
  if (node.type === 'slot') {
    return node.props.name || 'Slot'
  }

  return node.type[0].toUpperCase() + node.type.slice(1)
}

function isLayoutNode(value: unknown): value is LayoutNode {
  if (!value || typeof value !== 'object') {
    return false
  }

  const node = value as Partial<LayoutNode>

  if (typeof node.id !== 'string' || typeof node.type !== 'string') {
    return false
  }

  if (!['section', 'stack', 'row', 'grid', 'slot'].includes(node.type)) {
    return false
  }

  if (node.type === 'slot') {
    return Boolean(node.props && typeof node.props === 'object')
  }

  return Array.isArray((node as Partial<LayoutContainerNode>).children)
}

function isLayoutTemplate(value: unknown): value is LayoutTemplate {
  if (!value || typeof value !== 'object') {
    return false
  }

  const layout = value as Partial<LayoutTemplate>

  return (
    typeof layout.id === 'string' &&
    typeof layout.name === 'string' &&
    isLayoutNode(layout.root)
  )
}

function getInitialSelection(layouts: LayoutTemplate[]) {
  const firstLayout = layouts[0]

  return {
    layoutId: firstLayout?.id,
    nodeId: firstLayout ? getFirstNodeId(firstLayout.root) : undefined
  }
}

export function LayoutEditor({
  initialLayouts = defaultLayouts
}: LayoutEditorProps) {
  const initialSelection = getInitialSelection(initialLayouts)
  const [layouts, setLayouts] = useState<LayoutTemplate[]>(() =>
    cloneLayout(initialLayouts)
  )
  const [selectedLayoutId, setSelectedLayoutId] = useState(
    initialSelection.layoutId
  )
  const [selectedNodeId, setSelectedNodeId] = useState(initialSelection.nodeId)
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false)

  const selectedLayout = useMemo(
    () => layouts.find((layout) => layout.id === selectedLayoutId) || layouts[0],
    [layouts, selectedLayoutId]
  )
  const selectedNode = selectedLayout && selectedNodeId
    ? findLayoutNode(selectedLayout.root, selectedNodeId)
    : undefined
  const selectedParent = selectedLayout && selectedNodeId
    ? findParentNode(selectedLayout.root, selectedNodeId)
    : undefined
  const selectedIndex = selectedParent
    ? selectedParent.children.findIndex((node) => node.id === selectedNodeId)
    : -1

  useEffect(() => {
    const storedLayouts = window.localStorage.getItem(layoutStorageKey)

    if (storedLayouts) {
      try {
        const parsed = JSON.parse(storedLayouts) as LayoutTemplate[]
        if (
          Array.isArray(parsed) &&
          parsed.length > 0 &&
          parsed.every(isLayoutTemplate)
        ) {
          setLayouts(parsed)
          setSelectedLayoutId(parsed[0].id)
          setSelectedNodeId(parsed[0].root.id)
        } else {
          window.localStorage.removeItem(layoutStorageKey)
        }
      } catch {
        window.localStorage.removeItem(layoutStorageKey)
      }
    }

    setHasLoadedStorage(true)
  }, [])

  useEffect(() => {
    if (!hasLoadedStorage) {
      return
    }

    window.localStorage.setItem(layoutStorageKey, JSON.stringify(layouts))
  }, [hasLoadedStorage, layouts])

  function updateSelectedLayout(updater: (layout: LayoutTemplate) => LayoutTemplate) {
    if (!selectedLayout) {
      return
    }

    setLayouts((current) =>
      current.map((layout) =>
        layout.id === selectedLayout.id ? updater(layout) : layout
      )
    )
  }

  function updateSelectedNode(updater: (node: LayoutNode) => LayoutNode) {
    if (!selectedLayout || !selectedNodeId) {
      return
    }

    updateSelectedLayout((layout) => ({
      ...layout,
      root: updateLayoutNode(layout.root, selectedNodeId, updater)
    }))
  }

  function createLayout() {
    const defaultLayout = createDefaultLayout()
    const layout: LayoutTemplate = {
      ...defaultLayout,
      id: createLayoutId('layout'),
      name: getLayoutName(layouts, `Layout ${layouts.length + 1}`),
      root: refreshNodeIds(defaultLayout.root)
    }

    setLayouts((current) => [...current, layout])
    setSelectedLayoutId(layout.id)
    setSelectedNodeId(layout.root.id)
  }

  function duplicateLayout() {
    if (!selectedLayout) {
      return
    }

    const duplicate: LayoutTemplate = {
      ...cloneLayout(selectedLayout),
      id: createLayoutId('layout'),
      name: `${selectedLayout.name} copy`,
      root: refreshNodeIds(selectedLayout.root)
    }

    setLayouts((current) => [...current, duplicate])
    setSelectedLayoutId(duplicate.id)
    setSelectedNodeId(duplicate.root.id)
  }

  function deleteLayout() {
    if (!selectedLayout || layouts.length <= 1) {
      return
    }

    const next = layouts.filter((layout) => layout.id !== selectedLayout.id)
    setLayouts(next)
    setSelectedLayoutId(next[0].id)
    setSelectedNodeId(next[0].root.id)
  }

  function resetLayouts() {
    const next = cloneLayout(initialLayouts)
    window.localStorage.removeItem(layoutStorageKey)
    setLayouts(next)
    setSelectedLayoutId(next[0]?.id)
    setSelectedNodeId(next[0]?.root.id)
  }

  function addChild(type: LayoutNodeType) {
    if (!selectedNode || !isContainerNode(selectedNode)) {
      return
    }

    const child = createDefaultLayoutNode(type)

    updateSelectedNode((node) =>
      isContainerNode(node)
        ? {
            ...node,
            children: [...node.children, child]
          }
        : node
    )
    setSelectedNodeId(child.id)
  }

  function moveSelected(direction: -1 | 1) {
    if (!selectedLayout || !selectedParent || selectedIndex < 0) {
      return
    }

    const nextIndex = selectedIndex + direction

    if (nextIndex < 0 || nextIndex >= selectedParent.children.length) {
      return
    }

    updateSelectedLayout((layout) => ({
      ...layout,
      root: updateLayoutNode(layout.root, selectedParent.id, (node) => {
        if (!isContainerNode(node)) {
          return node
        }

        const children = [...node.children]
        const [selected] = children.splice(selectedIndex, 1)
        children.splice(nextIndex, 0, selected)

        return {
          ...node,
          children
        }
      })
    }))
  }

  function duplicateSelectedNode() {
    if (!selectedLayout || !selectedParent || !selectedNode) {
      return
    }

    const duplicate = refreshNodeIds(selectedNode)

    updateSelectedLayout((layout) => ({
      ...layout,
      root: updateLayoutNode(layout.root, selectedParent.id, (node) =>
        isContainerNode(node)
          ? {
              ...node,
              children: [
                ...node.children.slice(0, selectedIndex + 1),
                duplicate,
                ...node.children.slice(selectedIndex + 1)
              ]
            }
          : node
      )
    }))
    setSelectedNodeId(duplicate.id)
  }

  function deleteSelectedNode() {
    if (!selectedLayout || !selectedNodeId || selectedNodeId === selectedLayout.root.id) {
      return
    }

    const result = removeLayoutNode(selectedLayout.root, selectedNodeId)
    if (!result.removed) {
      return
    }

    updateSelectedLayout((layout) => ({
      ...layout,
      root: result.next
    }))
    setSelectedNodeId(selectedParent?.id || selectedLayout.root.id)
  }

  return (
    <main className="editor-shell layout-editor-shell">
      <aside className="editor-panel editor-structure">
        <div className="editor-panel-header">
          <Heading level={1}>Layout Editor</Heading>
          <button className="editor-secondary" onClick={resetLayouts} type="button">
            Reset
          </button>
        </div>

        <div className="layout-list">
          {layouts.map((layout) => (
            <button
              className={
                layout.id === selectedLayout?.id
                  ? 'editor-block-row selected'
                  : 'editor-block-row'
              }
              key={layout.id}
              onClick={() => {
                setSelectedLayoutId(layout.id)
                setSelectedNodeId(layout.root.id)
              }}
              type="button"
            >
              <span>L</span>
              <strong>{layout.name}</strong>
            </button>
          ))}
        </div>

        <div className="editor-actions layout-actions">
          <button className="editor-secondary" onClick={createLayout} type="button">
            New
          </button>
          <button
            className="editor-secondary"
            onClick={duplicateLayout}
            type="button"
          >
            Copy
          </button>
          <button
            className="editor-danger"
            disabled={layouts.length <= 1}
            onClick={deleteLayout}
            type="button"
          >
            Delete
          </button>
        </div>

        {selectedLayout ? (
          <>
            <div className="editor-array-header">
              <Heading level={3}>Tree</Heading>
            </div>
            <LayoutTree
              node={selectedLayout.root}
              onSelect={setSelectedNodeId}
              selectedId={selectedNodeId}
            />
          </>
        ) : null}
      </aside>

      <section className="editor-preview" aria-label="Layout preview">
        <div className="editor-preview-bar">
          <span>Layout preview</span>
          <a href="/editor">Content editor</a>
        </div>
        <div
          className="editor-preview-canvas layout-preview-canvas"
          data-layout-template-id={selectedLayout?.id}
        >
          {selectedLayout ? (
            <>
              <style>{scopeCustomCss(selectedLayout.customCss, selectedLayout.id)}</style>
              <LayoutRenderer
                node={selectedLayout.root}
                onSelect={setSelectedNodeId}
                selectedId={selectedNodeId}
              />
            </>
          ) : null}
        </div>
      </section>

      <aside className="editor-panel editor-settings">
        {selectedLayout ? (
          <LayoutSettings
            addChild={addChild}
            deleteSelectedNode={deleteSelectedNode}
            duplicateSelectedNode={duplicateSelectedNode}
            moveSelected={moveSelected}
            selectedIndex={selectedIndex}
            selectedLayout={selectedLayout}
            selectedNode={selectedNode}
            selectedParent={selectedParent}
            updateLayout={updateSelectedLayout}
            updateNode={updateSelectedNode}
          />
        ) : null}
      </aside>
    </main>
  )
}

function LayoutTree({
  depth = 0,
  node,
  onSelect,
  selectedId
}: {
  depth?: number
  node: LayoutNode
  onSelect: (id: string) => void
  selectedId?: string
}) {
  return (
    <div className="layout-tree-node">
      <button
        className={
          node.id === selectedId ? 'layout-tree-row selected' : 'layout-tree-row'
        }
        onClick={() => onSelect(node.id)}
        style={{ paddingLeft: 10 + depth * 14 }}
        type="button"
      >
        <span>{node.type}</span>
        <strong>{getNodeLabel(node)}</strong>
      </button>
      {isContainerNode(node)
        ? node.children.map((child) => (
            <LayoutTree
              depth={depth + 1}
              key={child.id}
              node={child}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))
        : null}
    </div>
  )
}

function LayoutSettings({
  addChild,
  deleteSelectedNode,
  duplicateSelectedNode,
  moveSelected,
  selectedIndex,
  selectedLayout,
  selectedNode,
  selectedParent,
  updateLayout,
  updateNode
}: {
  addChild: (type: LayoutNodeType) => void
  deleteSelectedNode: () => void
  duplicateSelectedNode: () => void
  moveSelected: (direction: -1 | 1) => void
  selectedIndex: number
  selectedLayout: LayoutTemplate
  selectedNode?: LayoutNode
  selectedParent?: LayoutContainerNode
  updateLayout: (updater: (layout: LayoutTemplate) => LayoutTemplate) => void
  updateNode: (updater: (node: LayoutNode) => LayoutNode) => void
}) {
  const canEditTree = Boolean(selectedNode)
  const isRoot = selectedNode?.id === selectedLayout.root.id
  const canHaveChildren = isContainerNode(selectedNode)

  return (
    <>
      <div className="editor-panel-header">
        <div>
          <p>Selected layout</p>
          <Heading>{selectedLayout.name}</Heading>
        </div>
      </div>

      <div className="editor-form">
        <TextField
          label="Layout name"
          value={selectedLayout.name}
          onChange={(value) =>
            updateLayout((layout) => ({
              ...layout,
              name: value
            }))
          }
        />
        <Label text="Scoped custom CSS">
          <textarea
            rows={6}
            value={selectedLayout.customCss || ''}
            onChange={(event) =>
              updateLayout((layout) => ({
                ...layout,
                customCss: event.target.value
              }))
            }
          />
        </Label>
      </div>

      {selectedNode ? (
        <>
          <div className="editor-array-header">
            <Heading level={3}>{getNodeLabel(selectedNode)}</Heading>
          </div>

          <div className="editor-actions">
            <button
              className="editor-secondary"
              disabled={!selectedParent || selectedIndex <= 0}
              onClick={() => moveSelected(-1)}
              type="button"
            >
              Up
            </button>
            <button
              className="editor-secondary"
              disabled={
                !selectedParent || selectedIndex >= selectedParent.children.length - 1
              }
              onClick={() => moveSelected(1)}
              type="button"
            >
              Down
            </button>
            <button
              className="editor-danger"
              disabled={isRoot}
              onClick={deleteSelectedNode}
              type="button"
            >
              Delete
            </button>
          </div>

          <button
            className="editor-secondary layout-wide-action"
            disabled={isRoot}
            onClick={duplicateSelectedNode}
            type="button"
          >
            Duplicate selected node
          </button>

          {canHaveChildren ? (
            <div className="editor-add-grid layout-node-add-grid">
              {layoutNodeOptions.map((option) => (
                <button
                  className="editor-secondary"
                  key={option.type}
                  onClick={() => addChild(option.type)}
                  type="button"
                >
                  + {option.label}
                </button>
              ))}
            </div>
          ) : null}

          {canEditTree ? (
            <NodeSettings
              node={selectedNode}
              parent={selectedParent}
              updateNode={updateNode}
            />
          ) : null}
        </>
      ) : (
        <p className="editor-empty">Select a layout node to edit it.</p>
      )}
    </>
  )
}

function NodeSettings({
  node,
  parent,
  updateNode
}: {
  node: LayoutNode
  parent?: LayoutContainerNode
  updateNode: (updater: (node: LayoutNode) => LayoutNode) => void
}) {
  return (
    <div className="editor-form layout-node-settings">
      <TextField label="Internal ID" readOnly value={node.id} />
      {node.type === 'slot' ? (
        <TextField
          label="Slot name"
          value={node.props.name}
          onChange={(value) =>
            updateNode((current) =>
              current.type === 'slot'
                ? {
                    ...current,
                    props: {
                      ...current.props,
                      name: value
                    }
                  }
                : current
            )
          }
        />
      ) : null}

      <NodePropFields node={node} parent={parent} updateNode={updateNode} />
      <AttributeFields node={node} updateNode={updateNode} />
    </div>
  )
}

function NodePropFields({
  node,
  parent,
  updateNode
}: {
  node: LayoutNode
  parent?: LayoutContainerNode
  updateNode: (updater: (node: LayoutNode) => LayoutNode) => void
}) {
  function updateProps(nextProps: Record<string, unknown>) {
    updateNode((current) => ({
      ...current,
      props: {
        ...current.props,
        ...nextProps
      }
    } as LayoutNode))
  }

  if (node.type === 'section') {
    return (
      <>
        <SelectField
          label="Width"
          options={['medium', 'wide', 'full']}
          value={node.props.width}
          onChange={(value) => updateProps({ width: value })}
        />
        <SpacingField
          label="Padding"
          value={node.props.padding}
          onChange={(value) => updateProps({ padding: value })}
        />
        <AlignField
          value={node.props.align}
          onChange={(value) => updateProps({ align: value })}
        />
      </>
    )
  }

  if (node.type === 'stack') {
    return (
      <>
        <SpacingField
          label="Padding"
          value={node.props.padding}
          onChange={(value) => updateProps({ padding: value })}
        />
        <SpacingField
          label="Gap"
          value={node.props.gap}
          onChange={(value) => updateProps({ gap: value })}
        />
        <AlignField
          value={node.props.align}
          onChange={(value) => updateProps({ align: value })}
        />
      </>
    )
  }

  if (node.type === 'row') {
    return (
      <>
        <SpacingField
          label="Padding"
          value={node.props.padding}
          onChange={(value) => updateProps({ padding: value })}
        />
        <SpacingField
          label="Gap"
          value={node.props.gap}
          onChange={(value) => updateProps({ gap: value })}
        />
        <AlignField
          value={node.props.align}
          onChange={(value) => updateProps({ align: value })}
        />
        <SelectField
          label="Justify"
          options={justifyOptions}
          value={node.props.justify}
          onChange={(value) => updateProps({ justify: value })}
        />
        <SelectField
          label="Mobile"
          options={['stack', 'wrap', 'scroll']}
          value={node.props.mobile}
          onChange={(value) => updateProps({ mobile: value })}
        />
        <Label text="Wrap">
          <input
            checked={node.props.wrap}
            onChange={(event) => updateProps({ wrap: event.target.checked })}
            type="checkbox"
          />
        </Label>
      </>
    )
  }

  if (node.type === 'grid') {
    return (
      <>
        <SpacingField
          label="Padding"
          value={node.props.padding}
          onChange={(value) => updateProps({ padding: value })}
        />
        <SpacingField
          label="Gap"
          value={node.props.gap}
          onChange={(value) => updateProps({ gap: value })}
        />
        <AlignField
          value={node.props.align}
          onChange={(value) => updateProps({ align: value })}
        />
        <SelectField
          label="Columns"
          options={['2', '3', '4', '6', '12']}
          value={String(node.props.columns)}
          onChange={(value) => updateProps({ columns: Number(value) })}
        />
        <SelectField
          label="Mobile columns"
          options={['1', '2']}
          value={String(node.props.mobileColumns)}
          onChange={(value) => updateProps({ mobileColumns: Number(value) })}
        />
      </>
    )
  }

  return (
    <>
      <SpacingField
        label="Padding"
        value={node.props.padding}
        onChange={(value) => updateProps({ padding: value })}
      />
      <AlignField
        value={node.props.align}
        onChange={(value) => updateProps({ align: value })}
      />
      <SelectField
        label="Min height"
        options={['none', 'sm', 'md', 'lg']}
        value={node.props.minHeight}
        onChange={(value) => updateProps({ minHeight: value })}
      />
      {parent?.type === 'grid' ? (
        <SelectField
          label="Span"
          options={['1', '2', '3', '4', '6', '8', '12']}
          value={String(node.props.span || 1)}
          onChange={(value) => updateProps({ span: Number(value) })}
        />
      ) : null}
    </>
  )
}

function AttributeFields({
  node,
  updateNode
}: {
  node: LayoutNode
  updateNode: (updater: (node: LayoutNode) => LayoutNode) => void
}) {
  function updateAttributes(nextAttributes: LayoutAttributes) {
    updateNode((current) => ({
      ...current,
      attributes: nextAttributes
    }))
  }

  const attributes = node.attributes || {}

  return (
    <div className="editor-nested">
      <Heading level={3}>Advanced attributes</Heading>
      <TextField
        label="DOM ID"
        value={attributes.id || ''}
        onChange={(value) =>
          updateAttributes({
            ...attributes,
            id: value || undefined
          })
        }
      />
      <TextField
        label="Class name"
        value={attributes.className || ''}
        onChange={(value) =>
          updateAttributes({
            ...attributes,
            className: value || undefined
          })
        }
      />
      <Label text="Data attributes">
        <textarea
          rows={3}
          value={recordToLines(attributes.data)}
          onChange={(event) =>
            updateAttributes({
              ...attributes,
              data: linesToRecord(event.target.value)
            })
          }
        />
      </Label>
      <Label text="ARIA attributes">
        <textarea
          rows={3}
          value={recordToLines(attributes.aria)}
          onChange={(event) =>
            updateAttributes({
              ...attributes,
              aria: linesToRecord(event.target.value)
            })
          }
        />
      </Label>
    </div>
  )
}

function TextField({
  label,
  onChange,
  readOnly,
  value
}: {
  label: string
  onChange?: (value: string) => void
  readOnly?: boolean
  value: unknown
}) {
  return (
    <Label text={label}>
      <Input
        readOnly={readOnly}
        value={String(value || '')}
        onChange={(event) => onChange?.(event.target.value)}
      />
    </Label>
  )
}

function SelectField({
  label,
  onChange,
  options,
  value
}: {
  label: string
  onChange: (value: string) => void
  options: string[]
  value: string
}) {
  return (
    <Label text={label}>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </Label>
  )
}

function SpacingField({
  label,
  onChange,
  value
}: {
  label: string
  onChange: (value: Spacing) => void
  value: Spacing
}) {
  return (
    <SelectField
      label={label}
      options={spacingOptions}
      value={value}
      onChange={(nextValue) => onChange(nextValue as Spacing)}
    />
  )
}

function AlignField({
  onChange,
  value
}: {
  onChange: (value: Align) => void
  value: Align
}) {
  return (
    <SelectField
      label="Align"
      options={alignOptions}
      value={value}
      onChange={(nextValue) => onChange(nextValue as Align)}
    />
  )
}
