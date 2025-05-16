1. Generate SSH keys on your server:

```
ssh-keygen -t ed25519 -C "github-actions"
```


2. Add the public key to your server's authorized_keys:

```
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
```

3. Create GitHub Secrets:

```
SSH_PRIVATE_KEY: Your server's private key
SERVER_HOST: Your server IP
SERVER_USER: Username (e.g., root)
APP_DIR: Directory where your app is located (e.g., /var/www/myapp)
```