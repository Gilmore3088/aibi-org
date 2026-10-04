// Wave 2: the features wave 1 skipped. Each journey is a list of variants; a
// persona runs one variant, chosen by its seed. Steps are interpreted by
// runSteps() in run-wave.mjs:
//
//   { go: '/path' }                 navigate by visible link, else type the URL (friction)
//   { enter: '/path' }              land directly (the persona arrived from outside)
//   { read: 'value_id', min: 250 }  page has >= min words of content → value
//   { click: /re/, label }          click a CTA; add value: 'id' to count it
//   { fill: 'selector' }            fill every visible field in that scope
//   { submit: /re/, api: /re/, value, label, scope }  submit and judge the API response
//   { download: /re/, value, label } expect a file, a PDF/ZIP response, or an email gate
//   { answer: 'selector', next: /re/, max, value }     play a quiz/exam to the end
//   { chips: 'selector', n }        toggle a few filter chips / checkboxes
//   { sliders: n, value }           move range sliders
//   { expectText: /re/, value, label } visible text proves the outcome

export const FEATURE_QUOTAS = [
  { journey: 'help-widget', count: 10, label: 'Home “Can we help you today?” free resource' },
  { journey: 'hero-quiz', count: 5, label: 'Home “Would you allow this prompt?” check' },
  { journey: 'roi-workbook', count: 5, label: 'ROI calculator → efficiency-ratio workbook' },
  { journey: 'article-reader', count: 8, label: 'Reads a research brief' },
  { journey: 'template-download', count: 8, label: 'Downloads a template' },
  { journey: 'prompt-card-download', count: 4, label: 'Downloads prompt cards' },
  { journey: 'playbook-asset', count: 6, label: 'Downloads a role playbook asset' },
  { journey: 'sample-report', count: 6, label: 'Sample readiness report + PDF' },
  { journey: 'assessment-resume', count: 6, label: 'Emails a resume link mid-assessment' },
  { journey: 'team-assessment', count: 4, label: 'Team assessment inquiry' },
  { journey: 'account', count: 6, label: 'Sign up, sign in, reset password' },
  { journey: 'toolbox', count: 10, label: 'Toolbox, skill builder, library' },
  { journey: 'course-extras', count: 12, label: 'Course extras: onboarding, guides, wins, packet' },
  { journey: 'cert-exam', count: 3, label: 'Foundation certification exam' },
  { journey: 'purchase-help', count: 3, label: 'Purchase help / support request' },
  { journey: 'trust-pages', count: 4, label: 'Preview, gallery, privacy, AI-use pages' },
];

const EMAIL_API = /\/api\/(capture-email|resources|assessment|inquiry|support|auth|guides|prompt-cards|playbooks)/;

