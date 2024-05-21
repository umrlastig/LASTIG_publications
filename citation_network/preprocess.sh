rm titles_hal.txt years_hal.txt ids_hal.txt hal.csv
cat ../publications.csv | awk -F"\",\"" '{print $4}' | awk -F"\]\(" '{print "\""substr($1,2)"\""}' > titles_hal.txt
# remove one semicolumn by hand [region occitanie]
cat ../publications.csv | awk -F"\",\"" '{print "\""$3"\""}' > years_hal.txt
cat titles_hal.txt | awk '{print "\"\""}' > ids_hal.txt

paste titles_hal.txt ids_hal.txt years_hal.txt -d ";" > hal.csv

