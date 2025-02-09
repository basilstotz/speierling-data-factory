#!/bin/sh

SRC=$1

echo -n "{"

FN=true
for DIR in $SRC/* ; do
    #echo $DIR
    ID=$(basename $DIR)
    #echo $ID

        if $FN;then
		FN=false
		echo ""
	else
		echo  ","
	fi
	echo -n "    \"$ID\": ["
 	FF=true
	for FILE in $DIR/*; do
	    #echo $FILE
		NAME=$(basename $FILE  )
		#if ! test "$NAME" = "thumbs";then
                if [[ "$NAME" =~ .*\.jpeg || "$NAME" =~ .*\.JPEG || "$NAME" =~ .*\.jpg || "$NAME" =~ .*\.JPG || "$NAME" =~ .*\.png || "$NAME" =~ .*\.PNG  ]]; then 
			if $FF;then
				FF=false
				echo ""
			else
				echo ","
			fi
			echo -n "        \"$NAME\""
			#echo -n "             \""
			#base64 $(dirname "$FILE")/thumbs/"$NAME"
			#echo "\""
		fi
	done
	echo ""
	echo -n "    ]"



done 
echo ""
echo "}"
exit


