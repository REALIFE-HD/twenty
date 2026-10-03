import { MOBILE_HOME_TASKS_LIMIT } from '@/activities/tasks/constants/MobileHomeTasksLimit';
import { type Task } from '@/activities/types/Task';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMemo } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const getEndOfToday = () => {
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  return endOfToday;
};

// Open tasks assigned to the current member that are due today or already
// late, so the home page answers "what do I have to do now".
export const useMobileHomeTasks = () => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const endOfTodayIsoString = useMemo(() => getEndOfToday().toISOString(), []);

  const { records, loading } = useFindManyRecords<Task>({
    objectNameSingular: CoreObjectNameSingular.Task,
    skip: !isDefined(currentWorkspaceMember),
    filter: {
      and: [
        { assigneeId: { eq: currentWorkspaceMember?.id } },
        { dueAt: { lte: endOfTodayIsoString } },
        {
          or: [{ status: { neq: 'DONE' } }, { status: { is: 'NULL' } }],
        },
      ],
    },
    orderBy: [{ dueAt: 'AscNullsLast' }],
    limit: MOBILE_HOME_TASKS_LIMIT,
    recordGqlFields: {
      id: true,
      title: true,
      status: true,
      dueAt: true,
    },
  });

  return { tasks: records, loading };
};
