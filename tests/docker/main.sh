docker-compose up --detach --build
sleep 15 # need to give some time for the database to start working properly

docker exec docker_mediawiki_1 bash /var/www/html/setup.sh

