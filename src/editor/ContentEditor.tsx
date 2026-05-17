'use client'

import { useEffect, useMemo, useState } from 'react'

import type { BlockDocument } from '@/blocks/types'
import { Heading } from '@/components/Heading'
import { Input } from '@/components/Input'
import { Label } from '@/components/Label'
import { BlockRenderer } from '@/renderer/BlockRenderer'
import {
  blockOptions,
  createDefaultBlock,
  editorStorageKey,
  type EditableBlockType
} from './blockDefaults'

type ContentEditorProps = {
  initialBlocks: BlockDocument[]
}

type JsonObject = Record<string, any>

function cloneBlocks(blocks: BlockDocument[]) {
  return JSON.parse(JSON.stringify(blocks)) as BlockDocument[]
}

function isEditableBlockType(type: string): type is EditableBlockType {
  return blockOptions.some((option) => option.type === type)
}

function getProps(block: BlockDocument | undefined): JsonObject {
  if (!block || typeof block.props !== 'object' || block.props === null) {
    return {}
  }

  return block.props as JsonObject
}

function setAtPath(source: JsonObject, path: string[], value: unknown) {
  const next = { ...source }
  let cursor = next

  path.forEach((segment, index) => {
    if (index === path.length - 1) {
      cursor[segment] = value
      return
    }

    cursor[segment] = {
      ...(typeof cursor[segment] === 'object' && cursor[segment] !== null
        ? cursor[segment]
        : {})
    }
    cursor = cursor[segment]
  })

  return next
}

