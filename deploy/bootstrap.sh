#!/bin/sh
set -eu
test "$(id -u)" = 0
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y nginx ca-certificates curl xz-utils sqlite3 python3-venv
if ! id apower >/dev/null 2>&1; then useradd --system --home /var/lib/apower --shell /usr/sbin/nologin apower; fi
install -d -o apower -g apower -m 750 /var/lib/apower /var/lib/apower/uploads
install -d -m 700 /var/backups/apower
install -d -m 755 /opt/apower/releases /var/www/apower-acme
if ! test -x /opt/node24/bin/node; then
  apower_download_dir=$(mktemp -d /tmp/apower-node.XXXXXX)
  cd "$apower_download_dir"
  curl -fSLO --retry 3 https://nodejs.org/dist/v24.15.0/node-v24.15.0-linux-x64.tar.xz
  curl -fSLO --retry 3 https://nodejs.org/dist/v24.15.0/SHASUMS256.txt
  sed -n '/ node-v24.15.0-linux-x64.tar.xz$/p' SHASUMS256.txt | sha256sum -c -
  tar -xf node-v24.15.0-linux-x64.tar.xz
  mv node-v24.15.0-linux-x64 /opt/node24
fi
if ! test -x /opt/certbot/bin/certbot; then
  python3 -m venv /opt/certbot
  /opt/certbot/bin/pip install 'certbot>=5.4,<6'
fi
/opt/node24/bin/node --version
/opt/certbot/bin/certbot --version
