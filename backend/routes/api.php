<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\WalletController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| iPay API Routes
|--------------------------------------------------------------------------
*/

// Health check
Route::get('/health', fn() => response()->json(['status' => 'ok', 'app' => 'iPay API', 'version' => '1.0']));

// ─── Auth (public) ────────────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

// ─── Protected Routes ─────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('/logout',   [AuthController::class, 'logout']);
        Route::get('/me',        [AuthController::class, 'me']);
        Route::put('/profile',   [AuthController::class, 'updateProfile']);
        Route::put('/pin',       [AuthController::class, 'changePin']);
    });

    // Wallet
    Route::prefix('wallet')->group(function () {
        Route::get('/',                [WalletController::class, 'balance']);
        Route::get('/methods',         [WalletController::class, 'paymentMethods']);
        Route::post('/methods',        [WalletController::class, 'addPaymentMethod']);
        Route::delete('/methods/{id}', [WalletController::class, 'deletePaymentMethod']);
        Route::post('/topup',          [WalletController::class, 'topUp']);
        Route::get('/topup/history',   [WalletController::class, 'topUpHistory']);
    });

    // Transactions
    Route::prefix('transactions')->group(function () {
        Route::get('/',                          [TransactionController::class, 'index']);
        Route::post('/transfer',                 [TransactionController::class, 'transfer']);
        Route::get('/check-user/{ipay_id}',      [TransactionController::class, 'checkUser']);
        Route::get('/{code}',                    [TransactionController::class, 'show']);
    });

    // Payments (Request & Pay)
    Route::prefix('payments')->group(function () {
        Route::post('/request',      [PaymentController::class, 'createRequest']);
        Route::post('/pay-direct',   [PaymentController::class, 'payDirect']);
        Route::get('/incoming',      [PaymentController::class, 'incoming']);
        Route::get('/outgoing',      [PaymentController::class, 'outgoing']);
        Route::get('/{id}',          [PaymentController::class, 'show']);
        Route::post('/{id}/pay',     [PaymentController::class, 'pay']);
        Route::post('/{id}/reject',  [PaymentController::class, 'reject']);
        Route::post('/{id}/cancel',  [PaymentController::class, 'cancel']);
    });
});
