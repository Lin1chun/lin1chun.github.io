---
author: ["Lin1chun"]
title: "WHEELTEC Course Car"
description: "Organising the ZJU automation lab car project into a reusable repository, including its dual-board architecture, 23-byte serial link, 3 m midterm run, and the failures that taught me the most."
date: 2026-11-03T17:45:00+08:00
type: post
draft: false
translationKey: zju-wheeltec-course-car
cover: "/images/flowlines/39.svg"
coverAlt: "Flowlines splitting and reconnecting around an open central loop."
tags: ["robotics"]
categories: ["Making"]
stage: "evergreen"
history: [
    {date = "2026-11-03", stage = "evergreen", note = "Published the completed midterm-2026 course repository and practical notes."}
]
coffee: 3
---

The course began with a box of mechanical parts, two STM32 boards, several cables, and a set of instructions that assumed the hardware would behave.

The car had other plans.

After I flashed the experimental firmware, the wheels ran as soon as they were touched. The replacement C50C had arrived configured for a different chassis. The two boards powered up but refused to exchange data. The ultrasonic sensor reported an obstacle at `0.00 m` whenever the real obstacle was simply too far away. Each problem looked like a software bug until the hardware supplied a different explanation.

Eventually the car completed the midterm task: a 3 m straight run, a pause for an obstacle, a 180° turn, and a return to the starting line. But the more useful result was [zju-wheeltec-car-course](https://github.com/Lin1chun/zju-wheeltec-car-course), a repository that preserves both the working code and the reasoning needed to reproduce it.

This post describes what the car does, how the repository is arranged, and why some of its smallest implementation details took the longest to understand.

## What the repository contains

The project is built around [ZJU's Automation Practice 1](https://github.com/Lin1chun/zju-wheeltec-car-course) and its WHEELTEC C10B/C50C car. The repository collects four kinds of material:

- the untouched WHEELTEC engineering baseline;
- the firmware written for the course labs and midterm task;
- wiring, protocol, flashing, and troubleshooting notes;
- the checks needed to keep the repository usable for the next student.

The original projects live under `firmware/original/`. I treat them as a reference copy of what the course supplied. The course work lives under `firmware/experimental/`, so a later student can compare an implementation with its starting point without guessing which files were edited.

That separation matters in embedded projects. A single missing compiler flag or an accidentally built object file can make two source trees produce different binaries. Keeping the vendor baseline intact gives every later change something stable to return to.

The written material is arranged by task rather than by the order in which I happened to create files. A student can start with the [course map](https://github.com/Lin1chun/zju-wheeltec-car-course/blob/main/docs/course-map.md), move through the [hardware](https://github.com/Lin1chun/zju-wheeltec-car-course/blob/main/docs/hardware.md) and protocol notes, and then follow the lab or midterm document that matches the current lesson.

## A small robot with two controllers

The car is not driven by one microcontroller. It has two boards with different jobs.

| Board | Processor | Main responsibilities |
|---|---|---|
| C10B front controller | STM32F103RCT6 | ultrasonic distance, servo scan, MPU6050 attitude, OLED, camera input, reporting to C50C |
| C50C chassis controller | STM32F407VET6 | four-wheel motion, encoders, ICM20948 attitude, OLED, receiving data from C10B |

The C10B handles sensing near the front of the car. The C50C handles motion and the chassis. They exchange data over UART: C10B transmits from UART5 on `PC12`, and C50C receives on USART2 at `PA3`. The link runs at 115200 baud, uses 8N1 framing, and requires a common ground.

```text
24 V battery
 |-- 24 V -> 12 V -> C10B
 |-- 24 V -------- -> C50C
 `-- 24 V -------- -> motor drivers

C10B -- UART5 115200 8N1 --> C50C
  |                              |
  |-- MPU6050                    |-- ICM20948
  |-- HC-SR04                    |-- encoders
  |-- SG90 servo                 |-- four motors
  |-- OLED                       `-- OLED
  `-- K210 camera
```

The arrangement also creates failure modes that a single-board design would not have. A correct sensor reading can disappear between two correctly compiled programs. A board can receive bytes but reject every frame because the two ends disagree about its length. A stale build can leave the code looking correct in the editor while the car runs something older.

The repository's diagnostics therefore live close to the boundary. On C50C, one OLED page reports `RX`, `HEAD`, `OK`, `BAD`, and the received frame length. Those counters turn a vague report of "the other board is not sending" into a specific question: are bytes arriving, are headers appearing, and is the checksum valid?

## The 23-byte link between the boards

The original course protocol sent 12 bytes from C10B to C50C. It carried camera status, camera position and size, one ultrasonic distance, and temperature. It did not carry attitude.

The seventh lab asks for MPU6050 Pitch, Roll, and Yaw on the C50C screen. The midterm also needs a useful picture of the ultrasonic scan. I extended the frame to 23 bytes.

| Bytes | Field | Purpose |
|---|---|---|
| 0–1 | `0xCC 0xDD` | frame header |
| 2 | `k210_alive` | camera heartbeat |
| 3 | `flags` | obstacle, centre-scan validity, camera status |
| 4–5 | `k210_cx` | camera target X position |
| 6–7 | `k210_size` | camera target area |
| 8–9 | `distance` | nearest distance in the forward sector |
| 10–11 | `distance_min` | nearest distance in the full scan |
| 12–13 | `temperature` | temperature ×100 |
| 14–19 | `pitch`, `roll`, `yaw` | attitude ×100 |
| 20 | `servo_deg` | current scan sector |
| 21 | `scan_mask` | which of five sectors produced valid data |
| 22 | `BCCcheck` | XOR checksum of bytes 0–21 |

Both structures use packed little-endian layouts. The receiver checks the header, length, and checksum before publishing a frame. A protocol change therefore means updating both firmware projects and the written specification together.

None of these fields is especially clever. Each one exists because the motion controller needs to distinguish a measurement from a missing answer. `scan_mask` says whether a short distance is real or belongs to a sector with no echo. `servo_deg` says which direction produced it. The checksum catches a broken frame before that frame can become a motor command.

The complete byte layout, BCC rule, and compatibility table are in [the protocol document](https://github.com/Lin1chun/zju-wheeltec-car-course/blob/main/docs/protocol.md).

## From lab exercises to a 3 m round trip

The course work builds up in stages. The first lessons introduce the OLED, ultrasonic sensor, buzzer, servo, MPU6050, and serial communication. The seventh lab asks for three tasks on the same robot:

1. display a distance using 16×16 Chinese glyphs;
2. scan a wider area with one ultrasonic sensor mounted on a servo;
3. send Pitch, Roll, and Yaw from C10B to C50C.

The midterm combines those pieces into a motion problem. The car must travel 3 m, stop at least 50 cm before an obstacle, resume after the obstacle moves, turn around at the endpoint, and return to the starting line. The final OLED values are total distance and average speed.

The C50C implementation uses a state machine:

```text
WAIT -> OUT -> PAUSE -> OUT
             |
             `-> TURN -> BACK -> DONE
```

`WAIT` lets the attitude sensor settle and waits for valid C10B data. `OUT` advances using encoder odometry for distance, with heading and lateral correction for straight-line motion. `PAUSE` stops when the forward sector reports an obstacle within 500 mm. It resumes after a valid clear reading persists for 0.4 seconds. `TURN` uses the C50C gyroscope to measure a 180° rotation and falls back to wheel odometry if the IMU does not respond. `BACK` reuses the same straight-line controller for the return leg. `DONE` stops the motors and locks the final totals.

The accepted run used these parameters:

| Parameter | Value |
|---|---:|
| Cruise speed | `0.20 m/s` |
| Midterm distance | `3.00 m` |
| Stop threshold | `500 mm` |
| Clear threshold | `550 mm` |
| Clear confirmation | `0.4 s` |
| Turn limit | `0.50 rad/s` |
| Turn tolerance | `1°` |
| Left/right compensation | `LineDiffParam = 52` |

The speed was not chosen only from comfort. At 0.20 m/s, the car moves about 17 cm during the worst-case interval before the scanning sensor returns to the centre. The obstacle margin has to cover sensing delay, motor response, and braking distance. Raising the speed further would need earlier thresholds or a faster scan, not just a different number in one macro.

The final parameters and acceptance criteria are recorded in [the midterm notes](https://github.com/Lin1chun/zju-wheeltec-car-course/blob/main/docs/midterm.md). The repository labels the tested source as `midterm-2026`.

## Four failures that became documentation

The most useful parts of the repository came from faults that were not visible in the source code alone.

### The new chassis was configured for another car

The replacement C50C arrived with `TYPE=6` selected. The course car is `TYPE=1`: a SENIOR_MEC_BS chassis with 100 mm wheels and MD36N_27 motors. The two model tables describe different wheel sizes, gear ratios, and motion parameters.

With the wrong type selected, even a light touch could send the wheels into continuous motion. This was not a motor PID tuning problem. The controller was trying to move a different vehicle.

The repository now begins new-board work with a type check: power off, set the C50C selector to `TYPE=1`, power on, confirm `CarType: 1` on the OLED, and raise the wheels before testing motion.

### One UART call had been commented out

C50C had a receive interrupt handler and a parser, but no data arrived. The source eventually exposed the cause:

```c
/*
USART2_Init(115200);
*/
```

The call was disabled. Without it, USART2's GPIO pins, clock, interrupt controller setup, and receive interrupt were never enabled. The interrupt handler was correct but could never run.

This is the sort of bug that can survive a successful compile because it is an omission rather than a type error. The receiver counters now make the link observable, and the [troubleshooting guide](https://github.com/Lin1chun/zju-wheeltec-car-course/blob/main/docs/troubleshooting.md) checks the initialisation path before asking anyone to replace a cable.

### Keil linked an old object file

A C10B build appeared to succeed while the resulting binary still behaved like an older program. The build had linked existing objects without recompiling the changed source.

Because the repository is intended for students using Keil, the instructions explicitly say **Rebuild** before **LOAD**. A successful link is not proof that every changed source file entered the image. The build artifacts may look identical while the board receives stale code.

### No echo was encoded as zero distance

At long range, the ultrasonic sensor produced no echo. The C10B timeout logic only started after an echo edge arrived, so a missing echo never completed the measurement state. The old distance expired and became `0`. C50C interpreted zero millimetres as an object directly in front of the car and stayed in `PAUSE`.

The fix gives every ultrasonic trigger its own timeout. If no complete echo arrives, the sector is marked invalid and its displayed distance falls back to the 4 m range limit. C50C only treats a short reading as an obstacle when `scan_mask` says that sector is valid.

Zero can mean "touching the bumper", "no measurement", "disconnected sensor", or "software initialisation failed". The receiving code has to know which meaning the field carries.

## Making the repository useful to someone else

The car works, but a working local folder is not the same thing as a course resource. The repository therefore has a small amount of maintenance structure behind it.

Every tracked path is in English. Commit messages and user-facing documentation are in Chinese, because the repository serves students at ZJU. The original course PDFs, slides, and images remain available as reference material, with their provenance and usage restrictions recorded in `NOTICE.md`.

The baseline and the experimental firmware remain separate. The tested implementation is reachable through a tag rather than only through a branch name that may later move. Generated `.hex`, `.bin`, `OBJ/`, and Keil user files are excluded from version control. A workflow checks the repository on every push, and the `main` branch is protected against force-pushes and deletion.

The last recorded build results are:

```text
C10B: 0 errors, 0 warnings
C50C: 0 errors, 9 warnings
```

The C50C warnings come from existing unused functions and file-ending issues in the course baseline. More importantly, the code is documented as tested on the actual car, not merely compiled. The real-world acceptance covered the 3 m run, obstacle pause and recovery, 180° turn, return, 23-byte link, attitude display, and OLED statistics.

At the same time, the repository does not claim that every run is reproducible to the millimetre. The exact path error and return offset depend on the floor, battery state, wheel wear, and the measurements taken during that particular test. The committed code gives a starting point; the lab still has to produce its own evidence.

## How I would use it as a student

Start with the original engineering baseline and confirm that it builds before changing anything. Set the chassis type and verify the battery path. Raise the wheels. Check the OLED, the serial counters, and the sensor validity flags before running the midterm task.

Then open the course document for the current lesson and edit a copy of the experimental project. Rebuild both boards when the protocol changes. Record the serial output and the physical result. A compile log belongs beside the source; it does not replace a test on the floor.

The complete sequence is in the [repository README](https://github.com/Lin1chun/zju-wheeltec-car-course). The additional hardware checks are in the [hardware guide](https://github.com/Lin1chun/zju-wheeltec-car-course/blob/main/docs/hardware.md), and the failure-first debugging notes are in the [troubleshooting guide](https://github.com/Lin1chun/zju-wheeltec-car-course/blob/main/docs/troubleshooting.md).

The project started as a way to finish one course task. It became more useful when I stopped treating the code as the whole answer. The chassis configuration, the flashing path, the build history, the sensor's notion of "no reading", and the physical stopping distance all became part of the system.

The next student should be able to spend their time on the car, not on reconstructing why it refused to move in the first place.
