<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model
{
    use SoftDeletes;

    protected $fillable = ['project_id', 'user_id', 'title', 'description', 'deadline', 'priority', 'status'];

    public function project() {
        return $this->belongsTo(Project::class);
    }

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function reminders() {
        return $this->hasMany(TaskReminder::class);
    }
}