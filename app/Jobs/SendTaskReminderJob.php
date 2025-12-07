<?php

namespace App\Jobs;

use App\Models\TaskReminder;
use App\Services\MessagingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendTaskReminderJob implements ShouldQueue
{
    use InteractsWithQueue, Queueable, SerializesModels;

    protected $reminderId;

    public function __construct(int $reminderId)
    {
        $this->reminderId = $reminderId;
    }

    public function handle()
    {
        // Re-fetch the reminder so we operate on the current DB state
        $reminder = TaskReminder::with(['task.user'])->find($this->reminderId);
        if (!$reminder) {
            // Reminder was deleted or no longer exists — nothing to do
            return;
        }

        // If already sent, skip
        if (!empty($reminder->is_sent)) {
            return;
        }

        $task = $reminder->task;
        $user = $task->user ?? null;
        if (!$task || !$user || empty($user->email)) {
            return;
        }

        $subject = 'Pengingat Tugas: ' . ($task->title ?? 'Tugas Anda');
        $body = "Pengingat untuk tugas Anda:\n\n";
        $body .= "Judul: " . ($task->title ?? '') . "\n";
        $body .= "Deskripsi: " . ($task->description ?? '') . "\n";
        $body .= "Waktu Pengingat: " . ($reminder->remind_at ? $reminder->remind_at : '') . "\n";

        try {
            $messaging = new MessagingService();
            $messaging->sendEmail($user->email, $subject, $body);
        } catch (\Throwable $e) {
            // Don't mark as sent if sending failed; allow retry by queue
            return;
        }

        // Mark reminder as sent
        $reminder->is_sent = true;
        $reminder->save();
    }
}