# TODO: test migrations with turso branching before deploying
ansible-playbook -i "$UBUNTU_SERVER_IP," -u root ./_0_common-role.yml -v
