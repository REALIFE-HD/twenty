import { FieldMetadataType } from 'twenty-shared/types';

// Who created a record and when tells a rep nothing on site, and on a card it
// takes a slot from the fields that do.
export const RECORD_LIST_MOBILE_CARD_HIDDEN_FIELD_TYPES: FieldMetadataType[] = [
  FieldMetadataType.ACTOR,
];

export const RECORD_LIST_MOBILE_CARD_HIDDEN_FIELD_NAMES = [
  'createdAt',
  'updatedAt',
  'deletedAt',
];
