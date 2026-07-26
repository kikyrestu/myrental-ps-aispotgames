<?php

class SessionController
{
    public function index(Request $request): void
    {
        $model = new Session();
        $status = $request->input('status'); // ?status=ongoing
        ResponseHelper::success($model->all($status));
    }

    public function store(Request $request): void
    {
        $v = new Validator($request->all(), [
            'unit_id' => 'required|integer',
        ]);
        if (!$v->passes()) {
            ResponseHelper::validationError($v->errors());
            return;
        }

        // BUG 2 FIX: Cek shift aktif SEBELUM mulai sesi
        $kasirId = (int) $_SESSION['user_id'];
        $shiftModel = new Shift();
        if (!$shiftModel->current($kasirId)) {
            ResponseHelper::error('Anda harus membuka shift terlebih dahulu sebelum memulai sesi', 400);
            return;
        }

        $packageId = $request->input('package_id');
        $customDuration = $request->input('duration_minutes');

        if (!$packageId && !$customDuration) {
            ResponseHelper::error('Wajib pilih package_id atau isi duration_minutes custom', 422);
            return;
        }

        $data = $request->all();

        // kalau pakai package, ambil durasinya dari situ (biar konsisten sama harga)
        if ($packageId) {
            $pkgModel = new Package();
            $pkg = $pkgModel->find((int) $packageId);
            if (!$pkg) {
                ResponseHelper::error('Package tidak ditemukan', 422);
                return;
            }
            $data['duration_minutes'] = $pkg['duration_minutes'];
        }

        $useDeposit = filter_var($request->input('use_deposit_time', false), FILTER_VALIDATE_BOOLEAN);
        $memberId = $request->input('member_id');
        
        $depositMinutesToUse = 0;
        if ($useDeposit && $memberId) {
            $memberModel = new Member();
            $member = $memberModel->find($memberId);
            if ($member && $member['time_balance'] > 0) {
                $depositMinutesToUse = (int) $member['time_balance'];
                
                // Add the time to duration
                if (!isset($data['duration_minutes'])) {
                    $data['duration_minutes'] = 0;
                }
                $data['duration_minutes'] += $depositMinutesToUse;
                $data['deposit_time_used'] = $depositMinutesToUse;
                
                // Deduct the member's balance immediately
                $memberModel->deductTime($memberId, $depositMinutesToUse);
            }
        }

        try {
            $model = new Session();
            $session = $model->start($data, $_SESSION['user_id']);
            ResponseHelper::success($session, 'Sesi berhasil dimulai', 201);
        } catch (RuntimeException $e) {
            ResponseHelper::error($e->getMessage(), 422);
        }
    }

    public function extend(Request $request): void
    {
        $id = (int) $request->param('id');

        $v = new Validator($request->all(), [
            'extra_minutes' => 'required|integer',
        ]);
        if (!$v->passes()) {
            ResponseHelper::validationError($v->errors());
            return;
        }

        try {
            $model = new Session();
            $session = $model->extend($id, (int) $request->input('extra_minutes'));
            ResponseHelper::success($session, 'Sesi berhasil diperpanjang');
        } catch (RuntimeException $e) {
            ResponseHelper::error($e->getMessage(), 422);
        }
    }

