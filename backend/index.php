<?php

require_once __DIR__ . '/config/env.php';
require_once __DIR__ . '/controllers/ReportController.php';
require_once __DIR__ . '/controllers/MitraController.php';
require_once __DIR__ . '/controllers/DebtController.php';
require_once __DIR__ . '/controllers/FixedExpenseController.php';
require_once __DIR__ . '/controllers/ProductCategoryController.php';
require_once __DIR__ . '/controllers/SettingsController.php';

date_default_timezone_set(env('APP_TIMEZONE', 'Asia/Jakarta'));

/**
 * Autoload sederhana — cari class di folder core/middleware/controllers/models/helpers.
 * Gak pakai namespace biar setup tetap "PHP native" tanpa composer.
 */
spl_autoload_register(function (string $class) {
    $dirs = ['core', 'middleware', 'controllers', 'models', 'helpers'];
    foreach ($dirs as $dir) {
        $file = __DIR__ . "/{$dir}/{$class}.php";
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});

// Session config — cookie lifetime ngikutin durasi shift kasir (default 8 jam)
$dbConfig = require __DIR__ . '/config/database.php';
session_set_cookie_params([
    'lifetime' => $dbConfig['session_lifetime'],
    'path'     => '/',
    'samesite' => 'Lax', // pakai 'None' + secure kalau frontend & backend beda domain via HTTPS
]);
session_start();

$reportController = new ReportController();
$mitraController = new MitraController();

CorsMiddleware::handle();

$request = new Request();
$router = new Router();

// ---------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------
$router->post('/api/auth/login', [AuthController::class, 'login']);
$router->post('/api/auth/logout', [AuthController::class, 'logout'], ['auth']);
$router->get('/api/auth/me', [AuthController::class, 'me']); // dipakai frontend cek session aktif

// ---------------------------------------------------------------------
// Units
// ---------------------------------------------------------------------
$router->get('/api/units', [UnitController::class, 'index'], ['auth']);
$router->post('/api/units', [UnitController::class, 'store'], ['admin']);
$router->put('/api/units/{id}', [UnitController::class, 'update'], ['admin']);
$router->delete('/api/units/{id}', [UnitController::class, 'destroy'], ['admin']);
$router->patch('/api/units/{id}/status', [UnitController::class, 'updateStatus'], ['auth']);

// ---------------------------------------------------------------------
// Console Types
// ---------------------------------------------------------------------
$router->get('/api/console-types', [ConsoleTypeController::class, 'index'], ['auth']);
$router->post('/api/console-types', [ConsoleTypeController::class, 'store'], ['admin']);
$router->put('/api/console-types/{id}', [ConsoleTypeController::class, 'update'], ['admin']);
$router->delete('/api/console-types/{id}', [ConsoleTypeController::class, 'destroy'], ['admin']);

// ---------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------
$router->get('/api/sessions', [SessionController::class, 'index'], ['auth']);
$router->post('/api/sessions', [SessionController::class, 'store'], ['auth']);
$router->put('/api/sessions/{id}/extend', [SessionController::class, 'extend'], ['auth']);
$router->put('/api/sessions/{id}/complete', [SessionController::class, 'complete'], ['auth']);
$router->delete('/api/sessions/{id}', [SessionController::class, 'cancel'], ['auth']);

// ---------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------
$router->get('/api/transactions', [TransactionController::class, 'index'], ['auth']);
$router->get('/api/transactions/{id}', [TransactionController::class, 'show'], ['auth']);
$router->post('/api/transactions', [TransactionController::class, 'store'], ['auth']);

// ---------------------------------------------------------------------
// Packages
// ---------------------------------------------------------------------
$router->get('/api/packages', [PackageController::class, 'index'], ['auth']);
$router->post('/api/packages', [PackageController::class, 'store'], ['admin']);
$router->put('/api/packages/{id}', [PackageController::class, 'update'], ['admin']);
$router->delete('/api/packages/{id}', [PackageController::class, 'destroy'], ['admin']);

// ---------------------------------------------------------------------
// Promos
// ---------------------------------------------------------------------
$router->get('/api/promos', [PromoController::class, 'index'], ['auth']);
$router->post('/api/promos', [PromoController::class, 'store'], ['admin']);
$router->put('/api/promos/{id}', [PromoController::class, 'update'], ['admin']);
$router->delete('/api/promos/{id}', [PromoController::class, 'destroy'], ['admin']);
$router->post('/api/promos/validate', [PromoController::class, 'validatePromo'], ['auth']);

// ---------------------------------------------------------------------
// Shifts
// ---------------------------------------------------------------------
$router->get('/api/shifts/current', [ShiftController::class, 'current'], ['auth']);
$router->post('/api/shifts/open', [ShiftController::class, 'open'], ['auth']);
$router->post('/api/shifts/close', [ShiftController::class, 'close'], ['auth']);
$router->post('/api/shifts/force-close', [ShiftController::class, 'forceClose'], ['admin']);

// ---------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------
$router->get('/api/settings', [SettingsController::class, 'get'], ['auth']);
$router->put('/api/settings', [SettingsController::class, 'update'], ['admin']);

// ---------------------------------------------------------------------
// Expenses
// ---------------------------------------------------------------------
$router->get('/api/expenses', [ExpenseController::class, 'index'], ['auth']);
$router->post('/api/expenses', [ExpenseController::class, 'store'], ['auth']);

// ---------------------------------------------------------------------
// Members
// ---------------------------------------------------------------------
$router->get('/api/members', [MemberController::class, 'index'], ['auth']);
$router->post('/api/members', [MemberController::class, 'store'], ['auth']); // Kasir can add members
$router->put('/api/members/{id}', [MemberController::class, 'update'], ['auth']);
$router->post('/api/members/{id}/add-time', [MemberController::class, 'addTime'], ['auth']);

// ---------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------
$router->get('/api/reports/daily', [ReportController::class, 'daily'], ['admin']);
$router->get('/api/reports/dashboard', [$reportController, 'dashboard'], ['auth']);

// ---------------------------------------------------------------------
// Mitra
// ---------------------------------------------------------------------
$router->get('/api/mitra/dashboard', [$mitraController, 'dashboard'], ['auth']);

// ---------------------------------------------------------------------
// Owners & Commissions (Bagi Hasil)
// ---------------------------------------------------------------------
$router->get('/api/owners', [OwnerController::class, 'index'], ['admin']);
$router->post('/api/owners', [OwnerController::class, 'store'], ['admin']);
$router->put('/api/owners/{id}', [OwnerController::class, 'update'], ['admin']);
$router->delete('/api/owners/{id}', [OwnerController::class, 'destroy'], ['admin']);

$router->get('/api/commissions', [CommissionController::class, 'index'], ['admin']);
$router->get('/api/commissions/{ownerId}', [CommissionController::class, 'details'], ['admin']);
$router->post('/api/commissions/{ownerId}/pay', [CommissionController::class, 'pay'], ['admin']);

// ---------------------------------------------------------------------
// Products & Stocks
// ---------------------------------------------------------------------
$router->get('/api/product-categories', [ProductCategoryController::class, 'index'], ['auth']);
$router->post('/api/product-categories', [ProductCategoryController::class, 'create'], ['admin']);
$router->put('/api/product-categories/{id}', [ProductCategoryController::class, 'update'], ['admin']);
$router->delete('/api/product-categories/{id}', [ProductCategoryController::class, 'destroy'], ['admin']);

$router->get('/api/products', [ProductController::class, 'index'], ['auth']);
$router->post('/api/products', [ProductController::class, 'store'], ['admin']);
$router->put('/api/products/{id}', [ProductController::class, 'update'], ['admin']);
$router->delete('/api/products/{id}', [ProductController::class, 'destroy'], ['admin']);

$router->get('/api/stocks', [StockController::class, 'index'], ['admin']);
$router->post('/api/stocks', [StockController::class, 'store'], ['admin']);

// ---------------------------------------------------------------------
// Session Orders (Adding items to running sessions)
// ---------------------------------------------------------------------
$router->get('/api/sessions/{sessionId}/orders', [SessionOrderController::class, 'index'], ['auth']);
$router->post('/api/sessions/{sessionId}/orders', [SessionOrderController::class, 'store'], ['auth']);

// ---------------------------------------------------------------------
// Debts & Receivables
// ---------------------------------------------------------------------
$router->get('/api/debts', [DebtController::class, 'index'], ['auth']);
$router->post('/api/debts', [DebtController::class, 'store'], ['auth']);
$router->put('/api/debts/{id}/pay', [DebtController::class, 'pay'], ['auth']);
$router->delete('/api/debts/{id}', [DebtController::class, 'destroy'], ['auth']);

// ---------------------------------------------------------------------
// Fixed Expenses (Operasional)
// ---------------------------------------------------------------------
$router->get('/api/fixed-expenses', [FixedExpenseController::class, 'index'], ['auth']);
$router->post('/api/fixed-expenses', [FixedExpenseController::class, 'store'], ['auth']);
$router->delete('/api/fixed-expenses/{id}', [FixedExpenseController::class, 'destroy'], ['auth']);

$router->dispatch($request);
