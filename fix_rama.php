<?php
require 'backend/config/env.php';
require 'backend/core/Database.php';
$db = Database::getConnection();

// Find Rama
$stmt = $db->query("SELECT * FROM members WHERE name LIKE '%rama%'");
$member = $stmt->fetch();
if (!$member) {
    echo "Rama not found\n";
    exit;
}

echo "Member Rama: ID=" . $member['id'] . "\n";

// Find Rama's last session
$stmt = $db->prepare("SELECT * FROM rental_sessions WHERE member_id = ? ORDER BY id DESC LIMIT 1");
$stmt->execute([$member['id']]);
$session = $stmt->fetch();

if (!$session) {
    echo "No session found for Rama\n";
    exit;
}

echo "Session ID: " . $session['id'] . "\n";
echo "Planned End: " . $session['planned_end_time'] . "\n";
echo "Actual End: " . $session['end_time'] . "\n";

// Calculate diff
$plannedEnd = new DateTime($session['planned_end_time']);
$actualEnd = new DateTime($session['end_time']);
if ($plannedEnd > $actualEnd) {
    $diff = $actualEnd->diff($plannedEnd);
    $remainingMinutes = ($diff->days * 24 * 60) + ($diff->h * 60) + $diff->i;
    echo "Remaining Minutes: " . $remainingMinutes . "\n";
    
    // Update
    $stmt = $db->prepare("UPDATE members SET time_balance = time_balance + ? WHERE id = ?");
    $stmt->execute([$remainingMinutes, $member['id']]);
    echo "Successfully added " . $remainingMinutes . " minutes to Rama.\n";
} else {
    echo "No remaining minutes.\n";
}
