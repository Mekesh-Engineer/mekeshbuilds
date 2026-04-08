/**
 * SkillData.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * PURE DATA LAYER — zero React, zero UI logic.
 * All skill metadata is sourced directly from Mekesh Kumar's résumé.
 * Consumed by TechArsenal.tsx and any other skill-display component.
 *
 * Architecture:
 * SKILL_CATEGORIES[]
 * └─ SkillCategory  { id, label, tagline, color, iconKey, skills[] }
 * └─ Skill      { id, name, iconKey, proficiency, experience,
 * projects, level, trend, description, extendedDesc,
 * tags, achievements, ecosystem, relatedProjects }
 *
 * iconKey strings are resolved to React nodes by the UI layer (ICON_MAP).
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type SkillLevel = 'Expert' | 'Advanced' | 'Proficient';
export type SkillTrend = 'mastered' | 'growing' | 'active';

export interface Skill {
  /** Stable identifier — never changes even if name text changes */
  id: string;
  /** Display name shown in orbit pills and detail panel */
  name: string;
  /** Key resolved to a React icon component in the UI layer */
  iconKey: string;
  /** 0–100 ring percentage */
  proficiency: number;
  /** Human-readable time string e.g. "3+ yrs" */
  experience: string;
  /** Count of projects where this skill was applied */
  projects: number;
  /** Recruiter-facing competency tier */
  level: SkillLevel;
  /** Current trajectory signal */
  trend: SkillTrend;
  /** One-line blurb for compact views */
  description: string;
  /** 2–3 sentence recruiter-focused narrative */
  extendedDesc: string;
  /** Keyword tags for quick scanning */
  tags: string[];
  /** Verified achievements tied to actual résumé projects */
  achievements: string[];
  /** Tools / libraries / frameworks in this skill's orbit */
  ecosystem: string[];
  /** Named résumé projects where this skill was the primary driver */
  relatedProjects?: string[];
}

export interface SkillCategory {
  /** URL-safe identifier */
  id: string;
  /** Tab label */
  label: string;
  /** Short context line shown in UI */
  tagline: string;
  /** Hex accent colour — unique per category */
  color: string;
  /** Icon key for the orbit centre beacon */
  iconKey: string;
  skills: Skill[];
}

// ─── Category Definitions ─────────────────────────────────────────────────────
// Order matches the tab row in the UI.

