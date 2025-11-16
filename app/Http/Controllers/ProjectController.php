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

    public function copy(Request $request, Project $project)
    {
        $newProject = $this->service->copyProject($project, $request->user()->id);
        return response()->json($newProject);
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
}