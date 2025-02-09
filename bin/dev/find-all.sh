#!/bin/sh


DIRS=$(find ../Gemeinden/ -type d  |grep  ".*[^.]\.[0-9]*$")

echo -n "{"

FN=true
for DIR in $DIRS; do
	ID=$(echo $DIR|cut -d. -f4)
        if $FN;then
		FN=false
		echo ""
	else
		echo  ","
	fi
	echo -n "    \"$ID\": ["
 	FF=true
	for FILE in $DIR/*; do
		if $FF;then
			FF=false
			echo ""
		else
			echo ","
		fi
		echo -n "        \"$(echo $FILE|cut -c4- )\""
	done
	echo ""
	echo -n "    ]"
done 
echo ""
echo "}"
exit

