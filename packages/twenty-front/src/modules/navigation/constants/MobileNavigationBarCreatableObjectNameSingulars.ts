import { CoreObjectNameSingular } from 'twenty-shared/types';

// What a field sales rep records from a phone, most frequent first.
export const MOBILE_NAVIGATION_BAR_CREATABLE_OBJECT_NAME_SINGULARS = [
  CoreObjectNameSingular.Opportunity,
  CoreObjectNameSingular.Person,
  CoreObjectNameSingular.Company,
  CoreObjectNameSingular.Task,
  CoreObjectNameSingular.Note,
] as const;
