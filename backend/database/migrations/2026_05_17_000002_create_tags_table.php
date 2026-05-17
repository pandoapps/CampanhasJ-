<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tags', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('color', 10)->default('#FF6B00');
            $table->text('description')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('contact_tag', function (Blueprint $table) {
            $table->foreignId('contact_id')->constrained()->onDelete('cascade');
            $table->foreignId('tag_id')->constrained()->onDelete('cascade');
            $table->primary(['contact_id', 'tag_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contact_tag');
        Schema::dropIfExists('tags');
    }
};
