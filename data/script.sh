cp lahmansbaseballdb.sqlite dev.sqlite
./sqlite3 dev.sqlite < preprocess.sql
./sqlite3 -header -csv dev.sqlite "SELECT * FROM temp_t9;" > baseball_data.ccsv
rm dev.sqlite