export function ContentEditor({ initialBlocks }: ContentEditorProps) {
  const [blocks, setBlocks] = useState<BlockDocument[]>(() =>
    cloneBlocks(initialBlocks)
  )
  const [selectedId, setSelectedId] = useState<string | undefined>(
    initialBlocks[0]?.id
  )
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false)
  const [workflowJson, setWorkflowJson] = useState('')
  const [workflowError, setWorkflowError] = useState('')

  const selectedIndex = blocks.findIndex((block) => block.id === selectedId)
  const selectedBlock = selectedIndex >= 0 ? blocks[selectedIndex] : blocks[0]
  const selectedProps = getProps(selectedBlock)

  useEffect(() => {
    const storedBlocks = window.localStorage.getItem(editorStorageKey)

    if (storedBlocks) {
      try {
        const parsed = JSON.parse(storedBlocks) as BlockDocument[]
        if (Array.isArray(parsed)) {
          setBlocks(parsed)
          setSelectedId(parsed[0]?.id)
        }
      } catch {
        window.localStorage.removeItem(editorStorageKey)
      }
    }

    setHasLoadedStorage(true)
  }, [])

  useEffect(() => {
    if (!hasLoadedStorage) {
      return
    }

    window.localStorage.setItem(editorStorageKey, JSON.stringify(blocks))
  }, [blocks, hasLoadedStorage])

  useEffect(() => {
    if (selectedBlock?.type === 'quoteWizard') {
      setWorkflowJson(JSON.stringify(getProps(selectedBlock).workflow, null, 2))
      setWorkflowError('')
    }
  }, [selectedBlock])

  const selectedLabel = useMemo(() => {
    if (!selectedBlock) {
      return 'No block selected'
    }

    return (
      blockOptions.find((option) => option.type === selectedBlock.type)?.label ||
      selectedBlock.type
    )
  }, [selectedBlock])

  function updateSelectedProps(nextProps: JsonObject) {
    if (!selectedBlock) {
      return
    }

    setBlocks((current) =>
      current.map((block) =>
        block.id === selectedBlock.id ? { ...block, props: nextProps } : block
      )
    )
  }

  function updatePath(path: string[], value: unknown) {
    updateSelectedProps(setAtPath(selectedProps, path, value))
  }

  function addBlock(type: EditableBlockType) {
    const block = createDefaultBlock(type)
    setBlocks((current) => [...current, block])
    setSelectedId(block.id)
  }

  function moveSelected(direction: -1 | 1) {
    if (!selectedBlock || selectedIndex < 0) {
      return
    }

    const nextIndex = selectedIndex + direction

    if (nextIndex < 0 || nextIndex >= blocks.length) {
      return
    }

    setBlocks((current) => {
      const next = [...current]
      const [block] = next.splice(selectedIndex, 1)
      next.splice(nextIndex, 0, block)
      return next
    })
  }

  function deleteSelected() {
    if (!selectedBlock) {
      return
    }

    setBlocks((current) => {
      const next = current.filter((block) => block.id !== selectedBlock.id)
      setSelectedId(next[Math.max(0, selectedIndex - 1)]?.id)
      return next
    })
  }

  function resetEditor() {
    const next = cloneBlocks(initialBlocks)
    window.localStorage.removeItem(editorStorageKey)
    setBlocks(next)
    setSelectedId(next[0]?.id)
  }

  function updateArrayItem(
    key: 'plans' | 'items',
    index: number,
    field: string,
    value: string
  ) {
    const list = Array.isArray(selectedProps[key]) ? selectedProps[key] : []
    updateSelectedProps({
      ...selectedProps,
      [key]: list.map((item: JsonObject, itemIndex: number) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    })
  }

  function addArrayItem(key: 'plans' | 'items') {
    const list = Array.isArray(selectedProps[key]) ? selectedProps[key] : []
    const item =
      key === 'plans'
        ? { name: 'New plan', price: '$0', description: 'Plan description.' }
        : { question: 'New question', answer: 'Answer text.' }

    updateSelectedProps({
      ...selectedProps,
      [key]: [...list, item]
    })
  }

  function removeArrayItem(key: 'plans' | 'items', index: number) {
    const list = Array.isArray(selectedProps[key]) ? selectedProps[key] : []
    updateSelectedProps({
      ...selectedProps,
      [key]: list.filter((_: unknown, itemIndex: number) => itemIndex !== index)
    })
  }

  function applyWorkflowJson() {
    try {
      const workflow = JSON.parse(workflowJson)
      updateSelectedProps({
        ...selectedProps,
        workflow
      })
      setWorkflowError('')
    } catch {
      setWorkflowError('Workflow JSON is invalid.')
    }
  }

  return (
    <main className="editor-shell">
      <aside className="editor-panel editor-structure">
        <div className="editor-panel-header">
          <Heading level={1}>Content Editor</Heading>
          <button className="editor-secondary" onClick={resetEditor} type="button">
            Reset
          </button>
        </div>

        <div className="editor-add-grid">
          {blockOptions.map((option) => (
            <button
              className="editor-secondary"
              key={option.type}
              onClick={() => addBlock(option.type)}
              type="button"
            >
              + {option.label}
            </button>
          ))}
        </div>

        <div className="editor-block-list">
          {blocks.map((block, index) => (
            <button
              className={
                block.id === selectedBlock?.id
                  ? 'editor-block-row selected'
                  : 'editor-block-row'
              }
              key={block.id || `${block.type}-${index}`}
              onClick={() => setSelectedId(block.id)}
              type="button"
            >
              <span>{index + 1}</span>
              <strong>
                {blockOptions.find((option) => option.type === block.type)
                  ?.label || block.type}
              </strong>
            </button>
          ))}
        </div>
      </aside>

      <section className="editor-preview" aria-label="Live preview">
        <div className="editor-preview-bar">
          <span>Live preview</span>
          <a href="/" target="_blank">
            Public page
          </a>
        </div>
        <div className="editor-preview-canvas">
          <BlockRenderer blocks={blocks} mode="preview" />
        </div>
      </section>

      <aside className="editor-panel editor-settings">
        <div className="editor-panel-header">
          <div>
            <p>Selected block</p>
            <Heading>{selectedLabel}</Heading>
          </div>
        </div>

        {selectedBlock ? (
          <>
            <div className="editor-actions">
              <button
                className="editor-secondary"
                disabled={selectedIndex <= 0}
                onClick={() => moveSelected(-1)}
                type="button"
              >
                Up
              </button>
              <button
                className="editor-secondary"
                disabled={selectedIndex >= blocks.length - 1}
                onClick={() => moveSelected(1)}
                type="button"
              >
                Down
              </button>
              <button
                className="editor-danger"
                onClick={deleteSelected}
                type="button"
              >
                Delete
              </button>
            </div>

            {isEditableBlockType(selectedBlock.type) ? (
              <BlockSettings
                addArrayItem={addArrayItem}
                applyWorkflowJson={applyWorkflowJson}
                block={selectedBlock}
                props={selectedProps}
                removeArrayItem={removeArrayItem}
                updateArrayItem={updateArrayItem}
                updatePath={updatePath}
                updateProps={updateSelectedProps}
                workflowError={workflowError}
                workflowJson={workflowJson}
                setWorkflowJson={setWorkflowJson}
              />
            ) : null}
          </>
        ) : (
          <p className="editor-empty">Add a block to start editing.</p>
        )}
      </aside>
    </main>
  )
}

type BlockSettingsProps = {
  addArrayItem: (key: 'plans' | 'items') => void
  applyWorkflowJson: () => void
  block: BlockDocument
  props: JsonObject
  removeArrayItem: (key: 'plans' | 'items', index: number) => void
  setWorkflowJson: (value: string) => void
  updateArrayItem: (
    key: 'plans' | 'items',
    index: number,
    field: string,
    value: string
  ) => void
  updatePath: (path: string[], value: unknown) => void
  updateProps: (props: JsonObject) => void
  workflowError: string
  workflowJson: string
}

