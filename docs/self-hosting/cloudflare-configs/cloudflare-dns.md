#

```
# yourdomain.com is the domain you want to use
# 0.0.0.0 is the IP address of your server
```

# DNS records

```
"A" "auth.yourdomain.com" "0.0.0.0" "DNS only" "Auto"
"A" "dns-pointer.yourdomain.com" "0.0.0.0" "DNS only" "Auto"
"CNAME" "*.yourdomain.com" "dns-pointer.yourdomain.com" "DNS only" "Auto"
```
