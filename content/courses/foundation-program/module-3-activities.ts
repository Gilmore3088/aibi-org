import type { Activity } from './types';

// Module 3 uses two interactive activities instead of the generic generated
// artifact form: a strategy drill and the Prompt Wizard. Keep this as a narrow
// activity override so the course does not depend on the retired module-N files.
export const MODULE_3_PROMPTING_ACTIVITIES: readonly Activity[] = [
  {
    id: '3.1',
    title: 'Match the task to the strategy',
    description:
      'Quick-fire reps on the strategy shelf: a banking task appears, you pick the right prompt strategy, and you get instant feedback with a one-line reason. Eight tasks, untimed, no penalty — learn which kind of prompt to reach for before you build one.',
    type: 'drill',
    completionTrigger: 'save-response',
    fields: [
      {
        id: 'strategy_drill_result',
        label: 'Strategy drill result',
        type: 'textarea',
        minLength: 10,
        required: true,
        placeholder: 'The drill records how many tasks you matched to the right strategy.',
      },
    ],
  },
  {
    id: '3.2',
    title: 'Build a prompt that gets to the CORE',
    description:
      'Build from a worked starter prompt or write your own. Each run scores the prompt on the four CORE elements and shows how the AI answer changes. No blank-page penalty: adapt the starter, run it, and save the prompt you land on.',
    type: 'builder',
    completionTrigger: 'save-response',
    artifactId: 'prompt-strategy-cheat-sheet',
    fields: [
      {
        id: 'final_prompt',
        label: 'The prompt you landed on',
        type: 'textarea',
        minLength: 30,
        required: true,
        placeholder:
          'A concise prompt that names the role, states the task, grounds the answer in the approved source, and sets the format.',
      },
    ],
  },
];