export const FEATURE_JOURNEYS = {
  'help-widget': [
    [
      { enter: '/' },
      { fill: 'form:has(select), form.mk-help-form, section:has(.mk-help-submit) form' },
      { submit: /send it to me/i, api: /\/api\/capture-email/, value: 'help_resource_sent', label: 'help widget: send it to me', scope: 'form:has(.mk-help-submit)' },
      { expectText: /on its way|check your inbox|sent|we.ll send|thanks/i, value: 'help_confirmation_seen', label: 'help widget confirmation' },
    ],
  ],
  'hero-quiz': [
    [
      { enter: '/' },
      { click: /^example$/i, label: 'prompt checker: load example', value: 'hero_quiz_answered' },
      { expectText: /found \d+ customer detail|safer version/i, value: 'hero_feedback_seen', label: 'prompt checker feedback' },
      { click: /get my readiness score/i, label: 'hero → assessment', value: 'next_step_opened' },
    ],
  ],
  'roi-workbook': [
    [
      { enter: '/' },
      { sliders: 3, value: 'roi_estimate' },
      { click: /see (the )?assumptions( and sources)?/i, label: 'ROI → workbook' },
      { sliders: 4, value: 'workbook_used' },
      { read: 'workbook_read', min: 300 },
      { click: /discuss your number|book an executive briefing/i, label: 'workbook next step', value: 'next_step_opened' },
    ],
  ],
  'article-reader': [
    [{ enter: '/resources' }, { go: '/briefings' }, { click: /read the briefing/i, label: 'open a brief' }, { read: 'article_read', min: 300 }, { click: /assessment|course|training|foundation/i, label: 'brief → next step', value: 'next_step_opened' }],
    [{ enter: '/resources/the-widening-ai-gap' }, { read: 'article_read', min: 500 }, { click: /take the free assessment/i, label: 'article → assessment', value: 'next_step_opened' }],
    [{ enter: '/resources/six-ways-ai-fails-in-banking' }, { read: 'article_read', min: 500 }, { click: /course|training|foundation|assessment/i, label: 'article next step', value: 'next_step_opened' }],
    [{ enter: '/resources/ai-governance-without-the-jargon' }, { read: 'article_read', min: 500 }, { click: /assessment|course|foundation/i, label: 'article next step', value: 'next_step_opened' }],
  ],
  'template-download': [
    [{ enter: '/resources' }, { click: /templates|ai use policy|board briefing|sop|checklist/i, label: 'open a template' }, { download: /get word doc|download|pdf|word/i, value: 'resource_download', label: 'template download' }],
    [{ enter: '/resources/templates/ai-use-policy-starter' }, { read: 'template_read', min: 300 }, { download: /get word doc|download|pdf|word/i, value: 'resource_download', label: 'policy starter download' }],
    [{ enter: '/resources/templates/board-briefing-checklist' }, { download: /get word doc|download|pdf|word/i, value: 'resource_download', label: 'board checklist download' }],
    [{ enter: '/resources/templates/gtm-plan' }, { download: /get word doc|download|pdf|word/i, value: 'resource_download', label: 'template download' }],
  ],
  'prompt-card-download': [
    [{ enter: '/prompt-cards' }, { read: 'cards_read', min: 200 }, { download: /download|pdf|get the (aibi )?prompt cards|get the cards|zip/i, value: 'resource_download', label: 'prompt cards download' }],
    [{ enter: '/resources/prompting-foundation' }, { download: /download prompt card/i, value: 'resource_download', label: 'prompt card download' }, { download: /examples pdf|^zip$|^pdf$/i, value: 'resource_download', label: 'examples download' }],
  ],
  'playbook-asset': [
    [{ enter: '/playbooks' }, { click: /lending|compliance|retail|marketing|operations|bsa/i, label: 'open a role playbook' }, { download: /download .* pdf|download/i, value: 'resource_download', label: 'playbook PDF' }],
    [{ enter: '/playbooks/compliance' }, { click: /checklist|reference card|template/i, label: 'open a playbook asset' }, { read: 'asset_read', min: 200 }, { download: /download|pdf/i, value: 'resource_download', label: 'asset download' }],
  ],
  'sample-report': [
    [{ enter: '/results/sample' }, { read: 'sample_report_read', min: 300 }, { download: /download (the )?sample/i, value: 'resource_download', label: 'sample report PDF' }],
    [{ enter: '/results/sample' }, { read: 'sample_report_read', min: 300 }, { click: /get (the )?90-day playbook|take the in-depth/i, label: 'sample → In-Depth', value: 'next_step_opened' }],
  ],
  'assessment-resume': [
    [
      { enter: '/assessment/take' },
      { answer: 'button:has-text("→")', max: 4, stopEarly: true },
      { click: /need to finish later|email yourself a resume link/i, label: 'open resume-link form' },
      { fill: 'details:has(input[type=email])' },
      { submit: /send|email/i, api: /\/api\/(assessment|capture-email)/, value: 'resume_link_sent', label: 'send resume link', scope: 'details:has(input[type=email])' },
    ],
  ],
  'team-assessment': [
    [{ enter: '/assessment/team' }, { read: 'team_page_read', min: 200 }, { fill: 'form:has(textarea)' }, { submit: /send inquiry/i, api: /\/api\/(inquiry|checkout\/team)/, value: 'inquiry_submitted', label: 'team inquiry', scope: 'form:has(textarea)' }],
  ],
  account: [
    [{ enter: '/auth/signup' }, { fill: 'form' }, { submit: /create account/i, api: /\/api\/auth|supabase|signup/, value: 'account_response', label: 'create account', scope: 'form', uiOk: /check your email|confirm|created|welcome/i }],
    [{ enter: '/auth/login' }, { fill: 'form:has(input[type=password])' }, { submit: /^sign in$/i, api: /\/api\/auth|token|login/, value: 'account_response', label: 'sign in', scope: 'form:has(input[type=password])', uiOk: /invalid|incorrect|welcome|signed in|check/i }],
    [{ enter: '/auth/forgot-password' }, { fill: 'form' }, { submit: /send reset link/i, api: /\/api\/auth|recover|reset/, value: 'account_response', label: 'reset password', scope: 'form', uiOk: /check your email|sent|if an account/i }],
  ],
  toolbox: [
    [{ enter: '/my-toolbox' }, { chips: 'button:is(:has-text("Compliance"),:has-text("Lending"),:has-text("Marketing"),:has-text("Operations"))', n: 2 }, { click: /^copy$/i, label: 'copy a prompt', value: 'toolbox_prompt_copied' }, { click: /use in sandbox/i, label: 'use in sandbox', value: 'next_step_opened' }],
    [{ enter: '/my-toolbox/skill-builder' }, { fill: 'section:has(textarea), form, main' }, { chips: 'button:is(:has-text("Lending"),:has-text("Medium"),:has-text("Draft"))', n: 2 }, { click: /copy markdown/i, label: 'copy skill markdown', value: 'skill_built' }],
    [{ enter: '/my-toolbox/prompt-like-a-banker' }, { click: /open builder/i, label: 'open prompt builder' }, { read: 'builder_read', min: 120 }, { download: /examples pdf/i, value: 'resource_download', label: 'examples PDF' }],
    [{ enter: '/dashboard/toolbox' }, { click: /start guided run/i, label: 'start guided run', value: 'toolbox_guided_run' }, { go: '/dashboard/toolbox/library' }, { read: 'library_read', min: 300 }, { go: '/dashboard/toolbox' }, { click: /cookbook/i, label: 'open cookbook' }, { read: 'cookbook_read', min: 40 }],
  ],
  'course-extras': [
    [{ enter: '/courses/foundation/program/onboarding' }, { click: /run this prompt/i, label: 'run onboarding prompt', value: 'onboarding_started' }, { expectText: /output|result|draft|bulletin/i, value: 'onboarding_output', label: 'onboarding output' }],
    [{ enter: '/courses/foundation/program/tool-guides' }, { read: 'tool_guides_read', min: 600 }],
    [{ enter: '/courses/foundation/program/quick-wins' }, { fill: 'form' }, { submit: /add|log|save/i, api: /\/api\/courses\/log-quick-win/, value: 'quick_win_logged', label: 'log a quick win', scope: 'form' }],
    [{ enter: '/courses/foundation/program/toolkit' }, { read: 'packet_read', min: 500 }, { chips: 'select', n: 1 }, { download: /download|export|pdf|zip/i, value: 'resource_download', label: 'export packet' }],
    [{ enter: '/courses/foundation/program/settings' }, { chips: 'input[type=checkbox]', n: 2 }, { submit: /save|update/i, api: /\/api\/(courses|user-profile)/, value: 'settings_saved', label: 'save settings', scope: 'main' }],
    [{ enter: '/courses/foundation/program/submit' }, { fill: 'form' }, { submit: /submit|send|review/i, api: /\/api\/courses\/submit/, value: 'packet_submitted', label: 'submit final packet', scope: 'form' }],
    [{ enter: '/courses/foundation/program/post-assessment' }, { answer: 'main button', next: /next|continue|submit|see/i, max: 16, value: 'post_assessment_done' }],
    [{ enter: '/courses/foundation/program/gallery' }, { read: 'gallery_read', min: 300 }],
  ],
  'cert-exam': [
    [{ enter: '/certifications/exam/foundation' }, { click: /start|begin|take the exam/i, label: 'start exam', optional: true }, { answer: 'main button', optionText: /^\s*[a-d]\s*\S/i, next: /^\s*(next|submit exam|submit|finish)\b/i, max: 16, value: 'exam_completed' }],
  ],
  'purchase-help': [
    [{ enter: '/support/purchase-help' }, { fill: 'form:has(textarea)' }, { submit: /send support request/i, api: /\/api\/support/, value: 'support_request_sent', label: 'support request', scope: 'form:has(textarea)' }],
    [{ enter: '/support/purchase-help' }, { fill: 'form:not(:has(textarea))' }, { submit: /resend purchase link/i, api: /\/api\/(auth|support)/, value: 'purchase_link_resent', label: 'resend purchase link', scope: 'form:not(:has(textarea))' }],
  ],
  'trust-pages': [
    [{ enter: '/courses/foundation/preview' }, { read: 'preview_read', min: 300 }, { click: /^copy the /i, label: 'preview build: copy the prompt', value: 'preview_build_copied' }],
    [{ enter: '/courses/foundation/gallery' }, { chips: 'button:is(:has-text("Prompt template"),:has-text("Email starter"),:has-text("Hallucination"))', n: 1 }, { read: 'gallery_read', min: 300 }],
    [{ enter: '/privacy' }, { read: 'privacy_read', min: 150 }, { go: '/security/data-handling' }, { read: 'data_handling_read', min: 300 }],
    [{ enter: '/ai-use-disclaimer' }, { read: 'disclaimer_read', min: 150 }, { click: /start the course/i, label: 'disclaimer → course', value: 'next_step_opened' }],
  ],
};
