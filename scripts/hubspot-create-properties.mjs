#!/usr/bin/env node
// Create the 5 AiBI custom contact properties in HubSpot.
//
// HubSpot's API silently ignores unknown property names, so without these
// pre-created, every contact upsert from /api/capture-email drops the
// assessment_score / score_tier / institution_name / asset_size /
// lead_source fields on the floor. Source of truth: CLAUDE.md "HubSpot —
// Custom Properties Must Be Pre-Created".
//
// Usage:
//   HUBSPOT_API_KEY=pat-... node scripts/hubspot-create-properties.mjs
//   HUBSPOT_API_KEY=pat-... node scripts/hubspot-create-properties.mjs --dry-run
//
// The script is idempotent — it lists existing properties first and skips
// any that already exist. Property *types* are not patched on conflict;
// drop the property in the HubSpot UI if you need to change the type.

const HUBSPOT_API = 'https://api.hubapi.com';
const GROUP_NAME = 'aibi_assessment';
const GROUP_LABEL = 'AiBI Assessment';

const PROPERTIES = [
  {
    name: 'assessment_score',
    label: 'Assessment Score',
    type: 'number',
    fieldType: 'number',
    description: 'Total readiness assessment score (12–48 on assessment v2).',
  },
  {
    name: 'score_tier',
    label: 'Score Tier',
    type: 'string',
    fieldType: 'text',
    description:
      'Readiness tier label derived from assessment_score: Starting Point / Early Stage / Building Momentum / Ready to Scale.',
  },
  {
    name: 'institution_name',
    label: 'Institution Name',
    type: 'string',
    fieldType: 'text',
    description: 'Self-reported community bank or credit union name from the assessment.',
  },
  {
    name: 'asset_size',
    label: 'Asset Size',
    type: 'enumeration',
    fieldType: 'select',
    description: 'Self-reported institution asset size bucket.',
    options: [
      { label: 'Under $100M', value: 'under-100m', displayOrder: 0 },
      { label: '$100M–$500M', value: '100m-500m', displayOrder: 1 },
      { label: '$500M–$1B', value: '500m-1b', displayOrder: 2 },
      { label: '$1B+', value: '1b-plus', displayOrder: 3 },
    ],
  },
  {
    name: 'lead_source',
    label: 'Lead Source',
    type: 'enumeration',
    fieldType: 'select',
    description: 'Where the contact entered the AiBI funnel.',
    options: [
      { label: 'Assessment', value: 'assessment', displayOrder: 0 },
      { label: 'Referral', value: 'referral', displayOrder: 1 },
      { label: 'LinkedIn', value: 'linkedin', displayOrder: 2 },
      { label: 'Conference', value: 'conference', displayOrder: 3 },
    ],
  },
];

function requireApiKey() {
  const key = process.env.HUBSPOT_API_KEY;
  if (!key) {
    console.error('[hubspot-create-properties] HUBSPOT_API_KEY is not set. Aborting.');
    process.exit(1);
  }
  return key;
}

async function hubspotRequest(path, init = {}) {
  const apiKey = requireApiKey();
  const res = await fetch(`${HUBSPOT_API}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { ok: res.ok, status: res.status, body };
}

async function ensureGroup(dryRun) {
  const list = await hubspotRequest('/crm/v3/properties/contacts/groups');
  if (!list.ok) {
    console.error('[hubspot-create-properties] Failed to list property groups:', list.status, list.body);
    process.exit(1);
  }
  const exists = (list.body?.results ?? []).some((g) => g.name === GROUP_NAME);
  if (exists) {
    console.log(`[hubspot-create-properties] Group "${GROUP_NAME}" already exists.`);
    return;
  }
  if (dryRun) {
    console.log(`[hubspot-create-properties] (dry-run) would create group "${GROUP_NAME}".`);
    return;
  }
  const created = await hubspotRequest('/crm/v3/properties/contacts/groups', {
    method: 'POST',
    body: JSON.stringify({ name: GROUP_NAME, label: GROUP_LABEL, displayOrder: -1 }),
  });
  if (!created.ok) {
    console.error('[hubspot-create-properties] Failed to create group:', created.status, created.body);
    process.exit(1);
  }
  console.log(`[hubspot-create-properties] Created group "${GROUP_NAME}".`);
}

async function ensureProperty(prop, existingNames, dryRun) {
  if (existingNames.has(prop.name)) {
    console.log(`[hubspot-create-properties] Property "${prop.name}" already exists, skipping.`);
    return;
  }
  if (dryRun) {
    console.log(`[hubspot-create-properties] (dry-run) would create property "${prop.name}" (${prop.type}).`);
    return;
  }
  const payload = {
    name: prop.name,
    label: prop.label,
    type: prop.type,
    fieldType: prop.fieldType,
    description: prop.description,
    groupName: GROUP_NAME,
    ...(prop.options ? { options: prop.options } : {}),
  };
  const created = await hubspotRequest('/crm/v3/properties/contacts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!created.ok) {
    console.error(
      `[hubspot-create-properties] Failed to create "${prop.name}":`,
      created.status,
      created.body,
    );
    process.exit(1);
  }
  console.log(`[hubspot-create-properties] Created property "${prop.name}".`);
}

async function listExistingPropertyNames() {
  const res = await hubspotRequest('/crm/v3/properties/contacts');
  if (!res.ok) {
    console.error('[hubspot-create-properties] Failed to list properties:', res.status, res.body);
    process.exit(1);
  }
  return new Set((res.body?.results ?? []).map((p) => p.name));
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  console.log(
    `[hubspot-create-properties] ${dryRun ? 'DRY RUN — ' : ''}ensuring ${PROPERTIES.length} contact properties.`,
  );
  await ensureGroup(dryRun);
  const existing = await listExistingPropertyNames();
  for (const prop of PROPERTIES) {
    await ensureProperty(prop, existing, dryRun);
  }
  console.log('[hubspot-create-properties] Done.');
}

main().catch((err) => {
  console.error('[hubspot-create-properties] Unhandled error:', err);
  process.exit(1);
});
