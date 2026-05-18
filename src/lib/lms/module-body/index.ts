// Module body templates — barrel.
//
// Templates pair with the `bodyTemplate` discriminator on CourseModule
// in src/lib/lms/types.ts. To add a new template:
//   1. Add the discriminator value to ModuleBodyTemplate in types.ts
//   2. Create the template file here
//   3. Export it from this barrel
//   4. Document the contract in src/lib/lms/README.md

export { Tabbed } from './Tabbed';
export { Linear, type LinearStep } from './Linear';
export { Custom } from './Custom';
