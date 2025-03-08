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

### QEMU hooks `prepare/begin` and `release/end` scripts
#### start.sh (`prepare/begin/start.sh`)
<div class="textfile" data-title="start.sh">
#!/bin/bash
modprobe -r nvidia_uvm nvidia_drm nvidia_modeset nvidia
</div>

#### stop.sh (`release/end/stop.sh`)
<div class="textfile" data-title="stop.sh">
#!/bin/bash
modprobe nvidia_uvm nvidia_drm nvidia_modeset nvidia
modprobe nvidia_drm modeset=1
modprobe nvidia_drm fbdev=1
</div>

This script reloads the `nvidia` drivers once the VM ends, then re-sets the `modeset` and `fbdev` for `nvidia_drm` to 1 to allow for proper re-use of the NVIDIA card on our host. I found that not explicitly re-setting the the `modeset` and `fbdev` to 1 after the VM ends would not allow me to launch applications using the NVIDIA GPU and `sudo cat /proc/driver/nvidia/gpus/0000:2b:00.0/power` would return `?`/question marks in place of the GPU's power features:

#### After `modprobe nvidia_uvm nvidia_drm nvidia_modeset nvidia`, before `modprobe nvidia_drm modeset=1` & `modprobe nvidia_drm fbdev=1`:

<div class="console" data-title="Terminal">
<code><span class="command">sudo cat /proc/driver/nvidia/gpus/0000:2b:00.0/power</span>
Runtime D3 status:          ?
Video Memory:               ?

GPU Hardware Support:
 Video Memory Self Refresh: ?
 Video Memory Off:          ?

S0ix Power Management:
 Platform Support:          Supported
 Status:                    ?

Notebook Dynamic Boost:     ?

</code>
</div>

#### After `modprobe nvidia_drm modeset=1` & `modprobe nvidia_drm fbdev=1`:

<div class="console" data-title="Terminal">
<code>nick@hybrid:~$ sudo cat /proc/driver/nvidia/gpus/0000:2b:00.0/power
Runtime D3 status:          Enabled (fine-grained)
Video Memory:               Active

GPU Hardware Support:
 Video Memory Self Refresh: Supported
 Video Memory Off:          Supported

S0ix Power Management:
 Platform Support:          Supported
 Status:                    Disabled

Notebook Dynamic Boost:     Not Supported

</code>
</div>

### Solving `modprobe: FATAL: Module nvidia_drm is in use`
#### PROBLEM:
Some applications use `nvidia_drm` unexpectedly, therefore not allowing the `start.sh` QEMU hook to run correctly. This problem could be a symptom of another issue with my configuration and could possibly be solved a 'better' way, but this solution works well enough for me:

<div class="console" data-title="Terminal">
<code><span class="command">sudo modprobe -r nvidia_drm</span>
modprobe: FATAL: Module nvidia_drm is in use.</code>
</div>

Running `sudo lsmod | grep nvidia` revealed that 2 processes that were using `nvidia_drm`:

<div class="console" data-title="Terminal">
<code><span class="command">sudo lsmod | grep -iE nvidia</span>
nvidia_drm            139264  2
nvidia_modeset       1830912  1 nvidia_drm
nvidia              96956416  6 nvidia_modeset
drm_ttm_helper         16384  2 nvidia_drm,xe
video                  81920  3 xe,i915,nvidia_modeset</code>
</div>

Running `sudo lsof | grep -iE nvidia` gave me the list/history of processes that have run on the NVIDIA driver. I saw a whole bunch of entries for `electron`. I closed all Electron apps running (Discord, Mullvad VPN, Beeper etc.) and re-ran `sudo lsmod | grep nvidia`:

<div class="console" data-title="Terminal">
<code>nick@hybrid:~$ sudo lsmod | grep -iE nvidia
nvidia_uvm           3977216  0
nvidia_drm            139264  0
nvidia_modeset       1830912  1 nvidia_drm
nvidia              96956416  2 nvidia_uvm,nvidia_modeset
drm_ttm_helper         16384  2 nvidia_drm,xe
video                  81920  3 xe,i915,nvidia_modeset
</code>
</div>

