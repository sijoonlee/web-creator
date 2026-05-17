'use client'

import { useEffect, useMemo, useState } from 'react'

import { createDefaultElement } from '@/elements/defaults'
import { ElementRenderer } from '@/elements/ElementRenderer'
import type { ElementNode, ElementType } from '@/elements/types'
import { Heading } from '@/components/Heading'
import { Input } from '@/components/Input'
import { Label } from '@/components/Label'
import {
  cloneLayout,
  findLayoutNode,
  isContainerNode,
  updateLayoutNode
} from '@/layouts/tree'
import { layoutStorageKey } from '@/layouts/defaults'
import type {
  Align,
  LayoutNode,
  LayoutSlotNode,
  LayoutTemplate,
  Spacing
} from '@/layouts/types'

import {
  builtInPageLayouts,
  createDefaultPageDocument,
  createPageFromLayout,
  pageStorageKey
} from './defaults'
import { collectSlotsFromLayout, getLayoutNodeLabel } from './layoutUtils'
import type { PageDocument } from './types'

const elementOptions: Array<{ label: string; type: ElementType }> = [
  { label: 'Heading', type: 'heading' },
  { label: 'Text', type: 'text' },
  { label: 'Input', type: 'input' },
  { label: 'Button', type: 'button' }
]

const spacingOptions: Spacing[] = ['none', 'sm', 'md', 'lg']
const alignOptions: Align[] = ['start', 'center', 'end', 'stretch']

function isPageDocument(value: unknown): value is PageDocument {
  if (!value || typeof value !== 'object') {
    return false
  }

  const page = value as Partial<PageDocument>

  return (
    typeof page.id === 'string' &&
    typeof page.name === 'string' &&
    typeof page.slug === 'string' &&
    Boolean(page.layout && typeof page.layout === 'object') &&
    Boolean(page.slots && typeof page.slots === 'object')
  )
}

function findElement(page: PageDocument, id: string | undefined) {
  if (!id) {
    return undefined
  }

  return Object.values(page.slots)
    .flat()
    .find((element) => element.id === id)
}

function getElementLabel(element: ElementNode) {
  if (element.type === 'heading' || element.type === 'text') {
    return element.props.text || element.type
  }

  if (element.type === 'button') {
    return element.props.text || 'button'
  }

  return element.props.placeholder || 'input'
}