export const SKILL_CATEGORIES: SkillCategory[] = [
  /* ══════════════════════════════════════════════════════════════════
     1. CORE EEE
     Source: "Electrical & Electronics Fundamentals" résumé section
     ══════════════════════════════════════════════════════════════════ */
  {
    id: 'core-eee',
    label: 'Core EEE',
    tagline: 'Electrical & Electronics Engineering fundamentals',
    color: 'var(--sys-warning)',
    iconKey: 'electric_bolt',
    skills: [
      {
        id: 'circuits',
        name: 'Circuit Design',
        iconKey: 'sensors',
        proficiency: 92,
        experience: '3+ yrs',
        projects: 12,
        level: 'Expert',
        trend: 'mastered',
        description: 'End-to-end analog & digital circuit design for mixed-signal systems.',
        extendedDesc:
          'Proficient in analysing and designing discrete analog and digital circuits from schematic capture through hardware deployment. Covers active/passive filter design, amplifier topologies, transducer calibration, and closed-loop control system integration across multiple real-world projects.',
        tags: ['Analog Electronics', 'Schematic Capture', 'Closed-Loop Control'],
        achievements: [
          'Designed relay-based switching circuit for Smart Hybrid Energy Management System',
          'Engineered ACS712-based real-time load monitoring circuits for energy optimisation',
        ],
        ecosystem: ['Passive/Active Filters', 'Op-Amps', 'Timers', 'Relay Drivers'],
        relatedProjects: [
          'Smart Hybrid Energy Management System',
          'IoT Automated Waste Segregation System',
        ],
      },
      {
        id: 'power-systems',
        name: 'Power Systems',
        iconKey: 'electric_meter',
        proficiency: 88,
        experience: '2+ yrs',
        projects: 5,
        level: 'Advanced',
        trend: 'active',
        description: 'High-power network analysis, smart grids, and switchgear protection.',
        extendedDesc:
          'Covers high-power network analysis, smart grid topologies, and switchgear protection logic. Experienced with multi-phase load handling, fault simulation using Mi Power, and relay-based energy routing between grid and battery sources.',
        tags: ['Power Electronics', 'Switchgear', 'Smart Grids'],
        achievements: [
          'Optimised relay-based energy routing between grid and battery sources',
        ],
        ecosystem: ['Mi Power', 'AC/DC Converters', 'Relays'],
        relatedProjects: ['Smart Hybrid Energy Management System'],
      },
      {
        id: 'ev-technology',
        name: 'EV Motor Drivers',
        iconKey: 'electric_car',
        proficiency: 85,
        experience: '2+ yrs',
        projects: 3,
        level: 'Advanced',
        trend: 'growing',
        description: 'Power electronics and drive systems for Electric Vehicles.',
        extendedDesc:
          'Applied knowledge of power electronics tailored for EV motor drivers. Involves understanding inverter topologies, battery input switching, and load management crucial for electric vehicle powertrains.',
        tags: ['EV Motor Drivers', 'Inverters', 'Power Electronics'],
        achievements: [
          'Implemented inverter + solar-input + load switching in Proteus for Smart Hybrid Energy System',
        ],
        ecosystem: ['Inverters', 'Motor Drives', 'Battery Management Concepts'],
        relatedProjects: ['Smart Hybrid Energy Management System'],
      },
      {
        id: 'signals-dsp',
        name: 'Signals & DSP',
        iconKey: 'graphic_eq',
        proficiency: 85,
        experience: '2+ yrs',
        projects: 4,
        level: 'Advanced',
        trend: 'growing',
        description: 'Digital Signal Processing theory and transform methods.',
        extendedDesc:
          'Applies Fourier, Laplace, and Z-transforms for system stability analysis and frequency-domain understanding. Practical experience processing noisy sensor telemetry in real industrial environments.',
        tags: ['DSP', 'Transform Methods', 'Signal Filtering'],
        achievements: [
          'Processed and filtered noisy telemetry from multi-sensor arrays for automated logic systems',
        ],
        ecosystem: ['Z-Transform', 'Laplace', 'Continuous/Discrete Time'],
        relatedProjects: ['GPS Smart Vehicle System'],
      },
      {
        id: 'control-systems',
        name: 'Control Systems',
        iconKey: 'tune',
        proficiency: 86,
        experience: '2+ yrs',
        projects: 6,
        level: 'Advanced',
        trend: 'active',
        description: 'PID controller design and fuzzy logic implementation.',
        extendedDesc:
          'Designs and implements closed-loop control architectures. Practical experience tuning PID controllers for servo actuation and simulating complex fuzzy logic topologies in MATLAB/Simulink.',
        tags: ['PID Control', 'Stability Analysis', 'Fuzzy Logic'],
        achievements: [
          'Tuned PWM-based adaptive motor control for GPS Vehicle Speed Regulation System',
          'Designed fuzzy logic controller (multi-parameter) for Smart Hybrid Energy Management',
        ],
        ecosystem: ['PID Tuning', 'Fuzzy Logic Controllers', 'Feedback Loops'],
        relatedProjects: ['GPS Smart Vehicle System', 'Smart Hybrid Energy Management System'],
      },
      {
        id: 'digital-electronics',
        name: 'Digital Electronics',
        iconKey: 'memory',
        proficiency: 80,
        experience: '1.5+ yrs',
        projects: 4,
        level: 'Proficient',
        trend: 'active',
        description: 'Combinational logic, sequential circuits, and state machines.',
        extendedDesc:
          'Designs combinational and sequential logic circuits, complex state machines, and hardware-accelerated functions. Deeply covered through degree coursework and targeted practical lab exercises.',
        tags: ['Logic Design', 'State Machines', 'Sequential Logic'],
        achievements: [
          'Designed hardware traffic control state machine in practical lab exercises',
        ],
        ecosystem: ['Combinational Logic', 'Registers', 'Flip-Flops'],
        relatedProjects: [],
      },
      {
        id: 'fpga-design',
        name: 'FPGA Implementation',
        iconKey: 'developer_board',
        proficiency: 78,
        experience: '1.5+ yrs',
        projects: 2,
        level: 'Proficient',
        trend: 'growing',
        description: 'HDL-based hardware design and FPGA deployment.',
        extendedDesc:
          'Writes VHDL/Verilog for FPGA synthesis, place-and-route, and timing analysis. Translates digital logic concepts into bitstreams for physical hardware acceleration.',
        tags: ['FPGA', 'VHDL/Verilog', 'Hardware Synthesis'],
        achievements: [
          'Synthesised custom ALU architecture with timing-verified bitstream',
        ],
        ecosystem: ['VHDL', 'Verilog', 'Logic Synthesis'],
        relatedProjects: [],
      },
      {
        id: 'pcb-design',
        name: 'PCB & Schematic Design',
        iconKey: 'developer_board',
        proficiency: 82,
        experience: '2+ yrs',
        projects: 8,
        level: 'Advanced',
        trend: 'active',
        description: 'Schematic capture, PCB layout, and electrical wiring diagrams.',
        extendedDesc:
          'Competent in schematic capture and PCB layout fundamentals for prototype and production boards. Produces clean electrical wiring diagrams for industrial panel designs using AutoCAD Electrical. Also applies Proteus for circuit-level PCB routing and pre-deployment validation of embedded node hardware.',
        tags: ['PCB Layout', 'Schematic Capture', 'Wiring Diagrams'],
        achievements: [
          'AutoCAD Electrical Design certified — Cadcentre Cochin (2023)',
          'Pre-validated V2X node PCB routing in Proteus before hardware manufacture',
        ],
        ecosystem: ['Proteus ARES', 'AutoCAD Electrical', 'KiCad Basics'],
        relatedProjects: ['V2X Communication & Fleet Monitoring System'],
      },
      {
        id: 'elec-machines',
        name: 'Electrical Machines',
        iconKey: 'settings_input_component',
        proficiency: 76,
        experience: '2+ yrs',
        projects: 5,
        level: 'Advanced',
        trend: 'active',
        description: 'Motor theory, drives, and machine performance characteristics.',
        extendedDesc:
          'Strong foundational understanding of DC/AC motors, transformers, induction machines, and generator characteristics from core degree modules. Applied practically in PWM-based motor speed control and servo actuation for embedded robotics and automation projects.',
        tags: ['DC/AC Motors', 'Servo Actuation', 'PWM Control'],
        achievements: [
          'Implemented L298N-based adaptive motor speed control for GPS Smart Vehicle System',
          'Applied servo motor actuation for multi-bin waste classification logic',
        ],
        ecosystem: ['L298N Driver', 'Servo Motors', 'PWM', 'Stepper Drives'],
        relatedProjects: ['GPS Smart Vehicle System', 'IoT Automated Waste Segregation System'],
      },
    ],
  },

  /* ══════════════════════════════════════════════════════════════════
     2. SIMULATION
     Source: "Engineering Design & Simulation Tools" résumé section
     ══════════════════════════════════════════════════════════════════ */
  {
    id: 'simulation',
    label: 'Simulation',
    tagline: 'Engineering design, modelling & simulation tools',
    color: 'var(--sys-accent-light)',
    iconKey: 'science',
    skills: [
      {
        id: 'matlab',
        name: 'MATLAB',
        iconKey: 'calculate',
        proficiency: 90,
        experience: '3+ yrs',
        projects: 10,
        level: 'Expert',
        trend: 'mastered',
        description: 'Mathematical modelling, algorithm testing, and data visualisation.',
        extendedDesc:
          'Utilises MATLAB for complex numerical computations, toolbox-driven signal processing workflows, and generating comprehensive data visualisations. Essential for mathematical modelling before system deployment.',
        tags: ['Data Visualisation', 'Mathematical Modelling', 'Signal Processing'],
        achievements: [
          'Applied Signal Processing Toolbox for telemetry noise filtering algorithms',
        ],
        ecosystem: ['MATLAB', 'Signal Processing Toolbox', 'Scripting'],
        relatedProjects: ['Smart Hybrid Energy Management System'],
      },
      {
        id: 'simulink',
        name: 'Simulink',
        iconKey: 'account_tree',
        proficiency: 88,
        experience: '3+ yrs',
        projects: 8,
        level: 'Expert',
        trend: 'mastered',
        description: 'Dynamic system simulation and control logic verification.',
        extendedDesc:
          'Deep practical experience simulating physical plant models, control system topologies, and fuzzy logic decision blocks. Integrates control logic directly within simulation loops for verification before hardware deployment.',
        tags: ['Simulink', 'Fuzzy Logic', 'Control Systems Toolbox'],
        achievements: [
          'Built complete Fuzzy Logic Controller (FLC) for Smart Hybrid Energy Management in Simulink',
          'Simulated multi-parameter energy routing across grid, battery, and load states',
        ],
        ecosystem: ['Simulink', 'Control Systems Toolbox', 'Fuzzy Logic Toolbox'],
        relatedProjects: ['Smart Hybrid Energy Management System'],
      },
      {
        id: 'proteus',
        name: 'Proteus VSM',
        iconKey: 'memory',
        proficiency: 88,
        experience: '2+ yrs',
        projects: 10,
        level: 'Advanced',
        trend: 'active',
        description: 'Virtual MCU simulation and circuit verification.',
        extendedDesc:
          'Experienced in simulating full embedded environments by loading pre-compiled HEX firmware directly into virtual microcontrollers (ISIS VSM). Pre-validates circuit performance before hardware manufacture to eliminate design-stage errors.',
        tags: ['Virtual Simulation', 'MCU Simulation', 'PCB Routing'],
        achievements: [
          'Pre-validated complex V2X node circuits in Proteus before physical PCB manufacture',
          'Simulated complete inverter + solar-input switching for Smart Hybrid Energy System',
        ],
        ecosystem: ['Proteus ISIS', 'Proteus ARES', 'HEX Firmware'],
        relatedProjects: [
          'V2X Communication & Fleet Monitoring System',
          'Smart Hybrid Energy Management System',
        ],
      },
      {
        id: 'orcad-pspice',
        name: 'OrCAD PSpice',
        iconKey: 'analytics',
        proficiency: 85,
        experience: '2+ yrs',
        projects: 5,
        level: 'Advanced',
        trend: 'active',
        description: 'Analog and mixed-signal SPICE analysis.',
        extendedDesc:
          'Uses OrCAD PSpice for transient, AC, and DC sweep analyses. Accurately predicts component behaviour and circuit frequency responses under varying load conditions.',
        tags: ['SPICE Analysis', 'Transient Analysis', 'Sweep Analysis'],
        achievements: [
          'Validated active filter frequency responses via AC sweep simulation',
        ],
        ecosystem: ['OrCAD', 'PSpice', 'SPICE Netlist'],
        relatedProjects: [],
      },
      {
        id: 'xilinx-vivado',
        name: 'Xilinx Vivado',
        iconKey: 'grid_view',
        proficiency: 80,
        experience: '1.5+ yrs',
        projects: 3,
        level: 'Proficient',
        trend: 'growing',
        description: 'FPGA synthesis and timing simulation for Xilinx architecture.',
        extendedDesc:
          'Uses Vivado Design Suite for RTL design entry, logic synthesis, place-and-route, and static timing analysis. Compiles custom processing blocks onto FPGA targets.',
        tags: ['Vivado', 'Synthesis', 'Place & Route'],
        achievements: [
          'Synthesised custom ALU architecture with verified timing constraints in Vivado',
          'Completed VHDL-based traffic controller state machine implementation',
        ],
        ecosystem: ['Vivado Design Suite', 'Testbenches', 'Constraints'],
        relatedProjects: [],
      },
      {
        id: 'intel-quartus',
        name: 'Intel Quartus',
        iconKey: 'developer_board',
        proficiency: 78,
        experience: '1.5+ yrs',
        projects: 2,
        level: 'Proficient',
        trend: 'active',
        description: 'Logic synthesis and timing analysis for Intel FPGAs.',
        extendedDesc:
          'Familiar with Intel Quartus Prime for testbench simulation, functional verification, and full implementation flows for digital logic designs.',
        tags: ['Quartus Prime', 'Logic Synthesis', 'Timing Analysis'],
        achievements: [
          'Verified sequential logic architectures via Quartus simulation tools',
        ],
        ecosystem: ['Intel Quartus Prime', 'VHDL/Verilog'],
        relatedProjects: [],
      },
      {
        id: 'autocad-electrical',
        name: 'AutoCAD Electrical',
        iconKey: 'architecture',
        proficiency: 78,
        experience: '2+ yrs',
        projects: 6,
        level: 'Proficient',
        trend: 'active',
        description: 'Industrial electrical panel layout and schematic documentation.',
        extendedDesc:
          'Certified in AutoCAD Electrical Design (Cadcentre Cochin, 2023). Capable of producing standards-compliant electrical wiring diagrams, panel layouts, and single-line diagrams for industrial control systems. Applies in engineering documentation workflows for embedded and automation system designs.',
        tags: ['Panel Layout', 'Wiring Diagrams', 'SLD'],
        achievements: [
          'AutoCAD Electrical Design Certificate — Cadcentre Cochin (2023)',
          'Produced compliant panel layout documentation for automation system designs',
        ],
        ecosystem: ['AutoCAD Electrical', 'Panel Schematics', 'Cable Schedules'],
        relatedProjects: [],
      },
      {
        id: 'fusion360',
        name: 'Autodesk Fusion 360',
        iconKey: 'view_in_ar',
        proficiency: 74,
        experience: '1.5+ yrs',
        projects: 4,
        level: 'Proficient',
        trend: 'active',
        description: '3D mechanical enclosure design for embedded system housings.',
        extendedDesc:
          'Designs custom mechanical enclosures and mounting fixtures for embedded hardware projects using Autodesk Fusion 360. Applies parametric modelling to ensure IP-rated protection and proper PCB fitment. Bridges the gap between electronics design and physical product packaging.',
        tags: ['3D Modelling', 'Parametric Design', 'Enclosures'],
        achievements: [
          'Designed IP67-rated custom sensor enclosures for outdoor embedded deployments',
          'Modelled custom PCB mounting fixtures with proper thermal considerations',
        ],
        ecosystem: ['Fusion 360', 'Parametric Modelling', '3D Printing Ready'],
        relatedProjects: [],
      },
    ],
  },

  /* ══════════════════════════════════════════════════════════════════
     3. EMBEDDED SYSTEMS
     Source: "Embedded Systems & Industrial Automation" résumé section
     ══════════════════════════════════════════════════════════════════ */
  {
    id: 'embedded',
    label: 'Embedded',
    tagline: 'Firmware, real-time control & IoT integration',
    color: 'var(--sys-accent)',
    iconKey: 'memory',
    skills: [
      {
        id: 'esp32',
        name: 'ESP32 Firmware',
        iconKey: 'router',
        proficiency: 92,
        experience: '3+ yrs',
        projects: 15,
        level: 'Expert',
        trend: 'mastered',
        description: 'Wi-Fi/Bluetooth edge computing and peripheral integration.',
        extendedDesc:
          'Expert-level development for the ESP32 ecosystem. Configures hardware timers, operates complex peripheral buses (I2C, SPI, UART, ADC), and engineers connected IoT solutions. Delivers production-grade firmware shipped in multiple competitive projects.',
        tags: ['ESP32', 'IoT Edge', 'Peripheral Interfaces'],
        achievements: [
          'V2X telemetry nodes presented at 5+ inter-collegiate events including Robofiesta 2K25',
          'Engineered thread-safe UDP auto-discovery service for zero-config V2X device management',
        ],
        ecosystem: ['ESP-IDF', 'Arduino Framework', 'PlatformIO'],
        relatedProjects: [
          'V2X Fleet Monitoring System',
          'IoT Waste Segregation System',
          'Smart Venue Platform',
        ],
      },
      {
        id: 'arm-firmware',
        name: 'ARM Processors',
        iconKey: 'memory',
        proficiency: 88,
        experience: '2+ yrs',
        projects: 5,
        level: 'Advanced',
        trend: 'growing',
        description: 'Bare-metal programming for ARM Cortex architectures.',
        extendedDesc:
          'Writes hardware abstraction layers and deterministic code for ARM-based processors. Certified via Maven Silicon ARM Processor Development course (2025). Focuses on efficient memory management and low-latency execution.',
        tags: ['ARM Cortex', 'Bare-Metal', 'Microcontrollers'],
        achievements: [
          'Certified — Embedded Application Development using ARM Processors (Maven Silicon, 2025)',
        ],
        ecosystem: ['ARM CMSIS', 'GCC ARM Toolchain', 'OpenOCD'],
        relatedProjects: ['GPS Smart Vehicle System'],
      },
      {
        id: 'embedded-c',
        name: 'Embedded C',
        iconKey: 'code',
        proficiency: 92,
        experience: '3+ yrs',
        projects: 20,
        level: 'Expert',
        trend: 'mastered',
        description: 'Low-level firmware design, HAL layers, and deterministic logic.',
        extendedDesc:
          'Deep fluency in Embedded C for writing deterministic firmware. Covers interrupt service routines (ISRs), DMA transfers, GPIO management, and memory-efficient data structures applied across 8+ strict real-time hardware projects.',
        tags: ['C', 'ISR', 'DMA', 'HAL'],
        achievements: [
          'Built mutex-protected command queue for non-blocking fleet control instruction delivery',
        ],
        ecosystem: ['GCC', 'UART/SPI/I2C/ADC'],
        relatedProjects: ['V2X Fleet Monitoring System', 'Smart Hybrid Energy Management System'],
      },
      {
        id: 'embedded-cpp',
        name: 'Embedded C++',
        iconKey: 'data_object',
        proficiency: 88,
        experience: '2.5+ yrs',
        projects: 10,
        level: 'Advanced',
        trend: 'active',
        description: 'Object-oriented hardware abstraction and RTOS integration.',
        extendedDesc:
          'Leverages object-oriented principles in C++ to write modular, reusable hardware abstraction layers for sensors and actuators without sacrificing bare-metal performance capabilities.',
        tags: ['C++', 'OOP Firmware', 'Hardware Abstraction'],
        achievements: [
          'Developed modular OOP sensor classes for rapid deployment across multiple IoT projects',
        ],
        ecosystem: ['C++11/14 (Embedded)', 'PlatformIO'],
        relatedProjects: ['IoT Waste Segregation System'],
      },
      {
        id: 'multi-sensor',
        name: 'Multi-Sensor Fusion',
        iconKey: 'sensors',
        proficiency: 88,
        experience: '2.5+ yrs',
        projects: 12,
        level: 'Advanced',
        trend: 'mastered',
        description: 'Aggregating heterogeneous sensor inputs into reliable decision logic.',
        extendedDesc:
          'Reads, filters, and cross-references simultaneous inputs from inductive, capacitive, IR, GPS (Haversine formula), ACS712 current, temperature, and humidity sensors. Implements moving-average and threshold-hysteresis filtering to eliminate noise and produce reliable autonomous classification and actuation signals.',
        tags: ['Sensor Filtering', 'GPS Haversine', 'Calibration'],
        achievements: [
          'Built 3-modality fusion (inductive + capacitive + IR) for autonomous waste classification',
          'Implemented GPS-based geofencing with real-time zone detection for smart vehicle system',
        ],
        ecosystem: ['NEO-6M GPS', 'ACS712', 'DHT22', 'IR Modules', 'Inductive/Capacitive Sensors'],
        relatedProjects: [
          'IoT Waste Segregation System',
          'GPS Smart Vehicle System',
          'V2X Fleet Monitoring System',
        ],
      },
      {
        id: 'iot-telemetry',
        name: 'IoT & Telemetry',
        iconKey: 'cloud_upload',
        proficiency: 89,
        experience: '2.5+ yrs',
        projects: 10,
        level: 'Expert',
        trend: 'active',
        description: 'Cloud-to-edge pipelines, OTA updates, and device auto-discovery.',
        extendedDesc:
          'Integrates embedded edge nodes with cloud and local network infrastructure. Engineers OTA firmware update workflows, UDP-based zero-config device discovery, and real-time telemetry sync via Blynk IoT and WebSocket channels. Implemented SCADA-like remote monitoring dashboards for live fleet and sensor data.',
        tags: ['OTA Updates', 'UDP Discovery', 'Blynk IoT', 'WebSockets'],
        achievements: [
          'Architected full-stack V2X telemetry API ingesting high-frequency sensor data from distributed ESP32 nodes',
          '🥉 3rd Prize — ROV-Based Underwater Crack Detection System, Oracle 2025 (GCT Coimbatore)',
        ],
        ecosystem: ['Blynk IoT', 'Wi-Fi Edge', 'HTTP / TCP', 'MQTT Concepts', 'SSE'],
        relatedProjects: [
          'V2X Fleet Monitoring System',
          'IoT Waste Segregation System',
          'Smart Venue Platform',
        ],
      },
      {
        id: 'freertos',
        name: 'FreeRTOS',
        iconKey: 'schedule',
        proficiency: 82,
        experience: '1.5+ yrs',
        projects: 4,
        level: 'Advanced',
        trend: 'growing',
        description: 'Real-time OS multi-threading, task scheduling, and IPC primitives.',
        extendedDesc:
          'Structures concurrent firmware tasks with deterministic scheduling. Implements mutexes, binary/counting semaphores, and interrupt-safe queues to coordinate sensor sampling, actuator control, and network communication tasks without data races. Certified via Maven Silicon ARM Embedded Development training (2025).',
        tags: ['Task Scheduling', 'Semaphores', 'Mutexes', 'IPC Queues'],
        achievements: [
          'Achieved zero-data-loss across 5-sensor concurrent sampling in firmware task architecture',
          'Certified — Embedded Application Development using ARM Processors (Maven Silicon, 2025)',
        ],
        ecosystem: ['FreeRTOS Task API', 'ISR-Safe Queues', 'Semaphore Primitives', 'Tick Timers'],
        relatedProjects: ['V2X Fleet Monitoring System'],
      },
    ],
  },

  /* ══════════════════════════════════════════════════════════════════
     4. SOFTWARE ENGINEERING
     Source: "Programming & Software Skills" résumé section
     ══════════════════════════════════════════════════════════════════ */
  {
    id: 'software',
    label: 'Software',
    tagline: 'Full-stack engineering & production deployment',
    color: 'var(--sys-info)',
    iconKey: 'terminal',
    skills: [
      {
        id: 'react19',
        name: 'React 19',
        iconKey: 'react',
        proficiency: 93,
        experience: '2+ yrs',
        projects: 10,
        level: 'Expert',
        trend: 'mastered',
        description: 'Production PWAs, real-time dashboards, and component architecture.',
        extendedDesc:
          'Deploys high-performance web apps and IoT monitoring dashboards using React 19, Zustand state management, and Framer Motion. Builds protected routing, real-time data hooks (autosave, clipboard, analytics), and test-covered module architectures using Vitest.',
        tags: ['React 19', 'Zustand', 'Framer Motion', 'PWAs'],
        achievements: [
          '🏆 1st Prize — Tamizhanskills Ideathon 2026 (Smart IoT Venue Management Platform)',
          'Built portfolio builder with high-performance component architecture',
        ],
        ecosystem: ['React 19', 'Next.js', 'Vite', 'Tailwind CSS', 'React Query'],
        relatedProjects: [
          'Smart Venue Platform',
          'Portfolio Builder App',
        ],
      },
      {
        id: 'typescript',
        name: 'TypeScript',
        iconKey: 'code_blocks',
        proficiency: 90,
        experience: '2+ yrs',
        projects: 12,
        level: 'Expert',
        trend: 'mastered',
        description: 'Strict type safety, schema-validated pipelines, and scalable architectures.',
        extendedDesc:
          'Enforces strict type safety across full-stack repositories. Implements schema-validated content pipelines using Zod, ensuring robust data contracts between IoT edge devices, cloud APIs, and frontend dashboards.',
        tags: ['TypeScript Strict Mode', 'Type Safety', 'Zod Schemas'],
        achievements: [
          'Implemented Zod-validated data pipelines ensuring zero runtime type errors in telemetry processing',
          'Architected 100% type-safe portfolio builder frontend and serverless backend',
        ],
        ecosystem: ['TypeScript', 'Zod', 'TSConfig'],
        relatedProjects: [
          'Smart Venue Platform',
          'Portfolio Builder App',
          'Cosmic Strikes 3D Shooter',
        ],
      },
      {
        id: 'nodejs',
        name: 'Node.js',
        iconKey: 'nodejs',
        proficiency: 86,
        experience: '2+ yrs',
        projects: 8,
        level: 'Advanced',
        trend: 'active',
        description: 'Backend REST APIs, WebSocket servers, and real-time SSE channels.',
        extendedDesc:
          'Builds resilient backend servers using Express.js. Architects multi-threaded WebSocket rooms for concurrent ESP32 hardware clients and implements Server-Sent Events (SSE) for low-latency real-time event streaming. Achieved sub-50ms fleet discovery latency.',
        tags: ['Express.js', 'WebSockets', 'REST APIs', 'SSE'],
        achievements: [
          'V2X node fleet discovery latency under 50ms via Node.js UDP auto-discovery service',
        ],
        ecosystem: ['Node.js', 'Express.js', 'Socket.io', 'NPM'],
        relatedProjects: ['V2X Fleet Monitoring System'],
      },
      {
        id: 'python',
        name: 'Python',
        iconKey: 'terminal',
        proficiency: 85,
        experience: '2+ yrs',
        projects: 6,
        level: 'Advanced',
        trend: 'active',
        description: 'Flask servers, MJPEG video proxy endpoints, and data science pipelines.',
        extendedDesc:
          'Develops multi-threaded Python backends (Flask/FastAPI) designed for machine learning inference and video streaming. Routes live ESP32-CAM MJPEG video feeds through proxy endpoints to serve real-time analysis to frontend dashboards.',
        tags: ['Flask', 'MJPEG Proxy', 'Inference Backend'],
        achievements: [
          'Built multi-threaded Flask backend for concurrent video stream inference in pipe inspection',
        ],
        ecosystem: ['Python', 'Flask', 'OpenCV Python', 'Pandas'],
        relatedProjects: ['Automated Pipe Inspection System'],
      },
      {
        id: 'firebase',
        name: 'Firebase',
        iconKey: 'local_fire_department',
        proficiency: 85,
        experience: '1.5+ yrs',
        projects: 5,
        level: 'Advanced',
        trend: 'growing',
        description: 'Serverless cloud backends, NoSQL schemas, and zero-trust auth pipelines.',
        extendedDesc:
          'Implements complex NoSQL schemas in Firestore, zero-trust multi-tier authentication via custom claims, cloud function triggers, and atomically-consistent ticket inventory using transactions. Configured App Check for robust abuse prevention.',
        tags: ['Firestore', 'Cloud Functions', 'Firebase Auth', 'App Check'],
        achievements: [
          '🏆 1st Prize — Smart IoT Venue Platform with cryptographic ticket validation via Firebase',
          'Implemented App Check + custom claims auth pipeline for zero-trust venue access control',
        ],
        ecosystem: ['Firestore', 'Firebase Auth', 'Cloud Functions', 'App Check'],
        relatedProjects: ['Smart Venue Platform', 'Portfolio Builder App'],
      },
      {
        id: 'supabase',
        name: 'Supabase',
        iconKey: 'storage',
        proficiency: 78,
        experience: '1+ yr',
        projects: 2,
        level: 'Proficient',
        trend: 'growing',
        description: 'PostgreSQL cloud database and Row Level Security (RLS).',
        extendedDesc:
          'Designs relational database schemas using Supabase PostgreSQL. Implements Row Level Security (RLS) policies and Role-Based Access Control (RBAC) to ensure secure, scalable multi-tenant platforms.',
        tags: ['Supabase PostgreSQL', 'RBAC', 'RLS'],
        achievements: [
          'Built secure multi-tenant data isolation using Supabase RLS policies',
        ],
        ecosystem: ['PostgreSQL', 'Supabase Auth', 'Edge Functions'],
        relatedProjects: ['Portfolio Builder App'],
      },
      {
        id: 'git-version-control',
        name: 'Git & Version Control',
        iconKey: 'fork_right',
        proficiency: 85,
        experience: '2+ yrs',
        projects: 20,
        level: 'Advanced',
        trend: 'active',
        description: 'Version control, branching strategies, and collaborative workflows.',
        extendedDesc:
          'Uses Git and GitHub for all project development — branching strategies, pull request workflows, and commit hygiene. Applied across all 8+ résumé projects with public repositories. Experience with CI-integrated evaluation pipelines and structured project-to-deployment workflows.',
        tags: ['Git', 'GitHub', 'Branching', 'CI Integration'],
        achievements: [
          'All 8+ résumé projects version-controlled on GitHub with structured commit histories',
          'Applied CI-integrated model evaluation workflows in MLOps pipeline',
        ],
        ecosystem: ['Git', 'GitHub', 'GitHub Actions Concepts', 'Conventional Commits'],
        relatedProjects: ['All Projects'],
      },
      {
        id: 'threejs',
        name: 'Three.js',
        iconKey: '3d_rotation',
        proficiency: 78,
        experience: '1+ yr',
        projects: 3,
        level: 'Proficient',
        trend: 'growing',
        description: 'WebGL 3D rendering pipelines and real-time graphics.',
        extendedDesc:
          'Builds WebGL-based 3D interactive experiences using pure Three.js mathematics. Handles scene graphs, lighting, materials, and custom shader implementations for web-based 3D environments.',
        tags: ['Three.js', 'WebGL', 'Scene Graphs'],
        achievements: [
          'Engineered WebGL 3D rendering pipeline for Cosmic Strikes with smooth 60 FPS gameplay',
        ],
        ecosystem: ['Three.js r128+', 'WebGL', 'GLSL Basics'],
        relatedProjects: ['Cosmic Strikes — 3D Arcade Space Shooter'],
      },
      {
        id: 'react-three-fiber',
        name: 'React Three Fiber',
        iconKey: 'view_in_ar',
        proficiency: 76,
        experience: '1+ yr',
        projects: 2,
        level: 'Proficient',
        trend: 'growing',
        description: 'Declarative 3D within React architectures.',
        extendedDesc:
          'Bridges React state management with Three.js graphics using React Three Fiber (R3F). Applies R3F for portfolio section 3D visuals, interactive hero canvas animations, and dynamic game UI integration.',
        tags: ['React Three Fiber', 'Declarative 3D', 'Interactive UI'],
        achievements: [
          'Implemented dynamic 3D wave progression and combo scoring UI integrated with Redux state',
        ],
        ecosystem: ['@react-three/fiber', '@react-three/drei', 'Redux'],
        relatedProjects: ['Cosmic Strikes — 3D Arcade Space Shooter'],
      },
    ],
  },

  /* ══════════════════════════════════════════════════════════════════
     5. AI & MACHINE LEARNING
     Source: "AI & Machine Learning Skills" résumé section
     ══════════════════════════════════════════════════════════════════ */
  {
    id: 'ai-ml',
    label: 'AI / ML',
    tagline: 'Computer vision, model training & edge deployment',
    color: 'var(--sys-success)',
    iconKey: 'psychology',
    skills: [
      {
        id: 'yolov8',
        name: 'YOLOv8',
        iconKey: 'center_focus_strong',
        proficiency: 85,
        experience: '1.5+ yrs',
        projects: 4,
        level: 'Advanced',
        trend: 'mastered',
        description: 'Real-time object detection and instance segmentation models.',
        extendedDesc:
          'Trains and deploys YOLOv8 architectures for high-speed object detection. Monitors crowd density on active event management lines and detects surface defects on manufacturing lines within tight inference latency budgets.',
        tags: ['Object Detection', 'YOLOv8', 'Model Training'],
        achievements: [
          'Automated Rod & Pipe Inspection: <200ms end-to-end inference latency on manufacturing line',
          'YOLOv8 crowd-density analysis triggering autonomous safety alerts for Smart Venue Platform',
        ],
        ecosystem: ['Ultralytics YOLOv8', 'Custom Dataset Training'],
        relatedProjects: ['Automated Pipe Inspection System', 'Smart Venue Platform'],
      },
      {
        id: 'opencv',
        name: 'OpenCV',
        iconKey: 'visibility',
        proficiency: 84,
        experience: '1.5+ yrs',
        projects: 6,
        level: 'Advanced',
        trend: 'active',
        description: 'Image processing, segmentation, and high-speed vision pipelines.',
        extendedDesc:
          'Optimises OpenCV pre-processing routines to run reliably alongside concurrent telemetry stacks. Computes dimensional measurements, handles Haar Cascades, and manages MJPEG stream buffering for edge-camera inputs (ESP32-CAM).',
        tags: ['Computer Vision', 'Image Segmentation', 'Pre-processing'],
        achievements: [
          'Engineered resilient OpenCV video capture loops to handle intermittent edge-camera feeds without crashing',
        ],
        ecosystem: ['OpenCV Python/C++', 'Haar Cascades', 'ESP32-CAM MJPEG'],
        relatedProjects: ['Automated Pipe Inspection System', 'Smart Venue Platform'],
      },
      {
        id: 'pytorch',
        name: 'PyTorch',
        iconKey: 'hub',
        proficiency: 80,
        experience: '1.5+ yrs',
        projects: 3,
        level: 'Proficient',
        trend: 'growing',
        description: 'Custom neural network architectures and transfer learning.',
        extendedDesc:
          'Formulates and trains deep neural network architectures leveraging established backbones via transfer learning. Uses PyTorch for rapid model prototyping, gradient evaluation, and custom loss function experiments.',
        tags: ['PyTorch', 'Transfer Learning', 'Neural Networks'],
        achievements: [
          'Deployed custom surface defect detection model trained from scratch for pipe inspection',
        ],
        ecosystem: ['PyTorch', 'Torchvision', 'Google Colab'],
        relatedProjects: ['Automated Pipe Inspection System'],
      },
      {
        id: 'tensorflow',
        name: 'TensorFlow & Keras',
        iconKey: 'layers',
        proficiency: 78,
        experience: '1.5+ yrs',
        projects: 3,
        level: 'Proficient',
        trend: 'active',
        description: 'High-level deep learning API and model deployment.',
        extendedDesc:
          'Applies the Keras high-level API over TensorFlow to quickly build, train, and evaluate sequential and functional deep learning models. Understands the underlying mathematics of optimisation (gradient descent, backpropagation).',
        tags: ['TensorFlow', 'Keras', 'Deep Learning'],
        achievements: [
          'Completed Google Cloud — Introduction to Generative AI certification (2024)',
        ],
        ecosystem: ['TensorFlow', 'Keras', 'TFLite'],
        relatedProjects: ['Automated Pipe Inspection System'],
      },
      {
        id: 'data-science',
        name: 'Data Science Stack',
        iconKey: 'analytics',
        proficiency: 82,
        experience: '1.5+ yrs',
        projects: 7,
        level: 'Advanced',
        trend: 'active',
        description: 'Data curation, EDA, preprocessing, and annotation pipelines.',
        extendedDesc:
          'Proficient with the Python data science ecosystem for data manipulation, exploratory analysis, and visualisation. Experienced in dataset curation and augmentation using Roboflow, CVAT.ai, and Label Studio for computer vision training data. Applies SQL-based data management and pandas pipelines for structured analytics.',
        tags: ['Pandas', 'NumPy', 'Roboflow', 'Dataset Annotation'],
        achievements: [
          'Curated and augmented custom defect detection dataset via Roboflow for pipe inspection model',
          'Built SQL-based data management pipeline for Smart Venue Platform ticket inventory',
        ],
        ecosystem: [
          'Pandas',
          'NumPy',
          'Matplotlib',
          'Seaborn',
          'Roboflow',
          'CVAT.ai',
          'Label Studio',
        ],
        relatedProjects: ['Automated Pipe Inspection System', 'Smart Venue Platform'],
      },
      {
        id: 'mlops',
        name: 'MLOps',
        iconKey: 'auto_graph',
        proficiency: 75,
        experience: '1 yr',
        projects: 3,
        level: 'Proficient',
        trend: 'growing',
        description: 'End-to-end machine learning operational workflows.',
        extendedDesc:
          'Structures end-to-end ML workflows from Colab experimentation to production-ready cloud APIs. Manages versioned datasets, continuous evaluation pipelines, and exposes inference servers via Firebase Cloud Functions and GCP.',
        tags: ['MLOps', 'Cloud Inference', 'Workflow Automation'],
        achievements: [
          'Deployed stateless cloud inference API bridging edge hardware with GCP compute environments',
        ],
        ecosystem: ['GCP Cloud Functions', 'Firebase ML', 'Roboflow Export'],
        relatedProjects: ['Automated Pipe Inspection System', 'Smart Venue Platform'],
      },
      {
        id: 'onnx',
        name: 'ONNX Deployment',
        iconKey: 'system_update_alt',
        proficiency: 78,
        experience: '1 yr',
        projects: 2,
        level: 'Proficient',
        trend: 'growing',
        description: 'Model export and interoperable edge deployment.',
        extendedDesc:
          'Focuses on cross-platform model deployment. Exports trained PyTorch/TensorFlow models to ONNX format to strip framework overhead, enabling highly optimised inference on constrained embedded hardware (ESP32-CAM) and lean cloud endpoints.',
        tags: ['ONNX', 'Edge Inference', 'Model Export'],
        achievements: [
          'Achieved ONNX-optimised edge inference on ESP32-CAM with production-ready pipeline',
          'Exported and deployed YOLOv8 model as stateless cloud inference endpoint on GCP',
        ],
        ecosystem: ['ONNX Runtime', 'Model Quantisation'],
        relatedProjects: ['Automated Pipe Inspection System'],
      },
      {
        id: 'genai-llm',
        name: 'GenAI & LLMs',
        iconKey: 'auto_awesome',
        proficiency: 78,
        experience: '1 yr',
        projects: 3,
        level: 'Proficient',
        trend: 'growing',
        description: 'Context-aware LLM applications and prompt engineering strategies.',
        extendedDesc:
          'Builds applied LLM-integrated features using Firebase Genkit and Google AI APIs. Implements prompt engineering strategies for dashboard insights, natural language data querying, and contextual response generation. Applies NLP fundamentals for classification and intent parsing tasks.',
        tags: ['LLMs', 'Prompt Engineering', 'Firebase Genkit', 'NLP'],
        achievements: [
          'Integrated contextual AI-powered insights module into Smart Venue Dashboard via Firebase Genkit',
          'Google Cloud — Introduction to Generative AI certification (2024)',
        ],
        ecosystem: [
          'Firebase Genkit',
          'Google AI APIs (Gemini)',
          'LLM Chaining',
          'NLP Fundamentals',
        ],
        relatedProjects: ['Smart Venue Platform', 'Portfolio Builder App'],
      },
    ],
  },
];

// ─── Derived Helpers (UI-layer utilities that stay data-adjacent) ──────────────

/** All unique category IDs in display order */
export const CATEGORY_IDS = SKILL_CATEGORIES.map((c) => c.id);

/** Look up a category by its id */
export function getCategoryById(id: string): SkillCategory | undefined {
  return SKILL_CATEGORIES.find((c) => c.id === id);
}

/** Look up a skill across all categories */
export function getSkillById(
  skillId: string,
): { skill: Skill; category: SkillCategory } | undefined {
  for (const category of SKILL_CATEGORIES) {
    const skill = category.skills.find((s) => s.id === skillId);
    if (skill) return { skill, category };
  }
  return undefined;
}

/** Total skill count across all categories */
export const TOTAL_SKILL_COUNT = SKILL_CATEGORIES.reduce((acc, c) => acc + c.skills.length, 0);