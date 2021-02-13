FROM mediawiki

WORKDIR /var/www/html

RUN git clone --depth 1 --branch REL1_35 https://github.com/wikimedia/mediawiki-extensions-OAuth.git extensions/OAuth

COPY . .
