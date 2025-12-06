<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TaskReminder extends Model
{
    use SoftDeletes;

    protected $fillable = ['task_id', 'remind_at', 'is_sent', 'sent_at'];

    public function task() {
        return $this->belongsTo(Task::class);
    }
}