# TODO: test migrations with turso branching before deploying
ansible-playbook -i "$UBUNTU_SERVER_IP," -u root ./common-role.yml -v 
# lightsail # ansible-playbook -i "$UBUNTU_SERVER_IP," -u ubuntu --private-key ./key.pem ./common-role.yml -v
ansible-playbook -i "$UBUNTU_SERVER_IP," -u root ../../apps/proxy-caddy/deploy/caddy-deploy-role.yml -v
