'use client'

import { useEffect, useMemo, useState } from 'react'

import { Heading } from '@/components/Heading'
import { Input } from '@/components/Input'
import { Label } from '@/components/Label'
import { isContainerNode } from '@/layouts/tree'
import type { LayoutNode, LayoutSlotNode } from '@/layouts/types'

import {
  createDefaultElement,
  createDefaultElementPage,
  elementStorageKey,
  mockElementLayout
} from './defaults'
import { ElementRenderer } from './ElementRenderer'
import type { ElementNode, ElementPage, ElementType } from './types'

const elementOptions: Array<{
  label: string
  type: ElementType
}> = [
  { label: 'Heading', type: 'heading' },
  { label: 'Text', type: 'text' },
  { label: 'Input', type: 'input' },
  { label: 'Button', type: 'button' }
]

function collectSlots(node: LayoutNode): LayoutSlotNode[] {
  if (node.type === 'slot') {
    return [node]
  }

  if (!isContainerNode(node)) {
    return []
  }

  return node.children.flatMap(collectSlots)
}

function findElement(page: ElementPage, id: string | undefined) {
  if (!id) {
    return undefined
  }

  return Object.values(page.slots)
    .flat()
    .find((element) => element.id === id)
}

function isElementPage(value: unknown): value is ElementPage {
  if (!value || typeof value !== 'object') {
    return false
  }

  const page = value as Partial<ElementPage>

  return (
    typeof page.id === 'string' &&
    typeof page.layoutId === 'string' &&
    typeof page.selectedSlotId === 'string' &&
    Boolean(page.slots && typeof page.slots === 'object')
  )
}

export function ElementEditor() {
  const [page, setPage] = useState<ElementPage>(() => createDefaultElementPage())
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false)

  const slots = useMemo(() => collectSlots(mockElementLayout.root), [])
  const selectedSlot = slots.find((slot) => slot.id === page.selectedSlotId) || slots[0]
  const selectedElements = page.slots[selectedSlot.id] || []
  const selectedElement = findElement(page, page.selectedElementId)

  useEffect(() => {
    const storedPage = window.localStorage.getItem(elementStorageKey)

    if (storedPage) {
      try {
        const parsed = JSON.parse(storedPage) as ElementPage
        if (isElementPage(parsed)) {
          setPage(parsed)
        } else {
          window.localStorage.removeItem(elementStorageKey)
        }
      } catch {
        window.localStorage.removeItem(elementStorageKey)
      }
    }

    setHasLoadedStorage(true)
  }, [])

  useEffect(() => {
    if (!hasLoadedStorage) {
      return
    }

    window.localStorage.setItem(elementStorageKey, JSON.stringify(page))
  }, [hasLoadedStorage, page])

  function selectSlot(slotId: string) {
    setPage((current) => ({
      ...current,
      selectedElementId: undefined,
      selectedSlotId: slotId
    }))
  }

  function addElement(type: ElementType) {
    const element = createDefaultElement(type)

    setPage((current) => ({
      ...current,
      selectedElementId: element.id,
      slots: {
        ...current.slots,
        [current.selectedSlotId]: [
          ...(current.slots[current.selectedSlotId] || []),
          element
        ]
      }
    }))
  }

  function selectElement(elementId: string) {
    setPage((current) => ({
      ...current,
      selectedElementId: elementId
    }))
  }

  function updateSelectedElement(updater: (element: ElementNode) => ElementNode) {
    if (!selectedElement) {
      return
    }

    setPage((current) => ({
      ...current,
      slots: Object.fromEntries(
        Object.entries(current.slots).map(([slotId, elements]) => [
          slotId,
          elements.map((element) =>
            element.id === selectedElement.id ? updater(element) : element
          )
        ])
      )
    }))
  }

  function removeSelectedElement() {
    if (!selectedElement) {
      return
    }

    setPage((current) => ({
      ...current,
      selectedElementId: undefined,
      slots: Object.fromEntries(
        Object.entries(current.slots).map(([slotId, elements]) => [
          slotId,
          elements.filter((element) => element.id !== selectedElement.id)
        ])
      )
    }))
  }

  function resetPage() {
    const next = createDefaultElementPage()
    window.localStorage.removeItem(elementStorageKey)
    setPage(next)
  }

  return (
    <main className="editor-shell element-editor-shell">
      <aside className="editor-panel editor-structure">
        <div className="editor-panel-header">
          <Heading level={1}>Element Editor</Heading>
          <button className="editor-secondary" onClick={resetPage} type="button">
            Reset
          </button>
        </div>

        <p className="editor-empty">Mock layout: Section with 2x2 grid.</p>

        <div className="layout-list">
          {slots.map((slot) => (
            <button
              className={
                slot.id === selectedSlot.id
                  ? 'editor-block-row selected'
                  : 'editor-block-row'
              }
              key={slot.id}
              onClick={() => selectSlot(slot.id)}
              type="button"
            >
              <span>S</span>
              <strong>{slot.props.name}</strong>
            </button>
          ))}
        </div>

        <div className="editor-array-header">
          <Heading level={3}>Add element</Heading>
        </div>
        <div className="editor-add-grid">
          {elementOptions.map((option) => (
            <button
              className="editor-secondary"
              key={option.type}
              onClick={() => addElement(option.type)}
              type="button"
            >
              + {option.label}
            </button>
          ))}
        </div>
      </aside>

      <section className="editor-preview" aria-label="Element preview">
        <div className="editor-preview-bar">
          <span>Element preview</span>
          <a href="/editor/layouts">Layout editor</a>
        </div>
        <div className="editor-preview-canvas layout-preview-canvas">
          <ElementLayoutPreview
            node={mockElementLayout.root}
            onSelectElement={selectElement}
            onSelectSlot={selectSlot}
            page={page}
          />
        </div>
      </section>

      <aside className="editor-panel editor-settings">
        <div className="editor-panel-header">
          <div>
            <p>Selected slot</p>
            <Heading>{selectedSlot.props.name}</Heading>
          </div>
        </div>

        <div className="editor-form">
          <div className="editor-array-header">
            <Heading level={3}>Elements</Heading>
          </div>
          {selectedElements.length ? (
            <div className="editor-block-list">
              {selectedElements.map((element, index) => (
                <button
                  className={
                    element.id === selectedElement?.id
                      ? 'editor-block-row selected'
                      : 'editor-block-row'
                  }
                  key={element.id}
                  onClick={() => selectElement(element.id)}
                  type="button"
                >
                  <span>{index + 1}</span>
                  <strong>{element.type}</strong>
                </button>
              ))}
            </div>
          ) : (
            <p className="editor-empty">Add an element to this slot.</p>
          )}

          {selectedElement ? (
            <ElementSettings
              element={selectedElement}
              onRemove={removeSelectedElement}
              onUpdate={updateSelectedElement}
            />
          ) : null}
        </div>
      </aside>
    </main>
  )
}

