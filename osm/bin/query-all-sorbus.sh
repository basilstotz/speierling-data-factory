#!/bin/sh

set -eu

if test -z "$1"; then
    echo "usage: query-all-sorbus.sh <cachedir>"
    exit 1
else
    if ! test -d "$1"; then
        echo "error: cachedir not found"
        exit 1
    fi
fi
CACHE_DIR="$1"

#CACHE_DIR="./cache"


mkdir -p $CACHE_DIR

cd $(dirname $0)/../.


query_part(){
    LAT1=$1
    LON1=$2
    LAT2=$(echo "$LAT1 + 5"|bc)
    LON2=$(echo "$LON1 + 5"|bc) 

    #QUERY="[timeout:900];node($LAT1,$LON1,$LAT2,$LON2)"'["natural"~"tree.*"]["species"~".*[Ss]orbus.*[Dd]omestica.*"];out meta;'
    QUERY="[timeout:900];node($LAT1,$LON1,$LAT2,$LON2)"'["species"~".*[Ss]orbus.*[Dd]omestica.*"];out meta;'

    FA=$(printf "%+04i" $LAT1)
    FO=$(printf "%+04i" $LON1)
    
    FILE="$CACHE_DIR/sorbus$FA$FO.json"

    if ! test -f $FILE; then
	echo "+++++++++++++++++++ " $FILE " ++++ " $QUERY
	echo $QUERY | query-overpass | tee $FILE.tmp
	if test -z "$(find $FILE.tmp -empty)"; then
	    mv $FILE.tmp $FILE
	else
	    rm $FILE.tmp
	fi
    fi
}


LAT=30
LON=-10

for O in $(seq 0 9); do
    for A in $(seq 0 4); do
	LA=$(( LAT + 5 * A ))
	LO=$(( LON + 5 * O ))
	query_part $LA $LO
    done
done

exit 0
