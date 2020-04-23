#!/usr/bin/env bash

echo "pid is $$"

echo signals > signals.txt

trap "{ echo HUP >> signals.txt; }" HUP
trap "{ echo INT >> signals.txt; }" INT
trap "{ echo QUIT >> signals.txt; }" QUIT
trap "{ echo KILL >> signals.txt; }" KILL
trap "{ echo TERM >> signals.txt; }" TERM
trap "{ echo EXIT >> signals.txt; }" EXIT

for i in {1..60}; do sleep 1; echo .; done