function ElementLayoutPreview({
  node,
  onSelectElement,
  onSelectSlot,
  page
}: {
  node: LayoutNode
  onSelectElement: (elementId: string) => void
  onSelectSlot: (slotId: string) => void
  page: ElementPage
}) {
  if (node.type === 'slot') {
    const elements = page.slots[node.id] || []

    return (
      <div
        className={[
          'layout-node',
          'layout-slot',
          node.id === page.selectedSlotId ? 'selected' : '',
          `slot-padding-${node.props.padding}`,
          `slot-align-${node.props.align}`,
          `slot-min-${node.props.minHeight}`,
          node.props.span ? `slot-span-${node.props.span}` : ''
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={(event) => {
          event.stopPropagation()
          onSelectSlot(node.id)
        }}
      >
        <span>{node.props.name}</span>
        <div className="element-slot-content">
          {elements.map((element) => (
            <div
              className={
                element.id === page.selectedElementId
                  ? 'element-preview selected'
                  : 'element-preview'
              }
              key={element.id}
              onClick={(event) => {
                event.stopPropagation()
                onSelectSlot(node.id)
                onSelectElement(element.id)
              }}
            >
              <ElementRenderer element={element} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const Component = node.type === 'section' ? 'section' : 'div'
  const className = [
    'layout-node',
    'layout-container',
    `layout-${node.type}`,
    node.type === 'section' ? `layout-width-${node.props.width}` : '',
    'padding' in node.props ? `layout-padding-${node.props.padding}` : '',
    'gap' in node.props ? `layout-gap-${node.props.gap}` : '',
    'align' in node.props ? `layout-align-${node.props.align}` : '',
    node.type === 'grid' ? `layout-columns-${node.props.columns}` : '',
    node.type === 'grid'
      ? `layout-mobile-columns-${node.props.mobileColumns}`
      : ''
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Component className={className}>
      {node.children.map((child) => (
        <ElementLayoutPreview
          key={child.id}
          node={child}
          onSelectElement={onSelectElement}
          onSelectSlot={onSelectSlot}
          page={page}
        />
      ))}
    </Component>
  )
}

function ElementSettings({
  element,
  onRemove,
  onUpdate
}: {
  element: ElementNode
  onRemove: () => void
  onUpdate: (updater: (element: ElementNode) => ElementNode) => void
}) {
  function updateProps(nextProps: Record<string, unknown>) {
    onUpdate((current) => ({
      ...current,
      props: {
        ...current.props,
        ...nextProps
      }
    } as ElementNode))
  }

  return (
    <div className="editor-nested">
      <div className="editor-array-header">
        <Heading level={3}>{element.type}</Heading>
        <button className="editor-danger" onClick={onRemove} type="button">
          Remove
        </button>
      </div>

      {element.type === 'heading' ? (
        <>
          <TextField
            label="Text"
            value={element.props.text}
            onChange={(value) => updateProps({ text: value })}
          />
          <SelectField
            label="Level"
            options={['1', '2', '3', '4', '5', '6']}
            value={String(element.props.level)}
            onChange={(value) => updateProps({ level: Number(value) })}
          />
        </>
      ) : null}

      {element.type === 'text' ? (
        <Label text="Text">
          <textarea
            rows={4}
            value={element.props.text}
            onChange={(event) => updateProps({ text: event.target.value })}
          />
        </Label>
      ) : null}

      {element.type === 'input' ? (
        <>
          <TextField
            label="Name"
            value={element.props.name}
            onChange={(value) => updateProps({ name: value })}
          />
          <TextField
            label="Placeholder"
            value={element.props.placeholder}
            onChange={(value) => updateProps({ placeholder: value })}
          />
        </>
      ) : null}

      {element.type === 'button' ? (
        <>
          <TextField
            label="Text"
            value={element.props.text}
            onChange={(value) => updateProps({ text: value })}
          />
          <SelectField
            label="Variant"
            options={['primary', 'secondary']}
            value={element.props.variant}
            onChange={(value) => updateProps({ variant: value })}
          />
        </>
      ) : null}
    </div>
  )
}

function TextField({
  label,
  onChange,
  value
}: {
  label: string
  onChange: (value: string) => void
  value: string
}) {
  return (
    <Label text={label}>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
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
