#!/bin/bash
# Optimized for high-priority CPU mining
sudo chrt -f 99 ./build/arcana-miner --randomx-1gb-pages --donate-level 1
