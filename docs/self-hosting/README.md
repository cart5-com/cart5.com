# Self Hosting

## Create an Ubuntu Server

before starting, make sure you created whole environment variables
apps/.../.env\*\* files

1. Create an Ubuntu server.

- add firewall rules to disable all ports except 80, 443
- add a firewall rule to allow all ports from your IP

2. Update the server:

```bash
sudo apt update -qq
sudo apt upgrade --assume-yes
```

3. Setup swap:

```bash
# more details: https://www.digitalocean.com/community/tutorials/how-to-add-swap-space-on-ubuntu-22-04
sudo fallocate -l 10G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
sudo swapon --show
sudo cp /etc/fstab /etc/fstab.bak
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
cat /proc/sys/vm/swappiness
cat /proc/sys/vm/vfs_cache_pressure
sudo sysctl vm.swappiness=10
sudo sysctl vm.vfs_cache_pressure=50

# make swap settings permanent
sudo cp /etc/sysctl.conf /etc/sysctl.conf.bak
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
echo 'vm.vfs_cache_pressure=50' | sudo tee -a /etc/sysctl.conf
# cat /etc/sysctl.conf # check last 2 lines if added

# check swap
free -h
sudo swapon --show
```

4. Install caddy:

```bash
# https://caddyserver.com/docs/install#debian-ubuntu-raspbian
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy

# EDIT config if required
# sudo nano /etc/caddy/Caddyfile

# Reload caddy service command
# sudo systemctl reload caddy
```

5. Install xcaddy:

```bash
sudo systemctl stop caddy
# install go https://go.dev/wiki/Ubuntu
sudo add-apt-repository ppa:longsleep/golang-backports -y
sudo apt update
sudo apt install golang-go -y

# install xcaddy https://github.com/caddyserver/xcaddy/?tab=readme-ov-file#install
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/xcaddy/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-xcaddy-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/xcaddy/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-xcaddy.list
sudo apt update
sudo apt install xcaddy -y

# install caddy-ratelimit https://github.com/mholt/caddy-ratelimit
# it takes a while to build ⏳🥲
xcaddy build --with github.com/mholt/caddy-ratelimit

# replace old caddy with new caddy
sudo mv /usr/bin/caddy /usr/bin/caddy-old
sudo mv caddy /usr/bin/caddy

# sudo systemctl start caddy
# sudo systemctl reload caddy
# sudo ufw allow 80 && sudo ufw allow 443 # maybe required for xcaddy
# sudo systemctl stop caddy
# ***Make sure caddy is stopped before coolify installation, coolify will start its own proxy.
```

6. Install coolify:

https://coolify.io/docs/installation

- stop coolify's proxy
- start turborepo app in coolify
- expose 3000,3001,3002 ports to caddy

7. Deploy caddy:

- deploy caddy: `pnpm caddy:deploy`
- start caddy if not started: `sudo systemctl start caddy`

8. Migrate database:

`pnpm prod:migrate`
