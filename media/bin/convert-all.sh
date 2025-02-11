#!/bin/sh

SRC_DIR="$1"
DST_DIR="$2"

DOIT() {

   FILE="$1"
}



DIRS=$(find "$SRC_DIR" -type d  |grep  ".*[^.]\.[0-9]*$")

for DIR in $DIRS; do
    ID="$(basename $DIR|cut -d. -f2)"

    find "$DIR" -mindepth 1 -maxdepth 1 -type f | while read -r FILE; do
	BASENAME="$(basename $FILE)"
	if ! test -f "$DST_DIR/$ID/$BASENAME";then
		echo "add $FILE"
		mkdir -p "$DST_DIR/$ID"
		TIME=$(exiftool -s -s -s -d "%e.%B %Y" -DateTimeOriginal  "$FILE")
		if test -z "$TIME"; then
		  TIME=$(exiftool -s -s -s -d "%e.%B %Y" -FileAccessDate  "$FILE")
		fi
		convert  -auto-orient -resize 1024x1024 -pointsize 40 -fill yellow -gravity SouthEast  -annotate 0  "$TIME" "$FILE" "$DST_DIR/$ID/$BASENAME" 
	fi
	if ! test -f "$DST_DIR/$ID/thumbs/$BASENAME";then
		mkdir -p "$DST_DIR/$ID/thumbs"
		convert -auto-orient -resize 100x100^ -gravity Center  -extent 100x100  "$FILE" "$DST_DIR/$ID/thumbs/$BASENAME"
	fi
    done
    
done



exit

