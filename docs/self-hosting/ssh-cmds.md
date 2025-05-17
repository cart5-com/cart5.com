# SSH Commands to secure server and deploy with github actions

### Generate SSH keys on your server:

```
ssh-keygen -t ed25519 -C "github-actions"
```


### Add the public key to your server's authorized_keys:

```
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
```

### Create GitHub Secrets:

```
SSH_PRIVATE_KEY: Your server's private key
SERVER_HOST: Your server IP
SERVER_USER: Username (e.g., root)
APP_DIR: Directory where your app is located (e.g., /var/www/myapp)
```

### disable password authentication:

```
nano /etc/ssh/sshd_config
```

### Set these options
```
PasswordAuthentication no
PubkeyAuthentication yes
PermitRootLogin prohibit-password
```

### Restart SSH service:

```
sudo systemctl restart sshd
sudo service ssh restart
```

### Fail2ban for Brute Force Protection
```
sudo apt update
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```


### check if fail2ban is running:
```
sudo fail2ban-client status
```
You should see "sshd" in the list of jails.

### to see the logs:
```
sudo tail -n 100 /var/log/fail2ban.log
```


### Create a custom config file 
```
sudo nano /etc/fail2ban/jail.local
```

### Custom config file
```
[DEFAULT]
# Ban IPs for 1 hour (3600 seconds)
bantime = 3600

# Number of failures before a host gets banned
maxretry = 3

# Use sshd jail
[sshd]
enabled = true
port = ssh
logpath = %(sshd_log)s
maxretry = 3
```

### Restart fail2ban
```
systemctl restart fail2ban
```

### Check status
```
fail2ban-client status sshd
```

### to see changes:
```
sudo tail -n 100 /var/log/fail2ban.log
```