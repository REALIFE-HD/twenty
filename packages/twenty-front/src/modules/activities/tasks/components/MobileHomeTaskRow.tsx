import { useCompleteTask } from '@/activities/tasks/hooks/useCompleteTask';
import { type Task } from '@/activities/types/Task';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Checkbox } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { beautifyExactDate } from '~/utils/date-utils';

const StyledRow = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  min-height: ${themeCssVariables.spacing[12]};
  padding: 0 ${themeCssVariables.spacing[3]};

  &:last-of-type {
    border-bottom: none;
  }
`;

const StyledCheckboxContainer = styled.div`
  display: flex;
`;

const StyledTitle = styled.span<{ isCompleted: boolean }>`
  color: ${({ isCompleted }) =>
    isCompleted
      ? themeCssVariables.font.color.tertiary
      : themeCssVariables.font.color.primary};
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
  overflow: hidden;
  text-decoration: ${({ isCompleted }) =>
    isCompleted ? 'line-through' : 'none'};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledDueDate = styled.span<{ isOverdue: boolean }>`
  color: ${({ isOverdue }) =>
    isOverdue
      ? themeCssVariables.font.color.danger
      : themeCssVariables.font.color.tertiary};
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.sm};
`;

const isBeforeToday = (date: Date) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return date < startOfToday;
};

type MobileHomeTaskRowProps = {
  task: Task;
};

export const MobileHomeTaskRow = ({ task }: MobileHomeTaskRowProps) => {
  const { t } = useLingui();
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  const { completeTask } = useCompleteTask(task);

  const isCompleted = task.status === 'DONE';
  const dueDate = isDefined(task.dueAt) ? new Date(task.dueAt) : null;
  const isOverdue = isDefined(dueDate) && isBeforeToday(dueDate);

  return (
    <StyledRow
      onClick={() =>
        openRecordInSidePanel({
          recordId: task.id,
          objectNameSingular: CoreObjectNameSingular.Task,
        })
      }
    >
      <StyledCheckboxContainer onClick={(event) => event.stopPropagation()}>
        <Checkbox
          checked={isCompleted}
          shape="round"
          onCheckedChange={completeTask}
        />
      </StyledCheckboxContainer>
      <StyledTitle isCompleted={isCompleted}>
        {task.title || t`Untitled`}
      </StyledTitle>
      {isDefined(dueDate) && (
        <StyledDueDate isOverdue={isOverdue && !isCompleted}>
          {isOverdue ? beautifyExactDate(dueDate) : t`Today`}
        </StyledDueDate>
      )}
    </StyledRow>
  );
};
