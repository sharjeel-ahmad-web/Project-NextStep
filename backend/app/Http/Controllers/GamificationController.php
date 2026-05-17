<?php

namespace App\Http\Controllers;

use App\Models\UserStats;
use App\Models\User;
use Illuminate\Http\Request;

class GamificationController extends Controller
{
    /**
     * GET /api/gamification/leaderboard
     */
    public function getLeaderboard(Request $request)
    {
        $limit = (int) $request->query('limit', 10);

        $stats = UserStats::orderBy('xp', 'desc')
            ->limit($limit)
            ->get();

        $leaderboard = $stats->map(function ($stat, $index) {
            $user = User::find($stat->user_id);
            return [
                'rank'   => $index + 1,
                'name'   => $user?->name ?? 'Unknown',
                'avatar' => $user?->avatar ?? null,
                'xp'     => $stat->xp,
                'level'  => $stat->level,
                'streak' => $stat->streak,
            ];
        });

        return response()->json($leaderboard);
    }

    /**
     * GET /api/gamification/badges
     */
    public function getBadges(Request $request)
    {
        $stats = UserStats::forUser((string) $request->user()->_id);

        $badges = collect($stats->badges ?? [])->map(function ($badge) {
            return [
                'name'      => $badge,
                'icon'      => '🏆',
                'earned_at' => now()->toDateString(),
            ];
        });

        return response()->json($badges);
    }

    /**
     * GET /api/gamification/stats
     */
    public function getStats(Request $request)
    {
        $stats = UserStats::forUser((string) $request->user()->_id);

        return response()->json([
            'xp'           => $stats->xp,
            'level'        => $stats->level,
            'streak'       => $stats->streak,
            'badges_count' => count($stats->badges ?? []),
            'badges'       => $stats->badges ?? [],
            'xp_to_next'   => (($stats->level) * 100) - $stats->xp,
            'last_active'  => $stats->last_active,
        ]);
    }
}
