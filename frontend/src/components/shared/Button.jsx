export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  fullWidth = false,
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`btn btn--${variant} btn--${size} ${fullWidth ? 'btn--full' : ''}`}
    >
      {loading ? <span className="btn__spinner" aria-hidden="true" /> : children}
    </button>
  );
}
