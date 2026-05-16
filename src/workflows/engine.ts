import type { WorkflowDefinition } from './schemas'

export type WorkflowState = {
  currentStepIndex: number
  values: Record<string, string | number | boolean>
}

export function createInitialWorkflowState(
  workflow: WorkflowDefinition
): WorkflowState {
  return {
    currentStepIndex: 0,
    values: Object.fromEntries(
      workflow.steps.flatMap((step) =>
        step.fields.map((field) => [field.name, ''])
      )
    )
  }
}

export function getCurrentStep(
  workflow: WorkflowDefinition,
  state: WorkflowState
) {
  return workflow.steps[state.currentStepIndex]
}
