# Hetzner Setup Checklist

[Coolify Firewall Documentation](https://coolify.io/docs/knowledge-base/server/firewall)

## Hetzner Firewall Settings

- Configure access rules:
  - Allow port 22 (SSH) for your IP only
  - Allow ports 80,443 (HTTP/HTTPS) for all Cloudflare IPs

## Hetzner Network Security

### IPv4 Configuration

- Enable IPv4 protection
- Disable IPv4 auto-delete

### IPv6 Configuration

- Enable IPv6 protection
- Disable IPv6 auto-delete

### Add an Internal Network

Configure servers to use it - [Server Configuration Documentation](https://docs.hetzner.com/cloud/networks/server-configuration/)
