<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            if (!Schema::hasColumn('articles', 'is_ever_trending')) {
                $table->boolean('is_ever_trending')->default(false)->after('views');
            }

            if (!Schema::hasColumn('articles', 'is_manual_trending')) {
                $table->boolean('is_manual_trending')->default(false)->after('is_ever_trending');
            }
        });
    }

    public function down(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            if (Schema::hasColumn('articles', 'is_manual_trending')) {
                $table->dropColumn('is_manual_trending');
            }

            if (Schema::hasColumn('articles', 'is_ever_trending')) {
                $table->dropColumn('is_ever_trending');
            }
        });
    }
};