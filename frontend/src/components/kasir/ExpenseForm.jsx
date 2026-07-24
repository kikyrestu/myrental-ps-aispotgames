import { useState } from 'react';
import { api } from '../../api/client';
import { TrendingDown } from 'lucide-react';
import Button from '../shared/Button';

export default function ExpenseForm() {
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || !amount) return;
    setSubmitting(true);
    try {
      await api.post('/expenses', { category, description, amount });
      setCategory('');
      setDescription('');
      setAmount('');
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal catat pengeluaran. Pastikan shift sudah dibuka.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="expense-panel">
      <div className="expense-panel__header">
        <span className="expense-panel__icon"><TrendingDown size={16} /></span>
        <h3>Catat Pengeluaran</h3>
      </div>
      <form className="form" onSubmit={handleSubmit}>
        <label className="form__field">
          <span>Kategori</span>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Misal: Beli Galon, Token Listrik"
            required
          />
        </label>
        <label className="form__field">
          <span>Deskripsi (Opsional)</span>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Catatan tambahan"
          />
        </label>
        <label className="form__field">
          <span>Jumlah (Rp)</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="10000"
            required
          />
        </label>
        <Button type="submit" variant="primary" fullWidth loading={submitting}>
          Simpan Pengeluaran
        </Button>
      </form>
    </div>
  );
}
