<?php

namespace App\Services;

use App\Models\Task;
use App\Models\TaskReminder;
use Carbon\Carbon;

class TaskService
{
    public function createTask(array $data): Task
    {
        $task = Task::create($data);

        if(isset($data['reminders'])) {
            foreach($data['reminders'] as $remindTime) {
                TaskReminder::create([
                    'task_id' => $task->id,
                    'remind_at' => Carbon::parse($remindTime),
                    'is_sent' => false
                ]);
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
                        $task->reminders()->create([
                            'remind_at' => Carbon::parse($remindAt),
                            'is_sent' => (bool)($reminder['is_sent'] ?? false),
                        ]);
                    }
                } else {
                    // If plain timestamp string provided
                    $task->reminders()->create([
                        'remind_at' => Carbon::parse($reminder),
                        'is_sent' => false,
                    ]);
                }
            }
        }

        return $task;
    }
}