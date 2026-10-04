import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { type FieldPhonesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  type IconComponent,
  IconCheckbox,
  IconNotes,
  IconPhone,
} from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledBar = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledActionButton = styled.button`
  align-items: center;
  appearance: none;
  background: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  font: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  padding: ${themeCssVariables.spacing[2]} 0;

  &:disabled {
    color: ${themeCssVariables.font.color.extraLight};
    cursor: default;
  }
`;

const getPhoneNumberToCall = (phones: FieldPhonesValue | undefined | null) =>
  isNonEmptyString(phones?.primaryPhoneNumber)
    ? `${phones?.primaryPhoneCallingCode ?? ''}${phones.primaryPhoneNumber}`
    : null;

type RecordShowMobileActionBarProps = {
  objectNameSingular: string;
  objectRecordId: string;
};

// The actions a rep reaches for on site: call the customer, then log what
// happened. Desktop has the side panel and inline fields for these.
export const RecordShowMobileActionBar = ({
  objectNameSingular,
  objectRecordId,
}: RecordShowMobileActionBarProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const record = useAtomFamilyStateValue(
    recordStoreFamilyState,
    objectRecordId,
  );

  const openCreateNoteDrawer = useOpenCreateActivityDrawer({
    activityObjectNameSingular: CoreObjectNameSingular.Note,
  });
  const openCreateTaskDrawer = useOpenCreateActivityDrawer({
    activityObjectNameSingular: CoreObjectNameSingular.Task,
  });

  // An opportunity has no phone of its own; the customer it points to does.
  const pointOfContactId =
    objectNameSingular === CoreObjectNameSingular.Opportunity
      ? (record?.pointOfContactId as string | null | undefined)
      : null;

  const { record: pointOfContact } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.Person,
    objectRecordId: pointOfContactId ?? undefined,
    skip: !isNonEmptyString(pointOfContactId),
    recordGqlFields: { id: true, phones: true },
  });

  const phoneNumberToCall =
    objectNameSingular === CoreObjectNameSingular.Person
      ? getPhoneNumberToCall(record?.phones as FieldPhonesValue | undefined)
      : getPhoneNumberToCall(
          pointOfContact?.phones as FieldPhonesValue | undefined,
        );

  const targetableObjects = [
    { id: objectRecordId, targetObjectNameSingular: objectNameSingular },
  ];

  const actions: {
    label: string;
    Icon: IconComponent;
    onClick: () => void;
    isDisabled?: boolean;
  }[] = [
    {
      label: t`Call`,
      Icon: IconPhone,
      isDisabled: !isDefined(phoneNumberToCall),
      onClick: () => {
        if (isDefined(phoneNumberToCall)) {
          window.location.href = `tel:${phoneNumberToCall}`;
        }
      },
    },
    {
      label: t`Add note`,
      Icon: IconNotes,
      onClick: () => openCreateNoteDrawer({ targetableObjects }),
    },
    {
      label: t`Add task`,
      Icon: IconCheckbox,
      onClick: () => openCreateTaskDrawer({ targetableObjects }),
    },
  ];

  return (
    <StyledBar>
      {actions.map(({ label, Icon, onClick, isDisabled }) => (
        <StyledActionButton
          key={label}
          type="button"
          disabled={isDisabled}
          onClick={onClick}
        >
          <Icon size={theme.icon.size.lg} />
          {label}
        </StyledActionButton>
      ))}
    </StyledBar>
  );
};
