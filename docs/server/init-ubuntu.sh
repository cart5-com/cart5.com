# 80GB disk recommended
# Desc: Initial commands to setup a new server

# Update all packages
sudo apt upgrade --assume-yes


# ========================================================================
# setup swap
# https://www.digitalocean.com/community/tutorials/how-to-add-swap-space-on-ubuntu-22-04
sudo fallocate -l 20G /swapfile
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

# install coolify
# https://coolify.io/docs/installation
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash