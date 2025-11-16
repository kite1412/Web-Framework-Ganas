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

        if(isset($data['reminders'])) {
            $task->reminders()->delete();
            foreach($data['reminders'] as $reminderData) {
                $task->reminders()->create($reminderData);
            }
        }

        return $task;
    }
}