    /**
     * Selesaikan sesi -> hitung total biaya -> catat transaksi otomatis.
     * (Diskon/promo nyusul di Fase 3 — di sini amount dihitung apa adanya dari tarif/paket.)
     */
    public function complete(Request $request): void
    {
        $id = (int) $request->param('id');
        $kasirId = (int) $_SESSION['user_id'];

        try {
            // Cek shift aktif (Wajib untuk menyelesaikan transaksi cash/qris dll masuk kas)
            $shiftModel = new Shift();
            $shift = $shiftModel->current($kasirId);
            if (!$shift) {
                ResponseHelper::error('Anda harus membuka shift terlebih dahulu untuk menyelesaikan sesi', 400);
                return;
            }

            $sessionModel = new Session();
            $session = $sessionModel->find($id);
            if (!$session) {
                ResponseHelper::notFound('Sesi tidak ditemukan');
                return;
            }

            // Assign member if requested and session doesn't have one
            $assignMemberId = $request->input('assign_member_id');
            if ($assignMemberId && empty($session['member_id'])) {
                $sessionModel->updateMember($id, $assignMemberId);
                $session['member_id'] = $assignMemberId; // Update local array for subsequent checks
            }

            $unitModel = new Unit();
            $unit = $unitModel->find($session['unit_id']);

            $package = null;
            if ($session['package_id']) {
                $pkgModel = new Package();
                $package = $pkgModel->find($session['package_id']);
            }

            // Jika Main Bebas (duration_minutes == 0), hitung durasi aktual yang berjalan saat ini
            $actualDuration = (int)$session['duration_minutes'];
            if ($actualDuration === 0) {
                $nowStr = date('Y-m-d H:i:s');
                $actualDuration = max(1, (int) round((strtotime($nowStr) - strtotime($session['start_time'])) / 60));
                $session['duration_minutes'] = $actualDuration;
            }

            $trxModel = new Transaction();
            $amount = $trxModel->calculateSessionAmount($session, $unit, $package);
            $discountAmount = 0;
            $promoId = null;

            // Ambil order produk di sesi ini
            $orderModel = new SessionOrder();
            $orders = $orderModel->getBySession($id);
            $ordersTotal = 0;
            $itemsForTrx = [];
            foreach ($orders as $o) {
                $ordersTotal += $o['subtotal'];
                $itemsForTrx[] = [
                    'product_id'        => $o['product_id'],
                    'item_name'         => $o['item_name'],
                    'qty'               => $o['qty'],
                    'unit_price'        => $o['unit_price'],
                    'is_stock_deducted' => true // Sudah dipotong saat order dibuat
                ];
            }

            // Handle Promo
            $promoCode = $request->input('promo_code');
            if ($promoCode) {
                $promoModel = new Promo();
                $promo = $promoModel->findByCode($promoCode);
                if ($promo) {
                    // BUG 3 FIX: Validasi tanggal promo saat dipakai
                    $now = date('Y-m-d H:i:s');
                    if (!empty($promo['valid_from']) && $promo['valid_from'] > $now) {
                        // Promo belum aktif — abaikan, jangan apply
                        $promo = null;
                    } elseif (!empty($promo['valid_until']) && $promo['valid_until'] < $now) {
                        // Promo sudah expired — abaikan, jangan apply
                        $promo = null;
                    }
                }
                if ($promo) {
                    // BUG 4 FIX: Cek min_amount
                    if (!empty($promo['min_amount']) && $amount < (float) $promo['min_amount']) {
                        // Tidak memenuhi minimum — abaikan promo
                        $promo = null;
                    }
                }
                if ($promo) {
                    $promoId = $promo['id'];
                    if ($promo['type'] === 'percentage') {
                        $discountAmount = $amount * ($promo['value'] / 100);
                    } else {
                        $discountAmount = (float) $promo['value'];
                    }
                    if ($discountAmount > $amount) {
                        $discountAmount = $amount;
                    }
                }
            }

            // Final Amount = (Rental Amount - Discount) + Total Order Produk
            $finalAmount = ($amount - $discountAmount) + $ordersTotal;
            
            $memberModel = new Member();
            $paymentMethod = $request->input('payment_method', 'cash');
            $saveTime = filter_var($request->input('save_time', false), FILTER_VALIDATE_BOOLEAN);
            
            // 1. Handle Payment with Deposit
            if ($paymentMethod === 'deposit') {
                if (!$session['member_id']) {
                    ResponseHelper::error('Sesi ini tidak memiliki member, tidak bisa pakai deposit', 400);
                    return;
                }
                $member = $memberModel->find($session['member_id']);
                $minutesUsed = $session['duration_minutes'] + $session['extra_minutes'];
                if ($member['time_balance'] < $minutesUsed) {
                    ResponseHelper::error("Saldo waktu tidak cukup. Saldo: {$member['time_balance']} menit, Butuh: {$minutesUsed} menit", 400);
                    return;
                }
                
                // Potong saldo waktu
                $memberModel->deductTime($session['member_id'], $minutesUsed);
                
                // Bebaskan tagihan rental cash karena dibayar pakai waktu, tapi tetap harus bayar order produk
                $finalAmount = $ordersTotal;
            }

            // 2. Handle Save Remaining Time
            if ($saveTime && $session['member_id']) {
                // Hitung sisa waktu (planned_end_time - NOW)
                $plannedEnd = new DateTime($session['planned_end_time']);
                $now = new DateTime();
                if ($plannedEnd > $now) {
                    $diff = $now->diff($plannedEnd);
                    $remainingMinutes = ($diff->days * 24 * 60) + ($diff->h * 60) + $diff->i;
                    
                    if ($remainingMinutes > 0) {
                        $memberModel->addTime($session['member_id'], $remainingMinutes);
                    }
                }
            }

            $completed = $sessionModel->complete($id, $finalAmount, $promoId, $actualDuration);

            $trxModel->create([
                'session_id'     => $id,
                'shift_id'       => $shift['id'],
                'category'       => 'sewa',
                'payment_method' => $paymentMethod,
                'amount'         => $finalAmount,
                'discount_amount'=> $discountAmount,
                'notes'          => $paymentMethod === 'deposit' 
                    ? ($request->input('notes') ?: 'Dibayar dengan saldo deposit member')
                    : $request->input('notes'),
                'items'          => $itemsForTrx,
            ], $kasirId);

            // Handle Commission — dihitung dari rental amount SAJA (sebelum diskon),
            // TIDAK termasuk F&B, karena F&B bukan pendapatan dari unit PS pemilik.
            if (!empty($unit['owner_id']) && $unit['commission_rate'] > 0) {
                $commissionAmount = $amount * ($unit['commission_rate'] / 100);
                
                $commissionModel = new Commission();
                $commissionModel->create([
                    'session_id' => $id,
                    'unit_id'    => $unit['id'],
                    'owner_id'   => $unit['owner_id'],
                    'amount'     => $commissionAmount
                ]);
            }

            // Handle Kasbon / Piutang
            if ($paymentMethod === 'kasbon') {
                $debtModel = new Debt();
                $personName = $request->input('kasbon_person_name');
                if ($session['member_id']) {
                    $member = $memberModel->find($session['member_id']);
                    $personName = $member['name'] ?? 'Member ID ' . $session['member_id'];
                }
                
                if (!$personName) {
                    $personName = 'Guest (Belum diberi nama)';
                }

                $debtModel->create([
                    'type' => 'piutang',
                    'person_name' => $personName,
                    'description' => 'Kasbon sesi rental PS (Sesi #' . $id . ')',
                    'amount' => $finalAmount,
                    'kasir_id' => $kasirId
                ]);
            }

            ResponseHelper::success($completed, 'Sesi selesai, transaksi tercatat');
        } catch (RuntimeException $e) {
            ResponseHelper::error($e->getMessage(), 422);
        }
    }

    public function cancel(Request $request): void
    {
        $id = (int) $request->param('id');

        try {
            $model = new Session();
            
            // BUG 16 FIX: Kembalikan stok F&B yang sudah dipotong saat order
            $orderModel = new SessionOrder();
            $orders = $orderModel->getBySession($id);
            $productModel = new Product();
            foreach ($orders as $o) {
                if (!empty($o['product_id'])) {
                    $productModel->updateStock((int) $o['product_id'], (int) $o['qty']); // kembalikan stok (positif)
                }
            }

            // Refund deposit if any
            $session = $model->find($id);
            if ($session && !empty($session['deposit_time_used']) && !empty($session['member_id'])) {
                $memberModel = new Member();
                $memberModel->addTime($session['member_id'], (int) $session['deposit_time_used']);
            }
            
            $model->cancel($id);
            ResponseHelper::success(null, 'Sesi berhasil dibatalkan, stok F&B dan deposit dikembalikan');
        } catch (RuntimeException $e) {
            ResponseHelper::error($e->getMessage(), 422);
        }
    }
}
