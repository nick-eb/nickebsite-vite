---
title: NVIDIA PRIME & dynamic dGPU handling for VMs on laptops
date: 2025-02-27
excerpt: Tips on achieving graphics-accelerated VMs on NVIDIA PRIME hybrid graphics laptop.
thumbnail: /assets/img/hybrid-kvm-redmibook.png
---

<div class="image-carousel">
  <div class="carousel-container">
    <div class="carousel-slide active">
      <img src="/assets/img/blog-post-imgs/hybrid-graphics-kvm-arch/fastfetch-sysinfo.png" alt="System information output showing specifications of my RedmiBook Pro" title="System specifications from fastfetch">
    </div>
    <div class="carousel-slide">
      <img src="/assets/img/blog-post-imgs/hybrid-graphics-kvm-arch/hybrid-kvm-redmibook.png" alt="Windows 10 virtual machine running with NVIDIA graphics acceleration" title="Windows 10 VM with NVIDIA GPU passthrough">
    </div>
  </div>
  <div class="carousel-controls">
    <span class="image-caption"></span>
    <div class="carousel-buttons">
      <button class="carousel-button prev">←</button>
      <button class="carousel-button next">→</button>
    </div>
  </div>
</div>

### Laptop Specifications
- Model: RedmiBook Pro 15 (2021)
- CPU: Intel i7-11370H (4 cores, 8 threads)
- dGPU: NVIDIA MX450, 2GB VRAM
- iGPU: Iris Xe Graphics (TGL2)
- RAM: 16GB 3200MHz Soldered RAM :(
- Display: 15.6" 3200x2000 90Hz IPS (!!!)


### Getting accelerated video output through Looking-Glass without a physical dummy plug using Virtual Display Driver (VDD)

This is a list of issues I had setting up my Windows virtual machines using libvirt + QEMU and Looking-Glass for video output on my NVIDIA PRIME/hybrid graphics Arch Linux laptop. I compiled this page to document issues I was having and how I solved/worked around them

### QEMU hooks `prepare/begin` and `release/end` scripts
#### start.sh (`prepare/begin/start.sh`)
```
#!/bin/bash
modprobe -r nvidia_uvm nvidia_drm nvidia_modeset nvidia
```
This script unloads the `nvidia` drivers when the VM starts.

#### stop.sh (`release/end/stop.sh`)
```
#!/bin/bash
modprobe nvidia_uvm nvidia_drm nvidia_modeset nvidia
modprobe nvidia_drm modeset=1
modprobe nvidia_drm fbdev=1
```
This script reloads the `nvidia` drivers once the VM ends, then re-sets the `modeset` and `fbdev` for `nvidia_drm` to 1 to allow for proper re-use of the NVIDIA card on our host. I found that not explicitly re-setting the the `modeset` and `fbdev` to 1 after the VM ends would not allow me to launch applications using the NVIDIA GPU and `sudo cat /proc/driver/nvidia/gpus/0000:2b:00.0/power` would return `?`/question marks in place of the GPU's power features:

#### After running `modprobe nvidia_uvm nvidia_drm nvidia_modeset nvidia` but before running `modprobe nvidia_drm modeset=1` & `modprobe nvidia_drm fbdev=1`:

<div class="console" data-title="Terminal">
<code>nick@hybrid:~$ sudo cat /proc/driver/nvidia/gpus/0000:2b:00.0/power
Runtime D3 status:          ?
Video Memory:               ?
GPU Hardware Support:
 Video Memory Self Refresh: ?
 Video Memory Off:          Supported
S0ix Power Management:
 Platform Support:          Supported
 Status:                    Enabled
</code>
</div>


### Solving `modprobe: FATAL: Module nvidia_drm is in use` when attempting to unload `nvidia` drivers
#### PROBLEM:

When trying to unload `nvidia` drivers using the above `start.sh` script, I would recieve the following error:

<div class="console" data-title="Terminal">
<code>nick@hybrid:~$ sudo modprobe -r nvidia_drm
modprobe: FATAL: Module nvidia_drm is in use.</code>
</div>

Updating `nvidia-dkms` from `570.86.16-2` to `570.124.04-1` led to some applications using `nvidia_drm` unexpectedly. This could be an issue with my configuration, nonetheless this is how I dealt with it

The culprit was two of my startup apps, Mullvad VPN and Vesktop, using `nvidia_drm`. 

I have `nvidia_drm.modeset=1` set in my commandline, and running `sudo cat /sys/module/nvidia_drm/parameters/modeset` returns `Y` as expected. I also tried with `nvidia_drm.modeset=0` and the same issue behaviour occurs.

#### SOLUTION:
Running `sudo lsmod | grep nvidia` revealed that 2 processes that were using `nvidia_drm`:

Running `sudo lsof | grep -iE nvidia` gave me the list/history of processes that have run on the NVIDIA driver. The two most recent processes were Mullvad VPN and Vesktop, which were applications that I had set to autostart via KDE Settings. 

For those two programs, I added `VK_ICD_FILENAMES=/usr/share/vulkan/icd.d/intel_icd.x86_64.json` to their environment variables via their `.desktop` files in `/usr/share/applications`. This forces the Intel driver to load, thus not loading `nvidia_drm`, allowing us to modprobe `nvidia_drm` and start our VM.

### Reducing battery drain in S3 sleep
Contents of `/etc/tmpfiles.d/disable-acpi-tb-wakeup.conf`:
```
w+ /proc/acpi/wakeup - - - - TXHC
w+ /proc/acpi/wakeup - - - - TDM0
w+ /proc/acpi/wakeup - - - - TRP0
w+ /proc/acpi/wakeup - - - - RP09
w+ /proc/acpi/wakeup - - - - RP05
w+ /proc/acpi/wakeup - - - - XHCI
```

This disabled ACPI wakeups for the laptop's Thunderbolt connections as well as USB wakeups via `systemd-tmpfiles`.

Contents of `/etc/modprobe.d/i915.conf`:
```
options i915 enable_guc=3
options i915 enable_psr=1
options i915 enable_rc6=1
```

This enables some performance/power-saving options for the Intel Xe graphics.

Contents of `/etc/modprobe.d/nvidia.conf`:
```
options nvidia "NVreg_EnableGpuFirmware=0"
options nvidia "NVreg_EnableS0ixPowerManagement=1"
options nvidia "NVreg_PreserveVideoMemoryAllocations=0"
```

These options disable (part of?) the NVIDIA GPU firmware as well as explicitly defining S0ix power management as being present. Without these options, things like `Runtime D3 Status` and `S0ix Power Management` would return off/unsupported. 

<div class="console" data-title="Terminal">
<code>nick@hybrid:~$ sudo cat /proc/driver/nvidia/gpus/0000:2b:00.0/power
Runtime D3 status:          Enabled (fine-grained)
Video Memory:               Off
GPU Hardware Support:
 Video Memory Self Refresh: Supported
 Video Memory Off:          Supported
S0ix Power Management:
 Platform Support:          Supported
 Status:                    Enabled
</code>
</div>

TLP is used for power management over `power-profiles-daemon`.

Sources:
https://www.notebookcheck.net/Xiaomi-RedmiBook-Pro-15-2021-in-review-Affordable-laptop-with-strong-features.545905.0.html