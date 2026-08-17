<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register user baru.
     * POST /api/auth/register
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name'  => 'required|string|max:100',
            'email' => 'nullable|email|unique:users,email',
            'phone' => 'nullable|string|max:20|unique:users,phone',
            'pin'   => 'required|string|min:6|max:6|regex:/^\d+$/',
        ]);

        if (empty($validated['email']) && empty($validated['phone'])) {
            return response()->json([
                'message' => 'Email atau nomor HP harus diisi.',
            ], 422);
        }

        // Generate unique iPay ID
        do {
            $ipayId = 'IPY' . strtoupper(substr(uniqid(), -7));
        } while (User::where('ipay_id', $ipayId)->exists());

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'] ?? null,
            'phone'    => $validated['phone'] ?? null,
            'ipay_id'  => $ipayId,
            'pin_hash' => Hash::make($validated['pin']),
            'balance'  => 0,
        ]);

        $token = $user->createToken('ipay-token')->plainTextToken;

        return response()->json([
            'message' => 'Registrasi berhasil.',
            'user'    => $this->formatUser($user),
            'token'   => $token,
        ], 201);
    }

    /**
     * Login dengan email/phone + PIN.
     * POST /api/auth/login
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'identifier' => 'required|string', // email, phone, atau ipay_id
            'pin'        => 'required|string',
        ]);

        $identifier = $validated['identifier'];

        // Cari user berdasarkan email, phone, atau ipay_id
        $user = User::where('email', $identifier)
            ->orWhere('phone', $identifier)
            ->orWhere('ipay_id', $identifier)
            ->first();

        if (!$user || !$user->verifyPin($validated['pin'])) {
            throw ValidationException::withMessages([
                'identifier' => ['Identifier atau PIN salah.'],
            ]);
        }

        if (!$user->is_active) {
            return response()->json(['message' => 'Akun tidak aktif.'], 403);
        }

        // Hapus token lama, buat baru
        $user->tokens()->delete();
        $token = $user->createToken('ipay-token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil.',
            'user'    => $this->formatUser($user),
            'token'   => $token,
        ]);
    }

    /**
     * Logout — revoke token saat ini.
     * POST /api/auth/logout
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logout berhasil.']);
    }

    /**
     * Profil user yang sedang login.
     * GET /api/auth/me
     */
    public function me(Request $request)
    {
        return response()->json([
            'user' => $this->formatUser($request->user()),
        ]);
    }

    /**
     * Update profil (name, email, phone).
     * PUT /api/auth/profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'  => 'sometimes|string|max:100',
            'email' => 'sometimes|nullable|email|unique:users,email,' . $user->id,
            'phone' => 'sometimes|nullable|string|max:20|unique:users,phone,' . $user->id,
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profil berhasil diperbarui.',
            'user'    => $this->formatUser($user->fresh()),
        ]);
    }

    /**
     * Ganti PIN.
     * PUT /api/auth/pin
     */
    public function changePin(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'old_pin' => 'required|string',
            'new_pin' => 'required|string|min:6|max:6|regex:/^\d+$/',
        ]);

        if (!$user->verifyPin($validated['old_pin'])) {
            return response()->json(['message' => 'PIN lama salah.'], 422);
        }

        $user->update(['pin_hash' => Hash::make($validated['new_pin'])]);

        return response()->json(['message' => 'PIN berhasil diubah.']);
    }

    // ─── Private Helpers ─────────────────────────────────────────────

    private function formatUser(User $user): array
    {
        return [
            'id'         => $user->id,
            'name'       => $user->name,
            'email'      => $user->email,
            'phone'      => $user->phone,
            'ipay_id'    => $user->ipay_id,
            'balance'    => (float) $user->balance,
            'is_active'  => $user->is_active,
            'created_at' => $user->created_at,
        ];
    }
}
