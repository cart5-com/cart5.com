#!/bin/bash

# ========================================================================
# Ubuntu Server Setup Script
# ========================================================================
# This script performs the following setup tasks:
# 1. System Updates
#    - Updates and upgrades system packages
#    - Installs basic utilities (if required)
#
# 2. Swap Configuration (10GB)
#    - Creates and configures swap file
#    - Optimizes swap settings (swappiness=10, cache_pressure=50)
#
# 3. Web Server Setup
#    - Installs Caddy web server
#    - Installs xCaddy with rate-limit plugin
#
# 4. Tools: nvm, node, pnpm, pm2
#    - Installs Node.js via nvm (v22.12.0)
#    - Installs pnpm package manager
#    - Installs PM2 process manager
#    - Configures PM2 log rotation (max 1GB)
#
# 5. System Configuration
#    - Creates symbolic links for Ansible compatibility
#    - Sets up PM2 startup service
# ========================================================================



# ========================================================================
# 1. System Updates
# ========================================================================
sudo apt update -qq
sudo apt upgrade --assume-yes
# sudo apt-get install --assume-yes wget curl  unzip tree
# ========================================================================
# NETWORKING
# make instance static ip
# allow 80, 443 ports from all
# restrict ssh to your ip
# check ipv6 open ports, restrict ssh if open
# ========================================================================






# ========================================================================
# 2. Swap Configuration (10GB)
# ========================================================================
# setup swap
# https://www.digitalocean.com/community/tutorials/how-to-add-swap-space-on-ubuntu-22-04
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
# ========================================================================







# ========================================================================
# 3. Web Server Setup
# ========================================================================
# ================================INSTALL CADDY===========================
# install caddy
# ubuntu 22.04 commands to setup server
# firewall allow 80, 443 ports for caddy # not required caddy handles them all
sudo apt update
# ========================================================================
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy

# EDIT config if required
# sudo nano /etc/caddy/Caddyfile

# Reload caddy service command
# sudo systemctl reload caddy
# ========================================================================




# ================================INSTALL XCADDY==========================
# stop caddy
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
# and cache plugin https://github.com/darkweak/souin/plugins/caddy
# it takes a while to build ⏳🥲
xcaddy build --with github.com/mholt/caddy-ratelimit --with github.com/darkweak/souin/plugins/caddy --with github.com/caddy-dns/cloudflare
# # CF_API_TOKEN permissions from cloudflare: (Zone.Zone, Zone.DNS) for All zones
# TODO: configure prod caddy to use cloudflare dns for wildcard subdomains
# https://caddyserver.com/docs/automatic-https#wildcard-certificates
# https://caddyserver.com/docs/caddyfile/patterns#wildcard-certificates
# https://caddyserver.com/docs/automatic-https#dns-challenge
# https://caddy.community/t/how-to-use-dns-provider-modules-in-caddy-2/8148
# https://github.com/caddy-dns/cloudflare

# replace old caddy with new caddy
sudo mv /usr/bin/caddy /usr/bin/caddy-old
sudo mv caddy /usr/bin/caddy

sudo systemctl start caddy
# see logs
# journalctl -f -u caddy

# cert path: /var/lib/caddy/.local/share/caddy/config/config.json

# sudo systemctl reload caddy
# sudo ufw allow 80 && sudo ufw allow 443 # maybe required for xcaddy
# ========================================================================



# ========================================================================
# 4. Tools: nvm, node, pnpm, pm2
# ========================================================================
# https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-22-04
# install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# nvm install --lts
nvm install 22.12.0
# ========================================================================



# ========================================================================
# pnpm 9.15.2
npm install -g pnpm
pnpm setup
# ========================================================================



# ========================================================================
npm install -g pm2
pm2 install pm2-logrotate
# ========================================================================
# https://github.com/keymetrics/pm2-logrotate?tab=readme-ov-file#how-to-set-these-values-
# https://stackoverflow.com/questions/66689376/how-to-rotate-log-files-while-running-server-with-pm2
# max log size is 1GB
pm2 set pm2-logrotate:max_size 1G
# compress logs when rotated (optional)
# pm2 set pm2-logrotate:compress true
# force rotate every hours
# pm2 set pm2-logrotate:rotateInterval '0 * * * *'


# ========================================================================
# 5. Enable pm2 Startup Service for your instance
# ========================================================================
pm2 startup # after this, check for generated command and run if required
# ========================================================================

# ========================================================================
# ANSIBLE FIXES
sudo ln -s $(which npm) /usr/bin/npm
sudo ln -s $(which node) /usr/bin/node
sudo ln -s $(which pm2) /usr/bin/pm2
sudo ln -s $(which pnpm) /usr/bin/pnpm
# NOT REQUIRED # sudo ln -s $(which caddy) /usr/bin/caddy # caddy is already in /usr/bin
# ========================================================================
# sudo ufw allow 80 && sudo ufw allow 443 # not required caddy handles them all
# sudo apt-get install --assume-yes libcap2-bin
# sudo setcap cap_net_bind_service=+ep `readlink -f \`which node\`` 
# # sudo setcap cap_net_bind_service=+eip $(which caddy)
# ========================================================================


# ========================================================================
# SHARED IP BLOCK FOLDER
sudo mkdir -p /var/lib/shared-data-folder # Create the shared folder:
sudo chmod 7777 /var/lib/shared-data-folder # Set the permissions to allow all users to read, write, and execute files in the shared folder.
# ========================================================================