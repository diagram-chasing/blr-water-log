#!/bin/bash

wget -nc https://download.openstreetmap.fr/extracts/asia/india/karnataka.osm.pbf

docker run -it --rm --pull always -v $(pwd):/data \
  ghcr.io/systemed/tilemaker:master \
  /data/karnataka.osm.pbf \
  --output /data/karnataka.pmtiles \
  --bbox 77.2,12.6,77.9,13.4 \
  --process /data/process-openmaptiles.lua \
  --config /data/config-openmaptiles.json \
  --skip-integrity