export function PageEditor() {
  const [availableLayouts, setAvailableLayouts] = useState<LayoutTemplate[]>(
    builtInPageLayouts
  )
  const [pages, setPages] = useState<PageDocument[]>(() => [
    createDefaultPageDocument()
  ])
  const [selectedPageId, setSelectedPageId] = useState(pages[0]?.id)
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false)

  const selectedPage = useMemo(
    () => pages.find((page) => page.id === selectedPageId) || pages[0],
    [pages, selectedPageId]
  )
  const slots = useMemo(
    () => (selectedPage ? collectSlotsFromLayout(selectedPage.layout.root) : []),
    [selectedPage]
  )
  const selectedNode = selectedPage
    ? findLayoutNode(selectedPage.layout.root, selectedPage.selectedNodeId)
    : undefined
  const selectedSlot = selectedPage
    ? slots.find((slot) => slot.id === selectedPage.selectedSlotId) || slots[0]
    : undefined
  const selectedElement = selectedPage
    ? findElement(selectedPage, selectedPage.selectedElementId)
    : undefined
  const selectedSlotElements =
    selectedPage && selectedSlot ? selectedPage.slots[selectedSlot.id] || [] : []

  useEffect(() => {
    const storedLayouts = window.localStorage.getItem(layoutStorageKey)
    if (storedLayouts) {
      try {
        const parsed = JSON.parse(storedLayouts) as LayoutTemplate[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAvailableLayouts([...builtInPageLayouts, ...parsed])
        }
      } catch {
        window.localStorage.removeItem(layoutStorageKey)
      }
    }

    const storedPages = window.localStorage.getItem(pageStorageKey)
    if (storedPages) {
      try {
        const parsed = JSON.parse(storedPages) as PageDocument[]
        if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(isPageDocument)) {
          setPages(parsed)
          setSelectedPageId(parsed[0].id)
        } else {
          window.localStorage.removeItem(pageStorageKey)
        }
      } catch {
        window.localStorage.removeItem(pageStorageKey)
      }
    }

    setHasLoadedStorage(true)
  }, [])

  useEffect(() => {
    if (!hasLoadedStorage) {
      return
    }

    window.localStorage.setItem(pageStorageKey, JSON.stringify(pages))
  }, [hasLoadedStorage, pages])

  function updateSelectedPage(updater: (page: PageDocument) => PageDocument) {
    if (!selectedPage) {
      return
    }

    setPages((current) =>
      current.map((page) => (page.id === selectedPage.id ? updater(page) : page))
    )
  }

  function createPage() {
    const page = createPageFromLayout(availableLayouts[0], pages.length + 1)
    setPages((current) => [...current, page])
    setSelectedPageId(page.id)
  }

  function duplicatePage() {
    if (!selectedPage) {
      return
    }

    const duplicate: PageDocument = {
      ...cloneLayout(selectedPage),
      id: `page-copy-${Date.now().toString(36)}`,
      name: `${selectedPage.name} copy`,
      slug: `${selectedPage.slug}-copy`
    }

    setPages((current) => [...current, duplicate])
    setSelectedPageId(duplicate.id)
  }

  function deletePage() {
    if (!selectedPage || pages.length <= 1) {
      return
    }

    const next = pages.filter((page) => page.id !== selectedPage.id)
    setPages(next)
    setSelectedPageId(next[0].id)
  }

  function resetPages() {
    const next = [createDefaultPageDocument()]
    window.localStorage.removeItem(pageStorageKey)
    setPages(next)
    setSelectedPageId(next[0].id)
  }

  function chooseLayout(layoutId: string) {
    const layout = availableLayouts.find((item) => item.id === layoutId)
    if (!layout) {
      return
    }

    const pageFromLayout = createPageFromLayout(layout, pages.length)
    updateSelectedPage((page) => ({
      ...page,
      layout: pageFromLayout.layout,
      selectedElementId: undefined,
      selectedNodeId: pageFromLayout.selectedNodeId,
      selectedSlotId: pageFromLayout.selectedSlotId,
      slots: pageFromLayout.slots
    }))
  }

  function selectLayoutNode(node: LayoutNode) {
    updateSelectedPage((page) => ({
      ...page,
      selectedElementId: undefined,
      selectedNodeId: node.id,
      selectedSlotId: node.type === 'slot' ? node.id : page.selectedSlotId
    }))
  }

  function addElement(type: ElementType) {
    if (!selectedPage || !selectedSlot) {
      return
    }

    const element = createDefaultElement(type)

    updateSelectedPage((page) => ({
      ...page,
      selectedElementId: element.id,
      slots: {
        ...page.slots,
        [selectedSlot.id]: [...(page.slots[selectedSlot.id] || []), element]
      }
    }))
  }

  function updateSelectedElement(updater: (element: ElementNode) => ElementNode) {
    if (!selectedElement) {
      return
    }

    updateSelectedPage((page) => ({
      ...page,
      slots: Object.fromEntries(
        Object.entries(page.slots).map(([slotId, elements]) => [
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

    updateSelectedPage((page) => ({
      ...page,
      selectedElementId: undefined,
      slots: Object.fromEntries(
        Object.entries(page.slots).map(([slotId, elements]) => [
          slotId,
          elements.filter((element) => element.id !== selectedElement.id)
        ])
      )
    }))
  }

  function updateSelectedLayoutNode(updater: (node: LayoutNode) => LayoutNode) {
    if (!selectedNode) {
      return
    }

    updateSelectedPage((page) => ({
      ...page,
      layout: {
        ...page.layout,
        root: updateLayoutNode(page.layout.root, selectedNode.id, updater)
      }
    }))
  }

  if (!selectedPage || !selectedSlot) {
    return null
  }

  return (
    <main className="editor-shell page-editor-shell">
      <aside className="editor-panel editor-structure">
        <div className="editor-panel-header">
          <Heading level={1}>Page Editor</Heading>
          <button className="editor-secondary" onClick={resetPages} type="button">
            Reset
          </button>
        </div>

        <div className="layout-list">
          {pages.map((page) => (
            <button
              className={
                page.id === selectedPage.id
                  ? 'editor-block-row selected'
                  : 'editor-block-row'
              }
              key={page.id}
              onClick={() => setSelectedPageId(page.id)}
              type="button"
            >
              <span>P</span>
              <strong>{page.name}</strong>
            </button>
          ))}
        </div>

        <div className="editor-actions layout-actions">
          <button className="editor-secondary" onClick={createPage} type="button">
            New
          </button>
          <button className="editor-secondary" onClick={duplicatePage} type="button">
            Copy
          </button>
          <button
            className="editor-danger"
            disabled={pages.length <= 1}
            onClick={deletePage}
            type="button"
          >
            Delete
          </button>
        </div>

        <div className="editor-array-header">
          <Heading level={3}>Layout Nodes</Heading>
        </div>
        <PageLayoutTree
          node={selectedPage.layout.root}
          onSelect={selectLayoutNode}
          selectedId={selectedPage.selectedNodeId}
        />
      </aside>

      <section className="editor-preview" aria-label="Page preview">
        <div className="editor-preview-bar">
          <span>Page preview</span>
          <a href="/editor/layouts">Layout editor</a>
        </div>
        <div className="editor-preview-canvas layout-preview-canvas">
          <PageLayoutPreview
            node={selectedPage.layout.root}
            onSelectElement={(elementId) =>
              updateSelectedPage((page) => ({
                ...page,
                selectedElementId: elementId
              }))
            }
            onSelectNode={selectLayoutNode}
            page={selectedPage}
          />
        </div>
      </section>

      <aside className="editor-panel editor-settings">
        <PageSettings
          availableLayouts={availableLayouts}
          onChooseLayout={chooseLayout}
          page={selectedPage}
          updatePage={updateSelectedPage}
        />

        <div className="editor-array-header">
          <Heading level={3}>
            {selectedNode ? getLayoutNodeLabel(selectedNode) : 'Layout node'}
          </Heading>
        </div>
        {selectedNode ? (
          <LayoutNodeSettings
            node={selectedNode}
            updateNode={updateSelectedLayoutNode}
          />
        ) : null}

        <div className="editor-array-header">
          <Heading level={3}>{selectedSlot.props.name} elements</Heading>
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

        {selectedSlotElements.length ? (
          <div className="editor-block-list">
            {selectedSlotElements.map((element, index) => (
              <button
                className={
                  element.id === selectedElement?.id
                    ? 'editor-block-row selected'
                    : 'editor-block-row'
                }
                key={element.id}
                onClick={() =>
                  updateSelectedPage((page) => ({
                    ...page,
                    selectedElementId: element.id
                  }))
                }
                type="button"
              >
                <span>{index + 1}</span>
                <strong>{getElementLabel(element)}</strong>
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
      </aside>
    </main>
  )
}

function PageLayoutTree({
  depth = 0,
  node,
  onSelect,
  selectedId
}: {
  depth?: number
  node: LayoutNode
  onSelect: (node: LayoutNode) => void
  selectedId: string
}) {
  return (
    <div className="layout-tree-node">
      <button
        className={
          node.id === selectedId ? 'layout-tree-row selected' : 'layout-tree-row'
        }
        onClick={() => onSelect(node)}
        style={{ paddingLeft: 10 + depth * 14 }}
        type="button"
      >
        <span>{node.type}</span>
        <strong>{getLayoutNodeLabel(node)}</strong>
      </button>
      {isContainerNode(node)
        ? node.children.map((child) => (
            <PageLayoutTree
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

function PageLayoutPreview({
  node,
  onSelectElement,
  onSelectNode,
  page
}: {
  node: LayoutNode
  onSelectElement: (elementId: string) => void
  onSelectNode: (node: LayoutNode) => void
  page: PageDocument
}) {
  if (node.type === 'slot') {
    const elements = page.slots[node.id] || []

    return (
      <div
        className={[
          'layout-node',
          'layout-slot',
          node.id === page.selectedNodeId ? 'selected' : '',
          `slot-padding-${node.props.padding}`,
          `slot-align-${node.props.align}`,
          `slot-min-${node.props.minHeight}`,
          node.props.span ? `slot-span-${node.props.span}` : ''
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={(event) => {
          event.stopPropagation()
          onSelectNode(node)
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
                onSelectNode(node)
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
    node.id === page.selectedNodeId ? 'selected' : '',
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
    <Component
      className={className}
      onClick={(event) => {
        event.stopPropagation()
        onSelectNode(node)
      }}
    >
      {node.children.map((child) => (
        <PageLayoutPreview
          key={child.id}
          node={child}
          onSelectElement={onSelectElement}
          onSelectNode={onSelectNode}
          page={page}
        />
      ))}
    </Component>
  )
}

function PageSettings({
  availableLayouts,
  onChooseLayout,
  page,
  updatePage
}: {
  availableLayouts: LayoutTemplate[]
  onChooseLayout: (layoutId: string) => void
  page: PageDocument
  updatePage: (updater: (page: PageDocument) => PageDocument) => void
}) {
  return (
    <div className="editor-form">
      <div className="editor-panel-header">
        <div>
          <p>Selected page</p>
          <Heading>{page.name}</Heading>
        </div>
      </div>
      <TextField
        label="Page name"
        value={page.name}
        onChange={(value) =>
          updatePage((current) => ({
            ...current,
            name: value
          }))
        }
      />
      <TextField
        label="Slug"
        value={page.slug}
        onChange={(value) =>
          updatePage((current) => ({
            ...current,
            slug: value
          }))
        }
      />
      <SelectField
        label="Layout"
        options={availableLayouts.map((layout) => ({
          label: layout.name,
          value: layout.id
        }))}
        value={page.layout.id.replace(/-snapshot-.+$/, '')}
        onChange={onChooseLayout}
      />
    </div>
  )
}

function LayoutNodeSettings({
  node,
  updateNode
}: {
  node: LayoutNode
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

  return (
    <div className="editor-form">
      {'padding' in node.props ? (
        <SpacingField
          label="Padding"
          value={node.props.padding}
          onChange={(value) => updateProps({ padding: value })}
        />
      ) : null}
      {'gap' in node.props ? (
        <SpacingField
          label="Gap"
          value={node.props.gap}
          onChange={(value) => updateProps({ gap: value })}
        />
      ) : null}
      {'align' in node.props ? (
        <AlignField
          value={node.props.align}
          onChange={(value) => updateProps({ align: value })}
        />
      ) : null}
      {node.type === 'section' ? (
        <SelectField
          label="Width"
          options={[
            { label: 'medium', value: 'medium' },
            { label: 'wide', value: 'wide' },
            { label: 'full', value: 'full' }
          ]}
          value={node.props.width}
          onChange={(value) => updateProps({ width: value })}
        />
      ) : null}
      {node.type === 'grid' ? (
        <>
          <SelectField
            label="Columns"
            options={['2', '3', '4', '6', '12'].map((value) => ({
              label: value,
              value
            }))}
            value={String(node.props.columns)}
            onChange={(value) => updateProps({ columns: Number(value) })}
          />
          <SelectField
            label="Mobile columns"
            options={['1', '2'].map((value) => ({ label: value, value }))}
            value={String(node.props.mobileColumns)}
            onChange={(value) => updateProps({ mobileColumns: Number(value) })}
          />
        </>
      ) : null}
      {node.type === 'slot' ? (
        <>
          <TextField
            label="Slot name"
            value={node.props.name}
            onChange={(value) => updateProps({ name: value })}
          />
          <SelectField
            label="Min height"
            options={['none', 'sm', 'md', 'lg'].map((value) => ({
              label: value,
              value
            }))}
            value={node.props.minHeight}
            onChange={(value) => updateProps({ minHeight: value })}
          />
        </>
      ) : null}
    </div>
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
    <div className="editor-nested page-element-settings">
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
            options={['1', '2', '3', '4', '5', '6'].map((value) => ({
              label: value,
              value
            }))}
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
            options={[
              { label: 'primary', value: 'primary' },
              { label: 'secondary', value: 'secondary' }
            ]}
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
  options: Array<{ label: string; value: string }>
  value: string
}) {
  return (
    <Label text={label}>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
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
      options={spacingOptions.map((option) => ({ label: option, value: option }))}
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
      options={alignOptions.map((option) => ({ label: option, value: option }))}
      value={value}
      onChange={(nextValue) => onChange(nextValue as Align)}
    />
  )
}
