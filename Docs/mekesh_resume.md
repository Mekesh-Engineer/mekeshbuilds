# MEKESH KUMAR

**Final Year Undergraduate — Electrical & Electronics Engineering (Kongu Engineering College)**

📞 +91 8220810170 | 📧 mekesh.engineer@gmail.com | 🔗 linkedin.com/in/mekeshkumar | 💻 github.com/Mekesh-Engineer | 🌐 freelancer.in/u/mekesh12

## CAREER OBJECTIVE

Final-year Electrical and Electronics Engineering undergraduate seeking a **Graduate Engineering Trainee (GET)** position to apply strong fundamentals in embedded systems, industrial automation, and IoT-integrated hardware-software development. Equipped with hands-on project experience across real-time control systems, sensor interfacing, and intelligent monitoring platforms — backed by in-plant training in manufacturing environments. Eager to contribute to engineering excellence, learn from industry-led mentorship, and grow into a core technical role within a dynamic organisation.

---

## EDUCATION

| Qualification                               | Institution                                              | Year                          | Result                           |
| ------------------------------------------- | -------------------------------------------------------- | ----------------------------- | -------------------------------- |
| B.E. – Electrical & Electronics Engineering | Kongu Engineering College, Perundurai, Tamil Nadu        | 2023 – Present _(Final Year)_ | **CGPA: 7.71** _(up to 5th Sem)_ |
| Higher Secondary Education (HSE)            | Govt. Boys Higher Secondary School, Palacode, Tamil Nadu | 2021 – 2023                   | **84%**                          |
| SSLC                                        | DDCSM Matriculation School, Palacode, Tamil Nadu         | 2020 – 2021                   | **84%**                          |

---

## CORE ENGINEERING COMPETENCIES

### Electrical & Electronics Fundamentals

- Circuit Design & Analysis, Electrical Machines, Power Systems, Power Electronics, EV & Motor Drivers, Analog Electronics, Digital Electronics, Signals & Systems, FPGA Design & Simulation, Microprocessors & Microcontrollers, Engineering Drawing, Control Systems, Power System Protection & Switchgear
- PCB Design Fundamentals, Schematic Capture, Electrical Wiring Diagrams
- Sensor Interfacing & Transducer Calibration, Closed-Loop Control System Design

### Engineering Design & Simulation Tools

- **Simulation:** MATLAB, Simulink, Proteus, OrCAD PSpice, Mi Power
- **FPGA & Digital Design:** Xilinx Vivado, Intel Quartus Prime
- **CAD:** AutoCAD Electrical, Autodesk Fusion 360

### Embedded Systems & Industrial Automation

- Microcontroller Firmware: ESP32, Arduino Uno, ARM-based Processors
- Embedded C/C++ Programming, Real-Time Control Logic, Peripheral Interfacing (I2C, SPI, UART, ADC)
- Servo Actuation, Multi-Sensor Fusion, FreeRTOS Concepts _(fundamentals)_
- IoT Platform Integration: Blynk IoT, Wi-Fi-based Edge Systems, OTA Updates

### Programming & Software Skills

- **Languages:** Python, C, Embedded C, C++, Java, JavaScript
- **Frontend:** React 19, TypeScript, Next.js, React Native, HTML5, CSS3, Tailwind CSS, Bootstrap
- **Build Tools:** Vite
- **Backend:** Express.js , Flask, WebSockets, REST APIs
- **Databases & Cloud:** Firebase (NoSQL), Supabase (PostgreSQL), MongoDB
- **Version Control:** Git, GitHub

### AI & Machine Learning Skills

#### Core Technical Skills

- **Programming:** Python
- **Frameworks & Libraries:** TensorFlow, PyTorch, Keras, Scikit-learn
- **Mathematics:** Linear Algebra, Calculus, Probability & Statistics _(for model optimisation)_
- **Data Science:** Pandas, NumPy, Matplotlib, Seaborn _(data manipulation, EDA, visualisation)_

#### Data & Annotation

- **Dataset Platforms:** Roboflow, CVAT.ai, Label Studio, LabelMe, Doccano
- **Data Skills:** Dataset curation, preprocessing, augmentation, SQL-based data management

