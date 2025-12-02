<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Services\TaskService;

class TaskController extends Controller
{
    protected $service;

    public function __construct(TaskService $service)
    {
        $this->service = $service;
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'project_id' => 'required|integer|exists:projects,id',
            'user_id' => 'required|integer|exists:users,id',
            'title' => 'required|string',
            'description' => 'nullable|string',
            'deadline' => 'nullable|date',
            'priority' => 'required|in:low,medium,high',
            'status' => 'required|in:pending,in_progress,completed,overdue',
            'reminders' => 'nullable|array'
        ]);

        $task = $this->service->createTask($data);

        return response()->json($task);
    }

    public function index(Request $request)
    {
        $projectId = $request->query('project_id');
        $tasks = $projectId ? $this->service->getTasksByProject($projectId) 
            : $this->service->getAllTasks();

        return response()->json($tasks);
    }

    public function update(Request $request, Task $task)
    {
        $data = $request->validate([
            'project_id' => 'sometimes|integer|exists:projects,id',
            'user_id' => 'sometimes|integer|exists:users,id',
            'title' => 'sometimes|string',
            'description' => 'nullable|string',
            'deadline' => 'nullable|date',
            'priority' => 'sometimes|in:low,medium,high',
            'status' => 'sometimes|in:pending,in_progress,completed,overdue',
            'reminders' => 'nullable|array'
        ]);

        $updatedTask = $this->service->updateTask($task, $data);

        return response()->json($updatedTask);
    }

    public function destroy(Task $task)
    {
        $task->delete();
        return response()->json(['message' => 'Task deleted successfully']);
    }

    public function share(Request $request, Task $task)
    {
        $task->load('project');

        if ($task->project->is_private) {
            return response()->json([
                'message' => 'Cannot share task. The project must be public to share tasks.',
                'error' => 'project_not_public'
            ], 403);
        }

        return response()->json([
            'message' => 'Task shared successfully',
            'task' => $task,
            'project' => $task->project
        ]);
    }
}