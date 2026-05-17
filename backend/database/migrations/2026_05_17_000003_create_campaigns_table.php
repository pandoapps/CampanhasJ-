<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('campaigns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->text('message');
            $table->enum('status', ['draft', 'scheduled', 'sending', 'completed', 'paused'])->default('draft');
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->unsignedInteger('total_recipients')->default(0);
            $table->unsignedInteger('total_sent')->default(0);
            $table->unsignedInteger('total_failed')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('campaign_tag', function (Blueprint $table) {
            $table->foreignId('campaign_id')->constrained()->onDelete('cascade');
            $table->foreignId('tag_id')->constrained()->onDelete('cascade');
            $table->primary(['campaign_id', 'tag_id']);
        });

        Schema::create('campaign_deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')->constrained()->onDelete('cascade');
            $table->foreignId('contact_id')->constrained()->onDelete('cascade');
            $table->string('phone');
            $table->enum('status', ['pending', 'sent', 'delivered', 'failed'])->default('pending');
            $table->text('error_message')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('campaign_deliveries');
        Schema::dropIfExists('campaign_tag');
        Schema::dropIfExists('campaigns');
    }
};
