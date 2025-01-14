#

```
# yourdomain.com is the domain you want to use
# 0.0.0.0 is the IPv4 address of your server
# 0:0:0:0::1 is the IPv6 address of your server
```

# DNS records

```
"AAAA" "@" "0:0:0:0::1" "DNS only" "Auto"
"AAAA" "dns-pointer.yourdomain.com" "0:0:0:0::1" "DNS only" "Auto"

"A" "@" "0.0.0.0" "DNS only" "Auto"
"A" "dns-pointer.yourdomain.com" "0.0.0.0" "DNS only" "Auto"

"CNAME" "*.yourdomain.com" "dns-pointer.yourdomain.com" "DNS only" "Auto"
```
