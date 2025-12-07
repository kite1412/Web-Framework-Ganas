<?php

namespace App\Services;

use App\Models\Project;
use App\Models\ProjectCopyLog;
use App\Models\Task;
use App\Models\TaskReminder;
use App\Jobs\SendTaskReminderJob;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ProjectService
{
    public function createProject(int $userId, array $data): Project
    {
        $data['user_id'] = $userId;
        return Project::create($data);
    }
    
    public function copyProject(Project $project, int $userId): Project
    {
        // Perform copy inside a transaction to ensure consistency when copying tasks
        return DB::transaction(function () use ($project, $userId) {
            $newProject = $project->replicate();
            $newProject->user_id = $userId;
            $newProject->title .= " (Copy)";
            $newProject->save();

            // Copy non-deleted tasks from original project to the new project
            $tasks = Task::where('project_id', $project->id)->whereNull('deleted_at')->get();
            foreach ($tasks as $task) {
                $newTask = $task->replicate();
                $newTask->project_id = $newProject->id;
                $newTask->save();

                // Copy reminders for the task (non-deleted reminders)
                try {
                    $reminders = $task->reminders()->whereNull('deleted_at')->get();
                    foreach ($reminders as $rem) {
                        $newRem = $rem->replicate();
                        $newRem->task_id = $newTask->id;
                        // reset is_sent for copied reminders
                        $newRem->is_sent = false;
                        $newRem->save();
                        // schedule a reminder job for the copied reminder if it's in the future
                        try {
                            $remindAt = $newRem->remind_at;
                            if ($remindAt) {
                                dispatch((new SendTaskReminderJob($newRem->id))->delay($remindAt));
                            }
                        } catch (\Throwable $e) {
                            // ignore scheduling errors
                        }
                    }
                } catch (\Throwable $e) {
                    // ignore reminder copy failures but continue
                }
            }

            return $newProject;
        });
    }

    public function updateProject(Project $project, array $data): Project
    {
        // Only allow updatable fields
        $fields = [
            'title',
            'description',
            'is_private',
        ];

        foreach ($fields as $field) {
            if (array_key_exists($field, $data)) {
                $project->{$field} = $data[$field];
            }
        }

        $project->save();

        return $project->fresh();
    }
}