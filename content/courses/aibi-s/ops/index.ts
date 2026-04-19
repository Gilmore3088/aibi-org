export { opsUnit1_1 } from './unit-1-1';
export { opsUnit1_2 } from './unit-1-2';
export { opsUnit2_1 } from './unit-2-1';
export { opsUnit2_2 } from './unit-2-2';
export { opsUnit3_1 } from './unit-3-1';
export { opsUnit3_2 } from './unit-3-2';
export { opsDepartmentHeadPhase1 } from './persona-dept-head-phase-1';
export { opsDepartmentHeadPhase1_2 } from './persona-dept-head-phase-1-2';
export { opsComplianceLiaisonPhase2 } from './persona-compliance-liaison-phase-2';
export { opsResistantTeamMemberPhase2 } from './persona-resistant-team-member-phase-2';
export { opsPeerDeptManagerPhase3 } from './persona-peer-dept-manager-phase-3';

import { opsUnit1_1 } from './unit-1-1';
import { opsUnit1_2 } from './unit-1-2';
import { opsUnit2_1 } from './unit-2-1';
import { opsUnit2_2 } from './unit-2-2';
import { opsUnit3_1 } from './unit-3-1';
import { opsUnit3_2 } from './unit-3-2';

export const opsUnits = {
  '1.1': opsUnit1_1,
  '1.2': opsUnit1_2,
  '2.1': opsUnit2_1,
  '2.2': opsUnit2_2,
  '3.1': opsUnit3_1,
  '3.2': opsUnit3_2,
} as const;
