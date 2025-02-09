#!/bin/sh

CACHE_DIR="."

query_part(){
    LAT1=$1
    LON1=$2
    LAT2=$(echo "$LAT1 + 5"|bc)
    LON2=$(echo "$LON1 + 5"|bc) 

    #QUERY="[timeout:900];node($LAT1,$LON1,$LAT2,$LON2)"'["natural"~"tree.*"]["species"~".*[Ss]orbus.*[Dd]omestica.*"];out meta;'
    QUERY="[timeout:900];way($LAT1,$LON1,$LAT2,$LON2)"'["natural"="cliff"];out geom;'

    FA=$(printf "%+04i" $LAT1)
    FO=$(printf "%+04i" $LON1)
    FILE="$CACHE_DIR/cliff$FA$FO.json"

    if ! test -f $FILE; then
	echo "+++++++++++++++++++ " $FILE " ++++ " $QUERY
	echo $QUERY | query-overpass | tee $FILE.tmp
	mv $FILE.tmp $FILE
    fi
}


query_part 45 5
