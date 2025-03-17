echo "Starting caddy deploy..."
ansible-playbook -i "$UBUNTU_SERVER_IP," -u root ./caddy-deploy-role.yml -v
echo "Caddy deploy completed"