Now `nvidia_drm` is being used by 0 processes, so we can now unload `nvidia` drivers successfully:

<div class="console" data-title="Terminal">
<code>nick@hybrid:~$ sudo modprobe -r nvidia_uvm nvidia_drm nvidia_modeset nvidia 

nick@hybrid:~$ 
</code>
</div>

My solution is kinda lazy, but works well enough for me. For each application that was using `nvidia_drm`, I added `VK_ICD_FILENAMES=/usr/share/vulkan/icd.d/intel_icd.x86_64.json` to the `Environment variables` of Discord*, Mullvad VPN and Beeper. 

*`VK_ICD_FILENAMES=/usr/share/vulkan/icd.d/intel_icd.x86_64.json` stopped working for Vencord, it still seems to use `nvidia_drm` anyways. I just close Vencord when starting the VM, and re-open it afterwards. Lazy but I swear it 'just worked' before...

### Getting accelerated video output through Looking-Glass without a physical dummy plug using Virtual Display Driver (VDD)
Once the VM can boot with the NVIDIA card attached, use the SPICE/VGA video passthrough through `virt-manager` to complete the Windows setup and install the NVIDIA graphics drivers. 

Once the NVIDIA drivers are installed, download and install the latest releases of [Looking-Glass-Host](https://looking-glass.io/downloads) and [Virtual-Display-Driver](https://github.com/VirtualDisplay/Virtual-Display-Driver/releases/latest). Once Looking-Glass-Host and Virtual-Display-Driver are installed and the Virtual-Display-Driver virtual display is enabled in Windows (it should be after installation by default), it is time to shut down the VM and set up our IVSHMEM using the KVMFR module. The Looking-Glass website describes this process super simply, it takes 2 seconds (and a reboot haha): [IVSHMEM with the KVMFR module (Recommended)](https://looking-glass.io/docs/B7/install_libvirt/#determining-memory)

Once KVMFR is set up, verify that it's working by booting the VM again and starting `looking-glass-client` on the host. Once output is working via Looking-Glass, it is time to 'remove' the SPICE display.

Here's the... weird part. Simply removing the SPICE video devices from the VM via `virt-manager` would result in Looking-Glass giving a blank/black picture, regardless of which display was set default in Windows, etc. 

I worked around this by doing the following:
- Booted the VM and right clicked the desktop to get to Display Settings (or go to Windows Settings > System > Display Settings)
- Determined which output/screen index corresponded to either SPICE or the Virtual Display by going to 'Advanced Display' (Wired Monitor is usually SPICE, Virtual Display Driver should be obvious by its name)
- For this example, we will assume that SPICE = Display 1, VDD = Display 2.
- Select the option to show only on the Virtual Display Device. So, if VDD is Display 2, select 'Show only on 2'.
- Both screens (Looking-Glass AND SPICE via `virt-manager`) SHOULD BE BLACK. 
- QUICKLY* turn off the VM via `virt-manager`, and turn it back on. (*within ~15 seconds to prevent Windows from undoing the changes) 
- Upon next boot, Looking-Glass should be the only 'display' active. This display should have functioning graphics acceleration via the NVIDIA card unlike the regular old SPICE window, all without a physical dummy connector!

There's probably a more elegant way of disabling the SPICE monitor to enable proper output via Looking-Glasss, but this worked for me.

### Reducing battery drain and optimizing host performance
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
```

These options disable (part of?) the NVIDIA GPU firmware? Without this option, the card would stay in D0 and never enter D3cold.

<div class="console" data-title="Terminal">
<code>nick@hybrid:~$ sudo cat /proc/driver/nvidia/gpus/0000:2b:00.0/power
Runtime D3 status:          Enabled (fine-grained)
Video Memory:               Off

GPU Hardware Support:
 Video Memory Self Refresh: Supported
 Video Memory Off:          Supported

S0ix Power Management:
 Platform Support:          Supported
 Status:                    Disabled

Notebook Dynamic Boost:     Not Supported

</code>
</div>

TLP is used for power management over `power-profiles-daemon`.

Sources:
https://www.notebookcheck.net/Xiaomi-RedmiBook-Pro-15-2021-in-review-Affordable-laptop-with-strong-features.545905.0.html