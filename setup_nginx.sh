#!/bin/bash

DOMAIN="aispotgames.my.id"
PORT="9485"
CONF_FILE="/etc/nginx/sites-available/$DOMAIN"

echo "=================================================="
echo " Setup Nginx Reverse Proxy for $DOMAIN"
echo "=================================================="

# Check if script is run as root
if [ "$EUID" -ne 0 ]; then
  echo "❌ Error: Script ini harus dijalankan pakai sudo/root brok!"
  echo "Coba jalanin: sudo ./setup_nginx.sh"
  exit 1
fi

echo "[1/4] Membuat konfigurasi Nginx..."
cat <<EOF > $CONF_FILE
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
echo "✔ File konfigurasi berhasil dibuat di $CONF_FILE"

echo "[2/4] Bikin symlink ke sites-enabled..."
ln -sf $CONF_FILE /etc/nginx/sites-enabled/
echo "✔ Symlink berhasil."

echo "[3/4] Nge-test config Nginx..."
nginx -t
if [ $? -ne 0 ]; then
    echo "❌ Error: Ada yang salah sama config Nginx lu brok! Cek pesan error di atas."
    exit 1
fi
echo "✔ Config aman."

echo "[4/4] Reload Nginx..."
systemctl reload nginx
echo "✔ Nginx berhasil di-reload."

echo "=================================================="
echo "🎉 DONE! Web lu sekarang udah bisa diakses di:"
echo "👉 http://$DOMAIN"
echo "=================================================="
