#!/bin/bash
set -e
# Check if CPU is AMD for MSR registers
IS_AMD=$(grep -c "AuthenticAMD" /proc/cpuinfo || true)

echo "Enabling Huge Pages..."
sysctl -w vm.nr_hugepages=1280
echo "vm.nr_hugepages=1280" >> /etc/sysctl.conf || true

echo "Applying CPU Performance Governor..."
for gov in /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor; do
  echo "performance" > $gov 2>/dev/null || true
done

if [ "$IS_AMD" -gt 0 ]; then
  echo "AMD Detected: Applying specific MSR tweaks..."
  modprobe msr
  wrmsr -a 0xc0011020 0x4480000000000 2>/dev/null || true
  wrmsr -a 0xc0011021 0x1c000200000040 2>/dev/null || true
fi
