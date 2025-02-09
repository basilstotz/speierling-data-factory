#!/bin/sh

if test $# = 1;then
	nodeid="$1"
else
	nodeid="123456789"
fi

dir=$(find . -type d  |grep  ".*\."$nodeid"$")

#echo "$dir"

test -z "$dir" && exit 0


for FILE in $dir/*; do
      name=$(basename $FILE)
      cat << EOT
<a data-lightbox="1" target="_blank" href="$FILE" title="$name"><img src="$FILE"></a>
EOT
done


exit

