<?php

namespace App\Services;

use App\Models\Task;
use App\Models\TaskReminder;
use App\Jobs\SendTaskReminderJob;
use Carbon\Carbon;

class TaskService
{
    public function createTask(array $data): Task
    {
        $task = Task::create($data);

        if(isset($data['reminders'])) {
            // Parse client-local timestamps as Asia/Jakarta (UTC+7) and store/schedule in UTC
            $clientTz = 'Asia/Jakarta';
            foreach($data['reminders'] as $remindTime) {
                $remindAtLocal = Carbon::parse($remindTime, $clientTz);
                $remindAtUtc = $remindAtLocal->copy()->setTimezone('UTC');
                $reminder = TaskReminder::create([
                    'task_id' => $task->id,
                    'remind_at' => $remindAtLocal,
                    'is_sent' => false
                ]);

                // Schedule a job for this reminder if it's in the future (compare in UTC)
                try {
                    if ($remindAtUtc->isFuture()) {
                        dispatch((new SendTaskReminderJob($reminder->id))->delay($remindAtUtc));
                    }
                } catch (\Throwable $e) {
                    // If scheduling fails, continue — reminder still persisted
                }
            }
        }

        return $task;
    }

    public function getTasksByProject(int $projectId)
    {
        return Task::where('project_id', $projectId)->get();
    }

    public function getAllTasks()
    {
        return Task::all();
    }

    public function updateTask(Task $task, array $data)
    {
        $task->update($data);

        if (isset($data['reminders'])) {
            // Reset existing reminders
            $task->reminders()->delete();

            // Accept both array of timestamps (strings) and array of objects
            foreach ($data['reminders'] as $reminder) {
                if (is_array($reminder)) {
                    // If object-like input is provided, normalize keys
                    $remindAt = $reminder['remind_at'] ?? ($reminder['time'] ?? null);
                    if ($remindAt) {
                        $clientTz = 'Asia/Jakarta';
                        $remindAtLocal = Carbon::parse($remindAt, $clientTz);
                        $remindAtUtc = $remindAtLocal->copy()->setTimezone('UTC');
                        $created = $task->reminders()->create([
                            'remind_at' => $remindAtUtc,
                            'is_sent' => (bool)($reminder['is_sent'] ?? false),
                        ]);
                        try {
                            if ($remindAtUtc->isFuture()) {
                                dispatch((new SendTaskReminderJob($created->id))->delay($remindAtUtc));
                            }
                        } catch (\Throwable $e) {
                            // ignore scheduling errors
                        }
                    }
                } else {
                    // If plain timestamp string provided
                    $clientTz = 'Asia/Jakarta';
                    $remindAtLocal = Carbon::parse($reminder, $clientTz);
                    $remindAtUtc = $remindAtLocal->copy()->setTimezone('UTC');
                    $created = $task->reminders()->create([
                        'remind_at' => $remindAtUtc,
                        'is_sent' => false,
                    ]);
                    try {
                        if ($remindAtUtc->isFuture()) {
                            dispatch((new SendTaskReminderJob($created->id))->delay($remindAtUtc));
                        }
                    } catch (\Throwable $e) {
                        // ignore scheduling errors
                    }
                }
            }
        }

        return $task;
    }
}