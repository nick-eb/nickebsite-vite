---
title: Power management and gaming VMs with NVIDIA hybrid laptop dGPUs
date: 2025-02-27
excerpt: How I achieved power management and graphics-accelerated VMs using libvirt and QEMU on my NVIDIA hybrid graphics laptop.
thumbnail: /assets/img/hybrid-kvm-redmibook.png
---

How I 'perfected' my Arch Linux installation on my NVIDIA hybrid graphics laptop. Includes how I set up power management for its MX450 dGPU, and how to use a one-liner QEMU hook to seamlessly passthrough hybrid dGPUs to run full graphics-accelerated virtual machines for gaming and other Windows software!

### Solving `modprobe: FATAL: Module nvidia_drm is in use` even with `nvidia_drm.modeset=0` set after NVIDIA driver update
#### PROBLEM:
Updating `nvidia-dkms` to `570.124.04-1` from `570.86.16-2` led to some applications using `nvidia_drm` unexpectedly.

<div class="console" data-title="Terminal">
<code>nick@hybrid:~$ sudo modprobe -r nvidia_drm
modprobe: FATAL: Module nvidia_drm is in use.</code>
</div>

The culprit was two of my startup apps, Mullvad VPN and Vesktop, using `nvidia_drm` for some reason? 

I have `nvidia_drm.modeset=0` set in my commandline as well as in my modprobe.d configs, and running `sudo cat /sys/module/nvidia_drm/parameters/modeset` returns `N` as expected. I also tried with `nvidia_drm.modeset=1` and the same issue with apps launching 'with' nvidia_drm would occur.

#### SOLUTION:
Running `sudo lsmod | grep nvidia` revealed that 2 processes that were using `nvidia_drm`:

<div class="console" data-title="Terminal">
<code>nick@hybrid:~$ sudo modprobe -r nvidia_drm
modprobe: FATAL: Module nvidia_drm is in use.</code>
</div>

I then ran `sudo lsof | grep -iE nvidia` to get the list/history of processes that have run on the NVIDIA driver. The two most recent processes were Mullvad VPN and Vesktop, applications that I had set to autostart via KDE Settings. 


<div class="console" data-title="Terminal">
<code>nick@hybrid:~$ sudo modprobe -r nvidia_drm
modprobe: FATAL: Module nvidia_drm is in use.</code>
</div>

For those two programs, I added `VK_ICD_FILENAMES=/usr/share/vulkan/icd.d/intel_icd.x86_64.json` to their environment variables via their `.desktop` files in `/usr/share/applications`. This forces the Intel driver to load, thus not loading `nvidia_drm`, allowing us to modprobe `nvidia_drm` and start our VM.