function BlockSettings({
  addArrayItem,
  applyWorkflowJson,
  block,
  props,
  removeArrayItem,
  setWorkflowJson,
  updateArrayItem,
  updatePath,
  updateProps,
  workflowError,
  workflowJson
}: BlockSettingsProps) {
  if (block.type === 'hero') {
    return (
      <div className="editor-form">
        <TextField
          label="Title"
          value={props.title}
          onChange={(value) => updatePath(['title'], value)}
        />
        <TextArea
          label="Subtitle"
          value={props.subtitle}
          onChange={(value) => updatePath(['subtitle'], value)}
        />
        <Label text="Variant">
          <select
            value={String(props.variant || 'split')}
            onChange={(event) => updatePath(['variant'], event.target.value)}
          >
            <option value="split">Split</option>
            <option value="center">Center</option>
          </select>
        </Label>
        <TextField
          label="CTA label"
          value={props.cta?.label}
          onChange={(value) => updatePath(['cta', 'label'], value)}
        />
        <TextField
          label="CTA URL"
          value={props.cta?.href}
          onChange={(value) => updatePath(['cta', 'href'], value)}
        />
      </div>
    )
  }

  if (block.type === 'pricing') {
    const plans = Array.isArray(props.plans) ? props.plans : []

    return (
      <div className="editor-form">
        <TextField
          label="Eyebrow"
          value={props.eyebrow}
          onChange={(value) => updatePath(['eyebrow'], value)}
        />
        <TextField
          label="Title"
          value={props.title}
          onChange={(value) => updatePath(['title'], value)}
        />
        <EditorArrayHeader label="Plans" onAdd={() => addArrayItem('plans')} />
        {plans.map((plan: JsonObject, index: number) => (
          <div className="editor-nested" key={index}>
            <TextField
              label="Name"
              value={plan.name}
              onChange={(value) => updateArrayItem('plans', index, 'name', value)}
            />
            <TextField
              label="Price"
              value={plan.price}
              onChange={(value) => updateArrayItem('plans', index, 'price', value)}
            />
            <TextArea
              label="Description"
              value={plan.description}
              onChange={(value) =>
                updateArrayItem('plans', index, 'description', value)
              }
            />
            <button
              className="editor-danger"
              onClick={() => removeArrayItem('plans', index)}
              type="button"
            >
              Remove plan
            </button>
          </div>
        ))}
      </div>
    )
  }

  if (block.type === 'faq') {
    const items = Array.isArray(props.items) ? props.items : []

    return (
      <div className="editor-form">
        <TextField
          label="Title"
          value={props.title}
          onChange={(value) => updatePath(['title'], value)}
        />
        <EditorArrayHeader label="Questions" onAdd={() => addArrayItem('items')} />
        {items.map((item: JsonObject, index: number) => (
          <div className="editor-nested" key={index}>
            <TextField
              label="Question"
              value={item.question}
              onChange={(value) =>
                updateArrayItem('items', index, 'question', value)
              }
            />
            <TextArea
              label="Answer"
              value={item.answer}
              onChange={(value) => updateArrayItem('items', index, 'answer', value)}
            />
            <button
              className="editor-danger"
              onClick={() => removeArrayItem('items', index)}
              type="button"
            >
              Remove question
            </button>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="editor-form">
      <TextField
        label="Title"
        value={props.title}
        onChange={(value) => updatePath(['title'], value)}
      />
      <TextArea
        label="Description"
        value={props.description}
        onChange={(value) => updatePath(['description'], value)}
      />
      <Label text="Workflow JSON">
        <textarea
          rows={14}
          value={workflowJson}
          onChange={(event) => setWorkflowJson(event.target.value)}
        />
      </Label>
      {workflowError ? <p className="editor-error">{workflowError}</p> : null}
      <button className="editor-secondary" onClick={applyWorkflowJson} type="button">
        Apply workflow
      </button>
      <button
        className="editor-secondary"
        onClick={() =>
          updateProps({
            ...props,
            workflow: {
              id: 'quote',
              steps: [
                {
                  id: 'business',
                  title: 'Business info',
                  fields: [
                    {
                      name: 'company',
                      label: 'Company',
                      type: 'text',
                      required: true
                    }
                  ]
                }
              ]
            }
          })
        }
        type="button"
      >
        Reset workflow
      </button>
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
  value: unknown
}) {
  return (
    <Label text={label}>
      <Input
        value={String(value || '')}
        onChange={(event) => onChange(event.target.value)}
      />
    </Label>
  )
}

function TextArea({
  label,
  onChange,
  value
}: {
  label: string
  onChange: (value: string) => void
  value: unknown
}) {
  return (
    <Label text={label}>
      <textarea
        rows={4}
        value={String(value || '')}
        onChange={(event) => onChange(event.target.value)}
      />
    </Label>
  )
}

function EditorArrayHeader({
  label,
  onAdd
}: {
  label: string
  onAdd: () => void
}) {
  return (
    <div className="editor-array-header">
      <Heading level={3}>{label}</Heading>
      <button className="editor-secondary" onClick={onAdd} type="button">
        Add
      </button>
    </div>
  )
}
