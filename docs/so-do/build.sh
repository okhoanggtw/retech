#!/bin/sh
# Xuat lai anh PNG cho bao cao. Can: graphviz (dot), Java, plantuml.jar
#   sh build.sh /duong/dan/plantuml.jar
set -e
cd "$(dirname "$0")"
mkdir -p png
for f in *.dot; do dot -Tpng -Gdpi=200 "$f" -o "png/${f%.dot}.png"; done
GRAPHVIZ_DOT=$(command -v dot) java -jar "${1:-plantuml.jar}" -tpng -Sdpi=200 -o png *.puml
