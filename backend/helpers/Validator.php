<?php

/**
 * Validator sederhana, mirip gaya Laravel tapi native.
 *
 * Contoh:
 *   $v = new Validator($request->all(), [
 *       'name'  => 'required|string|max:50',
 *       'price' => 'required|numeric',
 *       'role'  => 'required|in:admin,kasir',
 *   ]);
 *   if (!$v->passes()) { Response::json(['success'=>false,'errors'=>$v->errors()], 422); return; }
 */
class Validator
{
    private array $data;
    private array $rules;
    private array $errors = [];

    public function __construct(array $data, array $rules)
    {
        $this->data = $data;
        $this->rules = $rules;
    }

    public function passes(): bool
    {
        foreach ($this->rules as $field => $ruleString) {
            $rules = explode('|', $ruleString);
            $value = $this->data[$field] ?? null;

            foreach ($rules as $rule) {
                $this->applyRule($field, $value, $rule);
            }
        }

        return empty($this->errors);
    }

    public function errors(): array
    {
        return $this->errors;
    }

    private function applyRule(string $field, $value, string $rule): void
    {
        if ($rule === 'required') {
            if ($value === null || $value === '') {
                $this->addError($field, "Field {$field} wajib diisi");
            }
            return;
        }

        // skip rule lain kalau value kosong dan bukan required (biar 'nullable' behaviour)
        if ($value === null || $value === '') {
            return;
        }

        if ($rule === 'string') {
            if (!is_string($value)) {
                $this->addError($field, "Field {$field} harus berupa teks");
            }
            return;
        }

        if ($rule === 'numeric') {
            if (!is_numeric($value)) {
                $this->addError($field, "Field {$field} harus berupa angka");
            }
            return;
        }

        if ($rule === 'integer') {
            if (filter_var($value, FILTER_VALIDATE_INT) === false) {
                $this->addError($field, "Field {$field} harus berupa bilangan bulat");
            }
            return;
        }

        if ($rule === 'email') {
            if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
                $this->addError($field, "Field {$field} harus email valid");
            }
            return;
        }

        if (str_starts_with($rule, 'max:')) {
            $max = (int) substr($rule, 4);
            if (is_string($value) && mb_strlen($value) > $max) {
                $this->addError($field, "Field {$field} maksimal {$max} karakter");
            }
            return;
        }

        if (str_starts_with($rule, 'min:')) {
            $min = (int) substr($rule, 4);
            if (is_numeric($value) && $value < $min) {
                $this->addError($field, "Field {$field} minimal {$min}");
            }
            return;
        }

        if (str_starts_with($rule, 'in:')) {
            $allowed = explode(',', substr($rule, 3));
            if (!in_array((string) $value, $allowed, true)) {
                $allowedStr = implode(', ', $allowed);
                $this->addError($field, "Field {$field} harus salah satu dari: {$allowedStr}");
            }
            return;
        }
    }

    private function addError(string $field, string $message): void
    {
        $this->errors[$field][] = $message;
    }
}
