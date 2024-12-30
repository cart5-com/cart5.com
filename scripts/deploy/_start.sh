# TODO: test migrations with turso branching before deploying
ansible-playbook -i "$UBUNTU_SERVER_IP," -u root ./common-role.yml -v 
# ansible-playbook -i "$UBUNTU_SERVER_IP," -u root ../../apps/auth-api-hono/deploy/auth-api-hono-deploy-role.yml -v
# ansible-playbook -i "$UBUNTU_SERVER_IP," -u root ../../apps/auth-frontend-astro/deploy/auth-frontend-astro-deploy-role.yml -v
ansible-playbook -i "$UBUNTU_SERVER_IP," -u root ../../apps/proxy-caddy/deploy/caddy-deploy-role.yml -v
# lightsail # ansible-playbook -i "$UBUNTU_SERVER_IP," -u ubuntu --private-key ./key.pem ./_0_common-role.yml -v
