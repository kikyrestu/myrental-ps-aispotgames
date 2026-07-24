<?php

class Settings
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function getAll(): array
    {
        $stmt = $this->db->query("SELECT setting_key, setting_value, description FROM settings");
        $results = $stmt->fetchAll();
        $settings = [];
        foreach ($results as $row) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }
        return $settings;
    }

    public function get(string $key, $default = null)
    {
        $stmt = $this->db->prepare("SELECT setting_value FROM settings WHERE setting_key = ?");
        $stmt->execute([$key]);
        $result = $stmt->fetch();
        return $result ? $result['setting_value'] : $default;
    }

    public function update(array $settings): void
    {
        $stmt = $this->db->prepare("UPDATE settings SET setting_value = ? WHERE setting_key = ?");
        foreach ($settings as $key => $value) {
            $stmt->execute([$value, $key]);
        }
    }
}
