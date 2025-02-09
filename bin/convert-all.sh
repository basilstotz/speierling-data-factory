#!/bin/sh

SRC_DIR=$1
DST_DIR=$2

DIRS=$(find $SRC_DIR -type d  |grep  ".*[^.]\.[0-9]*$")


for DIR in $DIRS; do
	ID="$(basename $DIR|cut -d. -f2)"
	for FILE in $DIR/*; do
		BASENAME="$(basename $FILE)"
		if ! test -f "$DST_DIR/$ID/$BASENAME";then
			echo "add $FILE"
        		mkdir -p "$DST_DIR/$ID"
                        TIME=$(exiftool -s -s -s -d "%e.%B %Y" -DateTimeOriginal  $FILE)
                        if test -z "$TIME"; then
                          TIME=$(exiftool -s -s -s -d "%e.%B %Y" -FileAccessDate  $FILE)
                        fi
			# echo $TIME
                        #test -z "$TIME" || TIME=" "
			#        		convert -resize 1024x1024  "$FILE" "$DST_DIR/$ID/$BASENAME"
			#			convert -resize 1024x1024 -pointsize 20 -fill yellow -draw "text 100,100 $TIME"  "$FILE" "$DST_DIR/$ID/$BASENAME"
			convert  -auto-orient -resize 1024x1024 -pointsize 40 -fill yellow -gravity SouthEast  -annotate 0  "$TIME" "$FILE" "$DST_DIR/$ID/$BASENAME" 
		fi
		if ! test -f "$DST_DIR/$ID/thumbs/$BASENAME";then
        		mkdir -p "$DST_DIR/$ID/thumbs"
        		convert -auto-orient -resize 100x100^ -gravity Center  -extent 100x100  "$FILE" "$DST_DIR/$ID/thumbs/$BASENAME"
		fi
	done
done


exit

