---
title: "HBALLS"
date: "2024-01-15"
excerpt: "FSDAFDSF"
---

# How I Ported Friday Night Funkin to iOS

When I first discovered Friday Night Funkin', I immediately knew I wanted to bring this amazing rhythm game to iOS devices. Here's how I tackled this challenging project.

## The Challenge

The original game was built with HaxeFlixel, which doesn't directly support iOS. The main challenges were:

1. Input handling differences
2. Performance optimization
3. Asset management
4. Memory constraints

## The Solution

### Input System Redesign

```swift
class TouchInputHandler {
    func handleTouch(_ touch: UITouch) {
        // Input handling code
    }
}
```

### Performance Optimizations

- Implemented texture atlasing
- Reduced draw calls
- Optimized audio loading
- Added frame rate management

## Results

The port now runs smoothly on iOS devices, maintaining 60 FPS even during complex sequences. The touch controls feel natural and responsive.

### Future Plans

- Add custom control layouts
- Implement mod support
- Optimize further for older devices

Check out the project on [GitHub](https://github.com/hadobedo/FunkinIOS) for more details!
