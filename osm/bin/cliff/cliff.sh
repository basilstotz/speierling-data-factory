#!/bin/sh


#QUERY="[timeout:900];node($LAT1,$LON1,$LAT2,$LON2)"'["natural"~"tree.*"]["species"~".*[Ss]orbus.*[Dd]omestica.*"];out meta;'

LAT1=45
LAT2=50

LON1=5
LON2=10

QUERY="[timeout:900];way($LAT1,$LON1,$LAT2,$LON2)"'["natural"="cliff"];out meta;'

echo "$QUERY"
echo "$QUERY" | query-overpass
