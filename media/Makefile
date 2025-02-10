media:
	@test -d ./../../../Gemeinden || (echo "./../../../Gemeinden not found";false)
	@test -d ./../../../node || (echo "./../../../node not found";false)
	./bin/convert-all.sh ./../../../Gemeinden ./../../../node | tee ./../../convert.log
	./bin/make-bilder.js ./../../../node/ > ./../../addons/mediaIndex.json
