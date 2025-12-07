<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Project;
use App\Http\Controllers\Controller;
use App\Services\ProjectService;

class ProjectController extends Controller
{
    protected $service;

    public function __construct(ProjectService $service)
    {
        $this->service = $service;
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_private' => 'required|boolean',
        ]);

        $project = $this->service->createProject($request->user()->id, $data);

        return response()->json($project, 201);
    }

    public function copy(Request $request)
    {
        $data = $request->validate([
            'project_id' => 'required|integer|exists:projects,id',
        ]);

        $project = Project::findOrFail($data['project_id']);

        $newProject = $this->service->copyProject($project, $request->user()->id);
        return response()->json($newProject, 201);
    }

    public function index(Request $request)
    {
        $userId = $request->query('user_id');

        $query = Project::query();

        if ($userId) {
            $query->where('user_id', $userId);
        }

        $projects = $query->get();

        return response()->json($projects);
    }

    public function show(Request $request, Project $project)
    {
        // If project is private, only the owner can view it
        if (!empty($project->is_private)) {
            $user = $request->user();
            if (!$user || $user->id !== $project->user_id) {
                return response()->json([
                    'message' => 'Project is private',
                    'error' => 'project_private'
                ], 403);
            }
        }

        return response()->json($project);
    }

    public function share(Request $request, Project $project)
    {
        if ($project->is_private) {
            return response()->json([
                'message' => 'Cannot share project. The project must be public to share.',
                'error' => 'project_not_public'
            ], 403);
        }

        return response()->json([
            'message' => 'Project shared successfully',
            'project' => $project,
            'share_link' => url('/shared/project/' . $project->id)
        ]);
    }

    public function update(Request $request, Project $project)
    {
        $data = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'is_private' => 'nullable|boolean',
        ]);

        $updated = $this->service->updateProject($project, $data);

        return response()->json($updated);
    }

    public function destroy(Request $request, Project $project)
    {
        $project->delete();
        return response()->json(['message' => 'Project deleted successfully']);
    }
}