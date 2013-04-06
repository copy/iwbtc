IN="storage.js clone.js engine.js audio.js bitmap.js game_objects.js keyboard.js renderer.js util.js"
OUT="iwbtc-all.js"

ls -l $OUT

java -jar ~/closure-compiler.jar \
	--compilation_level ADVANCED_OPTIMIZATIONS\
	--js_output_file $OUT\
	--warning_level VERBOSE\
	--externs externs.js\
	--language_in ECMASCRIPT5_STRICT\
	--js $IN


#echo $FILENAME

ls -l $OUT
