mv ./LocalSettings.php /tmp/LocalSettings.php

php maintenance/install.php Wikipedia Wikiuser --pass=wikipassword \
  --server=http://localhost:8080 \
	--dbserver=database \
	--dbtype=mysql \
	--dbname=my_wiki \
	--dbprefix="" \
	--installdbuser=wikiuser \
	--installdbpass=wikipassword \
	--dbuser=wikiuser \
	--dbpass=wikipassword \
	--scriptpath="" \
	--extensions=SpamBlacklist,TitleBlacklist

rm -rf ./LocalSettings.php && mv /tmp/LocalSettings.php ./LocalSettings.php

php maintenance/update.php --quick

# Include every grant in bot password, too bad there isn't an --all-grants option
php maintenance/createBotPassword.php --appid=bp --grants=basic,blockusers,createaccount,createeditmovepage,delete,editinterface,editmycssjs,editmyoptions,editmywatchlist,editpage,editprotected,editsiteconfig,highvolume,mergehistory,oversight,patrol,privateinfo,protect,rollback,sendemail,uploadeditmovefile,uploadfile,viewdeleted,viewmywatchlist,viewrestrictedlogs Wikiuser 12345678901234567890123456789012

# Create a spare account too
php maintenance/createAndPromote.php Wikiuser2 wikipassword

# Add bot password
php maintenance/createBotPassword.php --appid=bp --grants=basic,blockusers,createaccount,createeditmovepage,delete,editinterface,editmycssjs,editmyoptions,editmywatchlist,editpage,editprotected,editsiteconfig,highvolume,mergehistory,oversight,patrol,privateinfo,protect,rollback,sendemail,uploadeditmovefile,uploadfile,viewdeleted,viewmywatchlist,viewrestrictedlogs Wikiuser2 12345678901234567890123456789012

