---
title: "Why planes need more speed at high altitude"
date: 2026-10-23T00:00:00-07:00
description: "An interactive p5.js comparison of lift and runway distance in dense and thin air."
type: "blog"
tags: ["physics", "visualization"]
draft: false
---

A plane's wings generate less lift in thinner air at the same true airspeed. To support the same weight, the plane needs to move faster through that air.

The animation below compares identical planes at two runway elevations. Select **Animate acceleration** to start both at 15 m/s and increase their speed together. Each yellow runway-distance counter stops at liftoff. You can also change the airspeed and the high runway's elevation directly.

The drifting dots represent air density: both views use the same dot size and brightness, while the number of dots per unit area is proportional to air density. Raising the high runway makes its air visibly sparser. The vertical marker beside each plane shows its schematic height above its own runway.

{{< altitude-lift >}}

## Why the higher plane takes longer

The [lift equation](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/lift-equation/) relates the force from the wings to the air and the aircraft:

{{< lift-equation >}}

| Symbol | Meaning | Units and values in this animation |
| --- | --- | --- |
| **L** | Lift: the aerodynamic force supporting the plane against gravity. | Newtons (N). The animation displays kilonewtons (kN); 1 kN = 1,000 N. |
| **ρ** (rho) | Air density: the mass of air in each unit of volume. | kg/m³. About 1.225 at sea level and 0.909 at 3,000 m in the standard atmosphere. |
| **V** | True airspeed: the plane's speed relative to the surrounding air. | m/s. Controlled by the speed slider; its **square** appears in the equation. |
| **S** | Wing reference area: the wing's planform area, viewed from above. | m². Fixed at **16 m²**. |
| **Cₗ** | Lift coefficient: a dimensionless factor describing the wing's lift at a given shape, configuration, and angle of attack. | No units. Fixed at **1.2**. |

With the other parameters fixed, halving air density halves lift; doubling true airspeed multiplies lift by four. The animation's liftoff threshold is **L = W**, where **W = mg** is the plane's weight: 1,000 kg × 9.81 m/s² = **9,810 N**, or **9.81 kN**.

Here, both planes have the same mass, wing area, and lift coefficient. Only air density changes between the two runways. In the standard atmosphere used here, the sea-level plane reaches lift equal to weight at about **28.9 m/s**, while the plane at **3,000 m** needs about **33.5 m/s**.

This is why the control is labeled *true airspeed*. It measures speed through the air. Thrust would be an input to a fuller simulation: thrust accelerates the plane, which builds airspeed, which increases lift.

## What the distances mean

The acceleration button prescribes an increase of **2.5 m/s each second**, starting at **15 m/s**. With no wind, true airspeed equals groundspeed, so integrating speed over time gives the distance traveled on the runway. The counter freezes when lift reaches weight and resets when you restart the acceleration animation.

These are distances from the animation's starting speed, not takeoff distances from a standstill. At the default elevations, they are roughly **122 m** at sea level and **180 m** at 3,000 m. Moving the sliders during a run changes that run's conditions; replay the acceleration for a fresh comparison.

The model holds mass at 1,000 kg, wing area at 16 m², and lift coefficient at 1.2. It does not model engine performance, drag, rolling resistance, rotation, or a flight trajectory. The displayed height above the runway is schematic. The comparison isolates the effect of air density on lift; it is not a prediction of an aircraft's takeoff performance.