#### Machine Learning

- Supervised & Unsupervised Learning, Neural Networks, Decision Trees, Ensemble Methods
- Computer Vision: Object Detection (YOLOv8), Image Segmentation, OpenCV-based inspection pipelines
- Natural Language Processing (NLP) _(fundamentals)_
- Generative AI & Large Language Models (LLMs) _(applied, via Firebase Genkit & Google AI APIs)_

#### Deployment & MLOps

- Model export: ONNX _(edge deployment on embedded hardware)_
- Cloud Platforms: Google Cloud (GCP), Firebase Cloud Functions _(AI inference pipelines)_
- MLOps concepts: Experiment tracking, model versioning, CI-integrated evaluation

---

## TECHNICAL PROJECTS

### ⚙️ Automated Rod and Pipe Inspection System

**Tech Stack:** Python · OpenCV · YOLOv8 · Flask · ESP32-CAM · C++
[github.com/Mekesh-Engineer](https://github.com/Mekesh-Engineer) _(Industrial Automation | Machine Vision)_

An end-to-end automated quality inspection system replacing manual measurement with machine vision for manufacturing-line use.

- Programmed **ESP32-CAM firmware** in C++ to stream real-time JPEG frames over Wi-Fi via HTTP endpoints for low-latency video ingestion.
- Integrated **computer vision algorithms** (YOLOv8 + OpenCV) to detect surface defects and compute dimensional measurements with high accuracy.
- Built a **multi-threaded Flask backend** to handle concurrent video streams and serve inference results efficiently.
- Designed a **live operator dashboard** displaying FPS, inference latency, detection logs, and real-time video — replicating SCADA-like monitoring interfaces.
- Demonstrates direct applicability to **industrial quality control** and automated inspection workflows in manufacturing environments.

---

### 🚗 V2X Communication and Fleet Monitoring System

**Tech Stack:** Python · Flask · WebSockets · SSE · UDP · ESP32 · C++
[github.com/Mekesh-Engineer](https://github.com/Mekesh-Engineer) _(Fleet Automation | Real-Time Telemetry)_

A real-time vehicle-to-everything (V2X) telemetry and control platform for multi-device fleet coordination — analogous to industrial SCADA and remote monitoring systems.

- Architected a **full-stack telemetry API** ingesting high-frequency sensor data (distance, temperature, humidity, battery, IR obstacles) from distributed ESP32 edge nodes.
- Engineered a **UDP auto-discovery service** for zero-configuration dynamic IP resolution across local networks — applicable to industrial plant-floor device management.
- Built a **thread-safe global state manager** with mutex-protected command queuing to ensure reliable, non-blocking control instruction delivery.
- Implemented a **low-latency MJPEG video proxy server** to relay live ESP32-CAM feeds to a central dashboard, eliminating cross-origin network restrictions.
- Presented at **5 inter-collegiate technical events** including Robofiesta 2K25 (SREC) and Ideathon 2K24 (KEC).

---

### 🏟️ Smart IoT-Based Event and Venue Management Platform

**Tech Stack:** React 19 · TypeScript · Firebase · YOLOv8 · ESP32-CAM · Python
[github.com/Mekesh-Engineer](https://github.com/Mekesh-Engineer) _(IoT Systems | Full-Stack Engineering)_

> 🏆 **1st Prize – Tamizhanskills Ideathon 2026**, New Prince Shri Bhavani College of Engineering, Chennai

A full-stack IoT platform integrating hardware, cloud, and AI for real-time venue monitoring, automated access control, and crowd management.

- Deployed **edge-based crowd density analysis** (YOLOv8) to trigger autonomous safety alerts and gimbal control when occupancy thresholds were exceeded.
- Engineered a **high-speed QR ticket validation system** using ESP32-CAM with cryptographic security and automated gate actuation.
- Built a **scalable serverless Firebase backend** (Firestore + Cloud Functions) with multi-tier Role-Based Access Control (RBAC) and atomic ticket inventory synchronisation.
- Developed a **real-time React 19 monitoring dashboard** for live crowd flow, hardware health, and ticket sales using Zustand and React Query.

---

### 🗑️ IoT Automated Waste Segregation System

**Tech Stack:** C++ · ESP32 · Blynk IoT · Inductive / Capacitive / IR Sensors · Servo Motors
[github.com/Mekesh-Engineer](https://github.com/Mekesh-Engineer) _(Embedded Systems | Smart Automation)_

An autonomous smart waste classification system demonstrating applied embedded control logic, multi-sensor fusion, and cloud-connected monitoring.

- Implemented **multi-sensor fusion** (inductive, capacitive, IR) for autonomous classification of metal, plastic, and organic waste.
- Programmed **real-time embedded control logic** to translate sensor readings into servo-driven sorting actuation — a direct analogy to PLC-controlled industrial sorting systems.
- Integrated **Blynk IoT dashboard** for remote monitoring of bin capacity, waste distribution, and system health via Wi-Fi.

---

### 🌐 Full-Stack Portfolio and Resume Builder Web App

**Tech Stack:** React 19 · TypeScript · Vite · Firebase (Auth + Firestore) · Framer Motion · Zod · Zustand · Vitest
[github.com/Mekesh-Engineer](https://github.com/Mekesh-Engineer) _(Full-Stack Web Engineering | Product Systems)_

A production-style full-stack web application for building, managing, and publishing technical portfolio and resume content with secure authentication, real-time data workflows, and modular UI architecture.

- Engineered a **role-aware dashboard platform** with protected routing, authentication callbacks, and centralised state management for profile, projects, resume, and settings modules.
- Built **schema-validated content pipelines** (Zod-based) for personal info, projects, experience, skills, themes, and contact forms to improve data integrity and reduce invalid submissions.
- Implemented **real-time and productivity features** including autosave hooks, clipboard/export utilities, analytics views, search/filter tooling, and responsive UI sections optimised for desktop and mobile.
- Structured the app into reusable component layers and feature modules, with **test coverage using Vitest** to support maintainability and iterative deployment.

---

### ⚡ Smart Hybrid Energy Management System using Fuzzy Logic

**Tech Stack:** Arduino Mega · Fuzzy Logic (eFLL) · Proteus · Embedded C · ACS712 Current Sensors · Power Electronics
[github.com/Mekesh-Engineer](https://github.com/Mekesh-Engineer) _(Energy Systems | Smart Grid Automation)_

An intelligent energy optimisation system that dynamically manages load distribution between grid and renewable sources using fuzzy logic-based decision making.

- Designed a **Fuzzy Logic Controller (FLC)** using multi-parameter inputs (time, load, grid availability, battery status) to optimise energy usage decisions.
- Implemented **real-time load monitoring** using ACS712 current sensors and voltage divider circuits for battery state estimation.
- Built a **relay-based switching architecture** to dynamically route power between grid and battery for efficient energy utilisation.
- Simulated the complete system in **Proteus Design Suite**, including inverter, solar input, and load switching mechanisms.
- Demonstrates strong application in smart homes, energy optimisation, and demand-side management systems.

---

### 🚓 GPS-Based Smart Vehicle Horn & Speed Regulation System

**Tech Stack:** ESP32 · GPS (NEO-6M) · L298N Motor Driver · Embedded C++ · Wi-Fi · Web Server
[github.com/Mekesh-Engineer](https://github.com/Mekesh-Engineer) _(Embedded Systems | Intelligent Transportation)_

A geofence-aware smart vehicle system that automatically regulates speed and restricts horn usage in sensitive zones such as hospitals and campuses.

- Implemented **GPS-based geofencing logic** using the Haversine distance formula to detect zone entry in real time.
- Designed an **adaptive motor control system** using PWM to dynamically reduce vehicle speed inside restricted zones.
- Built a **real-time web dashboard and control interface** for telemetry monitoring and manual control (mobile and desktop).
- Integrated **state-driven buzzer control logic** to disable horn functionality and trigger alert feedback in restricted zones.

---

### 🎮 Cosmic Strikes — 3D Arcade Space Shooter

**Tech Stack:** React · TypeScript · Three.js · React Three Fiber · Node.js · Express · MongoDB / SQLite
[github.com/Mekesh-Engineer](https://github.com/Mekesh-Engineer) _(Full-Stack Systems | Interactive 3D Applications)_

A high-performance full-stack 3D arcade shooter combining real-time rendering, game logic, and backend-driven leaderboards.

- Engineered a **WebGL-based 3D rendering pipeline** using React Three Fiber for smooth 60 FPS gameplay.
- Designed a **scalable game architecture** with Redux state management and modular component structure.
- Built a **Node.js backend API** with JWT authentication and leaderboard system supporting MongoDB and SQLite.
- Implemented **dynamic gameplay systems** including wave progression, difficulty scaling, and combo-based scoring logic.

---

## ACHIEVEMENTS

| Year | Award                | Project / Activity                          | Event & Institution                                                                    |
| ---- | -------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------- |
| 2026 | 🥇 1st Prize         | Smart IoT Event & Venue Management Platform | Tamizhanskills Ideathon 2026 — New Prince Shri Bhavani College of Engineering, Chennai |
| 2025 | 🥉 3rd Prize         | ROV-Based Underwater Crack Detection System | Project Prism – Oracle 2025 — Government College of Technology, Coimbatore             |
| 2026 | 🥉 3rd Prize         | Smart IoT Event & Venue Management Platform | Elixir 2026 Technical Event — Government College of Engineering, Erode                 |
| 2023 | 🏅 School First Rank | Higher Secondary Examination                | Govt. Boys Higher Secondary School, Palacode                                           |

---

## INDUSTRIAL TRAINING & EXPOSURE

### In-Plant Training

**Hatsun Agro Products Ltd., Vellichandai** | 15–19 July 2024
Gained hands-on exposure to industrial manufacturing operations, production line workflows, equipment maintenance practices, and plant automation systems.

**Pavithran Aseptic Fruit Products** | 1–5 January 2025
Studied aseptic processing techniques, quality control protocols, instrumentation used in food-grade production, and compliance with industrial standards.

### Industrial Visits

- **Radio Astronomy Centre (RAC), Ooty** – November 2024 _(large-scale signal processing and RF systems)_
- **Kodaikanal Solar Observatory (KoSO)** – March 2025 _(precision instrumentation and data acquisition systems)_

---

## CERTIFICATIONS

**Professional & Technical**

- Embedded Application Development using ARM Processors — Maven Silicon (2025)
- AutoCAD Electrical Design — Cadcentre Cochin (2023)

**Additional**

- Introduction to Generative AI — Google Cloud (2024)
- Java for Beginners — Infosys Springboard (2024)
- Energy Literacy Training — Energy Swaraj Foundation (2023)

---

## TECHNICAL PRESENTATIONS & COMPETITIONS

**V2X Communication and Fleet Monitoring System** — Presented at 5 events:
Ideathon 2K24 (KEC) · Robofiesta 2K25 (SREC) · Autonix 2024 (KEC) · Project Expo 2K25 (KEC) · Proof of Concept 2K25 (KEC)

**Smart IoT Event & Venue Management Platform** — Presented at 5 events:
Tech Aura 2026 – IEEE (KPR Institute) · Elixir 2026 (GCE Erode) · Exodia 2026 – ISTE Hackathon (KEC) · Tech Fest 2K25 (KEC) · Proof of Concept 2K25 (KEC)

**ROV-Based Underwater Crack Detection System:**
Oracle 2K25 — Government College of Technology, Coimbatore

---

## MEMBERSHIPS & LEADERSHIP

**ISTE – Indian Society for Technical Education** | Executive Member (2024 – Present)
Actively contributed to organising technical events, workshops, and inter-departmental competitions at Kongu Engineering College.

**NSS – National Service Scheme** | Executive Member (2024 – Present)
Led and participated in community outreach, rural development, and social responsibility programmes.

---

## LANGUAGES

Tamil: Native | English: Professional | Hindi: Working

---

## AREAS OF INTEREST

Embedded Systems & Firmware Development | Industrial Automation & Control | IoT & Smart Systems | Power Electronics | Computer Vision & AI-Integrated Engineering | Full-Stack Industrial Software

---

_I hereby declare that all information provided in this résumé is true and accurate to the best of my knowledge._

**Mekesh Kumar**
Place: Perundurai | Date: **\*\***\_\_\_\_**\*\***
