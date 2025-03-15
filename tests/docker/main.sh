docker compose up --detach

check_mysql_connection() {
  if mysql -h 127.0.0.1 -P 3312 -u wikiuser -pwikipassword my_wiki -e "SELECT 1;" > /dev/null 2>&1; then
    return 0 # Connection successful
  else
    return 1 # Connection failed
  fi
}

echo "Waiting for MySQL to become ready..."
until check_mysql_connection; do
  sleep 1
  echo "." # Show progress
done

docker compose exec mediawiki bash /var/www/html/setup.sh
