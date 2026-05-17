'use client'

import { useMemo, useState } from 'react'
import { z } from 'zod'

import { Button } from '@/components/Button'
import { Heading } from '@/components/Heading'
import { Input } from '@/components/Input'
import { Label } from '@/components/Label'
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
        <Heading>{props.title}</Heading>
        {props.description ? <p>{props.description}</p> : null}
        <Heading level={3}>{currentStep.title}</Heading>
        {currentStep.fields.map((field) => (
          <Label className="wizard-field" key={field.name} text={field.label}>
            <Input
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
          </Label>
        ))}
        <div className="wizard-actions">
          <Button
            disabled={state.currentStepIndex === 0}
            onClick={() =>
              setState((previous) => ({
                ...previous,
                currentStepIndex: Math.max(0, previous.currentStepIndex - 1)
              }))
            }
          >
            Back
          </Button>
          <Button
            onClick={() =>
              setState((previous) => ({
                ...previous,
                currentStepIndex: Math.min(
                  props.workflow.steps.length - 1,
                  previous.currentStepIndex + 1
                )
              }))
            }
          >
            Next
          </Button>
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
