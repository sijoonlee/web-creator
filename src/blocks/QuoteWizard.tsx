'use client'

import { useMemo, useState } from 'react'
import { z } from 'zod'

import { createInitialWorkflowState, getCurrentStep } from '@/workflows/engine'
import { workflowSchema } from '@/workflows/schemas'
import { registerBlock } from './registerBlock'

export const quoteWizardSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  workflow: workflowSchema
})

function QuoteWizard(props: z.infer<typeof quoteWizardSchema>) {
  const [state, setState] = useState(() =>
    createInitialWorkflowState(props.workflow)
  )
  const currentStep = useMemo(
    () => getCurrentStep(props.workflow, state),
    [props.workflow, state]
  )

  if (!currentStep) {
    return null
  }

  return (
    <section className="wizard">
      <div className="wizard-panel">
        <h2>{props.title}</h2>
        {props.description ? <p>{props.description}</p> : null}
        <h3>{currentStep.title}</h3>
        {currentStep.fields.map((field) => (
          <label className="wizard-field" key={field.name}>
            <span>{field.label}</span>
            <input
              name={field.name}
              type={field.type}
              value={String(state.values[field.name] || '')}
              onChange={(event) =>
                setState((previous) => ({
                  ...previous,
                  values: {
                    ...previous.values,
                    [field.name]: event.target.value
                  }
                }))
              }
            />
          </label>
        ))}
        <div className="wizard-actions">
          <button
            className="button"
            disabled={state.currentStepIndex === 0}
            onClick={() =>
              setState((previous) => ({
                ...previous,
                currentStepIndex: Math.max(0, previous.currentStepIndex - 1)
              }))
            }
            type="button"
          >
            Back
          </button>
          <button
            className="button"
            onClick={() =>
              setState((previous) => ({
                ...previous,
                currentStepIndex: Math.min(
                  props.workflow.steps.length - 1,
                  previous.currentStepIndex + 1
                )
              }))
            }
            type="button"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  )
}

export const QuoteWizardBlock = registerBlock({
  type: 'quoteWizard',
  label: 'Quote Wizard',
  schema: quoteWizardSchema,
  component: QuoteWizard
})
