if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <input_geojson> <output_pmtiles>"
    exit 1
fi

input_geojson=$1
output_pmtiles=$2

tippecanoe -o "$output_pmtiles" \
    --force \
    --no-simplification-of-shared-nodes \
    --drop-densest-as-needed \
    --extend-zooms-if-still-dropping \
    --no-tile-compression \
    "$input_geojson"
