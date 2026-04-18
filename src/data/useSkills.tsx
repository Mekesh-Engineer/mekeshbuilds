/**
 * myskills-data.tsx — Enhanced v2
 * ─────────────────────────────────────────────────────────────────
 * All audit improvements to data layer applied:
 *
 *  ✅ All 6 skills have detailedDescription (multi-paragraph)
 *  ✅ All 6 skills have keyFeatures (for modal grid)
 *  ✅ tags array added to every skill (for MetaPill row in modal)
 *  ✅ achievementBadge added where applicable
 *  ✅ readTime added for recruiter UX
 *  ✅ Pexels images (no auth required, fast CDN)
 *  ✅ Explicit category strings matching CATEGORY_PALETTE keys in SkillCard
 *  ✅ Type import path matches the new SkillCard location
 */

import {
    SiEspressif,
    SiOpencv,
    SiReact,
} from 'react-icons/si';
import { MdBolt, MdPrecisionManufacturing, MdSensors } from 'react-icons/md';
import type { SkillCardItem } from '@/components/common/SkillCard';

export const DEFAULT_CARDS: SkillCardItem[] = [
    {
        id: 'embedded',
        title: 'Embedded Systems Development',
        category: 'Hardware',               // ← matches CATEGORY_PALETTE key
        description: 'ESP32, ARM, real-time firmware, sensor interfacing.',
        summary: 'Designing robust firmware and hardware interfaces for real-time control using ESP32, ARM, and industrial protocols.',
        readTime: '3 min read',
        tags: ['ESP32', 'ARM', 'Embedded C', 'RTOS', 'I2C/SPI/UART'],
        achievementBadge: 'Certified by Maven Silicon',
        icon: <SiEspressif className="h-6 w-6" />,
        image: 'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=800',
        detailedDescription: [
            'Extensive experience in designing and developing microcontroller firmware using ESP32, Arduino Uno, and ARM-based processors with a focus on deterministic, real-time control logic.',
            'Proficient in Embedded C/C++ programming with expertise in multi-sensor fusion, low-latency data transmission, and peripheral interfacing protocols including I2C, SPI, UART, and ADC.',
            'Strong background in real-time operating systems (FreeRTOS), OTA firmware update pipelines, and edge-level processing for industrial automation and IoT deployments.',
        ],
        keyFeatures: [
            'Real-time video streaming over Wi-Fi via HTTP endpoints',
            'Multi-sensor fusion (inductive, capacitive, IR, ultrasonic)',
            'Servo actuation and closed-loop PID control system design',
            'OTA firmware updates and bootloader customisation',
            'ARM Cortex-M programming certified via Maven Silicon',
            'UART/I2C/SPI protocol stacks from scratch',
        ],
    },
    {
        id: 'automation',
        title: 'Industrial Automation Systems',
        category: 'Systems',                // ← blue chip
        description: 'SCADA-like dashboards, control logic, monitoring systems.',
        summary: 'Engineering smart automation and telemetry platforms analogous to industrial SCADA systems for modern plant-floor device management.',
        readTime: '4 min read',
        tags: ['SCADA', 'UDP', 'WebSockets', 'PLC Logic', 'HMI'],
        achievementBadge: 'V2X — 5 Events',
        icon: <MdPrecisionManufacturing className="h-6 w-6" />,
        image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=800',
        detailedDescription: [
            'Designing smart automation and telemetry platforms analogous to industrial SCADA systems for modern plant-floor device management, real-time monitoring, and autonomous control workflows.',
            'Implemented UDP auto-discovery services and low-latency proxy servers enabling zero-configuration monitoring and dynamic IP resolution across fleet networks.',
            'Engineered thread-safe global state managers with mutex-protected command queuing, ensuring reliable, non-blocking instruction delivery in multi-threaded production environments.',
        ],
        keyFeatures: [
            'SCADA-like live operator dashboards with real-time telemetry',
            'V2X fleet monitoring — presented at 5 inter-collegiate events',
            'Autonomous sorting and defect inspection workflows',
            'High-frequency sensor data pipelines over UDP/WebSockets',
            'Thread-safe command queuing with mutex-protected state',
            'Dynamic IP resolution with zero-config auto-discovery',
        ],
    },
    {
        id: 'cv-ai',
        title: 'Computer Vision & AI Systems',
        category: 'AI / ML',               // ← purple chip
        description: 'YOLOv8, OpenCV, real-time inspection.',
        summary: 'Deploying cutting-edge machine learning pipelines for object detection, automated quality inspection, and edge-based inference.',
        readTime: '5 min read',
        tags: ['YOLOv8', 'OpenCV', 'ONNX', 'Roboflow', 'Python'],
        achievementBadge: '1st Prize — Tamizhanskills 2026',
        icon: <SiOpencv className="h-6 w-6" />,
        image: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800',
        detailedDescription: [
            'Specialising in object detection, image segmentation, and edge-based inference using state-of-the-art YOLOv8 and OpenCV pipelines for automated manufacturing quality control.',
            'Integrated computer vision into production-grade Flask backends with multi-threaded video stream handling, achieving sub-100ms inference latency on Raspberry Pi and Jetson-class hardware.',
            'Experienced in full MLOps cycles including dataset curation with Roboflow / CVAT.ai, experiment tracking, CI-integrated evaluation, and ONNX model export for embedded deployment.',
        ],
        keyFeatures: [
            'YOLOv8 surface defect detection and dimensional inspection',
            'Multi-threaded Flask backend for concurrent video streams',
            'Edge-based crowd density and access control systems',
            'Dataset curation: Roboflow, CVAT.ai, Label Studio',
            'ONNX model export for embedded / edge deployment',
            '1st Prize — Tamizhanskills Ideathon 2026, Chennai',
        ],
    },
    {
        id: 'fullstack',
        title: 'Full-Stack Engineering',
        category: 'Software',               // ← cyan chip
        description: 'React, Flask, WebSockets, Firebase.',
        summary: 'Building end-to-end production-style web applications with secure authentication, real-time data synchronisation, and modular UI architectures.',
        readTime: '4 min read',
        tags: ['React 19', 'TypeScript', 'Firebase', 'Flask', 'Zustand'],
        icon: <SiReact className="h-6 w-6" />,
        image: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800',
        detailedDescription: [
            'Building end-to-end production-style web applications with secure authentication, real-time data synchronisation via WebSockets/Firestore, and modular TypeScript UI architectures.',
            'Developed fully functioning portfolio CMS dashboards with protected routing, role-aware RBAC, Zod-based schema validation, and Zustand centralised state management.',
            'Bridging the gap between hardware edge nodes and cloud-based user interfaces through robust REST APIs, WebSocket relays, and serverless Firebase backends.',
        ],
        keyFeatures: [
            'Frontend: React 19, TypeScript, Framer Motion, Tailwind v4',
            'Backend: Express.js, Flask, WebSockets, REST APIs',
            'Database: Firebase (Firestore), Supabase, MongoDB',
            'Zod schema validation and Zustand state management',
            'Portfolio CMS with role-based access control (RBAC)',
            'Cosmic Strikes 3D — 60 FPS WebGL game with JWT leaderboard',
        ],
    },
    {
        id: 'iot',
        title: 'IoT & Smart Systems',
        category: 'Cloud',                  // ← green chip
        description: 'Edge devices, cloud integration, telemetry.',
        summary: 'Architecting full-stack IoT platforms integrating hardware sensors, edge computing, and scalable cloud backends.',
        readTime: '4 min read',
        tags: ['Blynk IoT', 'Firebase', 'Cloud Functions', 'MQTT', 'Edge'],
        icon: <MdSensors className="h-6 w-6" />,
        image: 'https://images.pexels.com/photos/3861458/pexels-photo-3861458.jpeg?auto=compress&cs=tinysrgb&w=800',
        detailedDescription: [
            'Architecting full-stack IoT platforms integrating hardware sensors, decentralised edge computing, and highly scalable cloud backends for real-time environmental monitoring and telemetry.',
            'Deployed cloud-connected logic using Blynk IoT and engineered secure serverless Firebase systems with Firestore, Cloud Functions, and multi-tier RBAC for event management platforms.',
            'Delivered high-speed edge telemetry for connected ecosystems — handling environmental mapping, cryptographic QR ticket validation, and real-time dashboard health diagnostics.',
        ],
        keyFeatures: [
            'Serverless backend logic via Firebase Cloud Functions',
            'Multi-tier Role-Based Access Control (RBAC)',
            'Edge hardware → cloud dashboard synchronisation',
            'Cryptographic QR ticket validation systems',
            'Blynk IoT integration for embedded telemetry',
            'Smart IoT Platform — 1st Prize Tamizhanskills + 3rd Prize Elixir 2026',
        ],
    },
    {
        id: 'electrical',
        title: 'Electrical System Design',
        category: 'Design',                 // ← amber chip
        description: 'Power electronics, circuit design, simulation tools.',
        summary: 'Leveraging rigorous electrical fundamentals in power systems, motor drivers, PCB design, and intelligent energy routing.',
        readTime: '3 min read',
        tags: ['MATLAB', 'Simulink', 'Proteus', 'OrCAD', 'FPGA'],
        achievementBadge: 'AutoCAD Certified',
        icon: <MdBolt className="h-6 w-6" />,
        image: 'https://images.pexels.com/photos/3782226/pexels-photo-3782226.jpeg?auto=compress&cs=tinysrgb&w=800',
        detailedDescription: [
            'Applying rigorous electrical fundamentals across power systems, motor drivers, analog/digital electronics, and intelligent energy routing — from schematic capture to practical wiring integration.',
            'Applied Fuzzy Logic-based decision making for smart hybrid energy management, dynamically shifting load distribution between renewable and conventional grid sources to optimise efficiency.',
            'Proficient in translating complex schematics into reliable physical implementations through PCB design, FPGA simulation, and modelling with professional-grade EDA tools.',
        ],
        keyFeatures: [
            'Simulation: MATLAB, Simulink, Proteus, OrCAD PSpice',
            'PCB design, layout, DRC, and Gerber export',
            'Smart Grid automation and EV motor system control',
            'FPGA & Digital Design: Xilinx ISE, Intel Quartus Prime',
            'Fuzzy Logic energy management system design',
            'AutoCAD Electrical certified — Cadcentre Cochin, 2023',
        ],
    },
];