<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        // 1. Validate the incoming request
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        // 2. Attempt to authenticate
        if (Auth::attempt($request->only('email', 'password'))) {
            $user = Auth::user();

            // 3. Generate the Sanctum API Token
            $token = $user->createToken('SPUD_Capiz_Token')->plainTextToken;

            return response()->json([
                'status' => 'success',
                'message' => 'Logged in successfully',
                'token' => $token,
                'user' => $user
            ], 200);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Invalid email or password'
        ], 401);
    }

    public function logout(Request $request)
    {
        // Revoke the current user's token
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Logged out successfully'
        ], 200);
    }
}
