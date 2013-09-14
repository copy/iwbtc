IN="storage.js clone.js engine.js audio.js bitmap.js game_objects.js keyboard.js renderer.js util.js schnosm.js"
OUT="iwbtc-all.js"

ls -lh $OUT

#--compilation_level ADVANCED_OPTIMIZATIONS\

java -jar ~/closure-compiler.jar \
	--js_output_file $OUT\
	--warning_level VERBOSE\
	--externs externs.js\
    --define=DEBUG=false\
	--language_in ECMASCRIPT5_STRICT\
	--js $IN


#echo $FILENAME

ls -lh $OUT
