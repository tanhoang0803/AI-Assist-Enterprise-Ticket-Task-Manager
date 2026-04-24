'use client';

import { useState } from 'react';
import { TaskStatus } from '@/services/tasks';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../hooks/useTasks';

interface Props {
  ticketId: string;
}

export function TaskChecklist({ ticketId }: Props) {
  const { data: tasks = [], isLoading } = useTasks(ticketId);
  const { mutate: createTask, isPending: isCreating } = useCreateTask(ticketId);
  const { mutate: updateTask } = useUpdateTask(ticketId);
  const { mutate: deleteTask } = useDeleteTask(ticketId);
  const [newTitle, setNewTitle] = useState('');

  const doneCount = tasks.filter((t) => t.status === TaskStatus.DONE).length;
  const progress = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    createTask(title, { onSuccess: () => setNewTitle('') });
  };

  const toggleDone = (id: string, current: TaskStatus) => {
    updateTask({
      id,
      status: current === TaskStatus.DONE ? TaskStatus.TODO : TaskStatus.DONE,
    });
  };

  return (
    <div className="space-y-3">
      {/* Header + progress */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">
          Tasks
          {tasks.length > 0 && (
            <span className="ml-1.5 font-normal text-gray-400">
              {doneCount}/{tasks.length}
            </span>
          )}
        </h2>
        {tasks.length > 0 && (
          <span className="text-xs text-gray-400">{progress}%</span>
        )}
      </div>

      {tasks.length > 0 && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-green-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Task list */}
      {isLoading ? (
        <p className="text-sm italic text-gray-400">Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p className="text-sm italic text-gray-400">No tasks yet — add one below.</p>
      ) : (
        <ul className="space-y-1.5">
          {tasks.map((task) => (
            <li key={task.id} className="group flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={task.status === TaskStatus.DONE}
                onChange={() => toggleDone(task.id, task.status)}
                className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 accent-blue-600"
              />
              <span
                className={`flex-1 text-sm leading-snug ${
                  task.status === TaskStatus.DONE
                    ? 'text-gray-400 line-through'
                    : 'text-gray-700'
                }`}
              >
                {task.title}
              </span>
              <button
                onClick={() => deleteTask(task.id)}
                aria-label="Delete task"
                className="text-base leading-none text-gray-300 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Add task */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a task..."
          maxLength={500}
          className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!newTitle.trim() || isCreating}
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40"
        >
          {isCreating ? '...' : 'Add'}
        </button>
      </form>
    </div>
  );
}
