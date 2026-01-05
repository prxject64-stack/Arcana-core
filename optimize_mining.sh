#!/bin/bash
set -e

echo "Enabling Huge Pages..."
sysctl -w vm.nr_hugepages=1280 || true

echo "Applying CPU Performance Governor (Safe Mode)..."
# Check standard path
if [ -d /sys/devices/system/cpu/cpu0/cpufreq ]; then
  for gov in /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor; do
    echo "performance" > "$gov" 2>/dev/null || true
  done
# Fallback for Intel P-State (Common in Modern/Cloud Kernels)
elif [ -d /sys/devices/system/cpu/intel_pstate ]; then
  echo "0" > /sys/devices/system/cpu/intel_pstate/no_turbo 2>/dev/null || true
  echo "100" > /sys/devices/system/cpu/intel_pstate/min_perf_pct 2>/dev/null || true
else
  echo "Notice: Scaling governor interface not found. Hardware/Hypervisor is likely managing clocks."
fi
