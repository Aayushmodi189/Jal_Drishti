# 🌊 JAL DRISHTI ( जल दृष्टि )
### Enterprise-Grade National Water Intelligence & GIS Command Center

[![Hackathon](https://img.shields.io/badge/Hackathon-NexHack--3.0-blueviolet?style=for-the-badge)](https://nexhack3.0.dev)
[![Stack](https://img.shields.io/badge/Tech_Stack-FastAPI_%7C_React_%7C_Leaflet_%7C_Tailwind-cyan?style=for-the-badge)](#-technology-stack)
[![Nodes Monitored](https://img.shields.io/badge/Monitored_Nodes-150+_National_Reservoirs-emerald?style=for-the-badge)](#-system-architecture)
[![License](https://img.shields.io/badge/License-MIT-orange?style=for-the-badge)](LICENSE)

---

## 📸 Executive Overview

**Jal Drishti** is a state-of-the-art, AI-driven spatial water intelligence platform engineered for real-time monitoring, shortage forecasting, and crisis mitigation across India's national water infrastructure. Built for **NexHack 3.0**, the platform aggregates multi-basin telemetry, groundwater metrics, and pipeline sensor streams into a unified, high-performance GIS Command Center.

Featuring predictive ML modeling, automated bulletin ingestion, and dynamic "What-If" scenario simulation, **Jal Drishti** equips environmental authorities, river basin organizations, and municipal engineers with actionable foresight to mitigate droughts, manage storage drop risks, and prevent urban pipeline leakages.

---

## 🌟 Key Features

### 🗺️ 1. Geospatial Command Dashboard (GIS)
* **150+ Interactive Telemetry Nodes**: Full-coverage mapping of major reservoirs, dams, and river basins across 12 Indian state zones.
* **Dual Map Engine Modes**: Switch dynamically between **OpenStreetMap Standard** and **OpenTopoMap (Terrain Vector)**.
* **Adaptive Spatial Filtering**: State-level boundary filtering and quick-search query mechanisms.
* **Dual Theme Engine**: Seamlessly switch between **Pure OLED Dark Mode** (for high-contrast command centers) and **Corporate Light Mode**.

### 🔮 2. Predictive AI & Shortage Risk Engines
* **4-Week Storage Forecasting**: Machine learning temporal sequence logic to predict reservoir storage percentages 28 days in advance.
* **Automated Risk Scoring**: Calculates shortage probabilities ($<40\%$ storage threshold) and assigns real-time status alerts (`normal`, `watch`, `critical`).
* **Groundwater Depletion Analytics**: Classification of regional aquifers into `Safe`, `Semi-Critical`, `Critical`, or `Over-Exploited` zones.

### ⚡ 3. Interactive "What-If" AI Scenario Simulator
* **Dynamic Climate Simulation**: Slide variables for rainfall inflow ($0-25\text{ mm/day}$) and release outflow rates ($1-15\text{ m}^3/\text{s}$).
* **Real-Time Model Inference**: Recalculates projected storage levels and risk factors instantly per node without requiring backend round-trips.

### 🔍 4. Urban Pipeline Leakage & Telemetry Monitoring
* **Acoustic & Pressure Flow Monitoring**: Real-time detection of distribution line anomalies, pressure drops, and estimated loss rates.
* **Automated Emergency Alert Ticker**: Live marquee stream ingesting critical telemetry alerts across grid nodes.

---

## 🛠️ Technology Stack

| Layer | Technology | Primary Function |
| :--- | :--- | :--- |
| **Frontend UI** | React 18 (Vite) | High-performance single-page application framework |
| **Styling & Theme** | Tailwind CSS v3 | Custom dark/light design system & responsive layout |
| **Mapping Engine** | React-Leaflet / Leaflet.js | Interactive GIS map rendering & spatial node markers |
| **Backend API** | FastAPI (Python 3.10+) | High-throughput async REST endpoints & logic serving |
| **Server** | Uvicorn | ASGI web server for fast API execution |
| **Data Processing** | Python Pandas / NumPy | Telemetry array calculations and data transformations |
| **Deployment** | Vercel | Global CDN deployment with client-side fallback engine |

---

## 🏗️ System Architecture

```
                               ┌──────────────────────────────────────────┐
                               │       JAL DRISHTI FRONTEND SYSTEM        │
                               │   (React 18 + Leaflet GIS + Tailwind)    │
                               └────────────────────┬─────────────────────┘
                                                    │
                                                    │  Fetch Stream / Fallback Engine
                                                    ▼
                       ┌──────────────────────────────────────────────────────────┐
                       │                   DATA SYNCHRONIZER                      │
                       └─────────────┬──────────────────────────────┬─────────────┘
                                     │                              │
                     HTTP REST (Live)│                              │ Async Fallback
                                     ▼                              ▼
     ┌──────────────────────────────────────────┐      ┌──────────────────────────┐
     │          FASTAPI BACKEND SERVICE         │      │ Client-Side Node Engine  │
     │      (Uvicorn / Python Telemetry)        │      │  (150 Synthetic Nodes)   │
     └──────────────────────┬───────────────────┘      └──────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  Reservoir    │   │  Groundwater  │   │ Pipeline Leak │
│ Shortage Engine│   │  Depletion ML │   │ Sensor Grid   │
└───────────────┘   └───────────────┘   └───────────────┘
```

---

## 📂 Project Structure

```
Project_Jal_Drishti/
├── backend/
│   ├── main.py                     # FastAPI server entry point & CORS configuration
│   ├── routers/
│   │   ├── __init__.py
│   │   └── intelligence.py         # API Endpoints for reservoirs, groundwater & leakage
│   ├── services/
│   │   ├── __init__.py
│   │   ├── ml_engine.py            # Predictive model inferencing logic
│   │   └── government_client.py    # Hydrological data parser & client ingestion
│   └── requirements.txt            # Python backend dependencies
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                 # Core GIS Dashboard & Inspector component
│   │   ├── main.jsx                # React DOM root entry
│   │   └── index.css               # Tailwind CSS imports & Leaflet map styling
│   ├── package.json                # Frontend dependencies & Vite scripts
│   ├── vite.config.js              # Vite server & bundler settings
│   └── tailwind.config.js          # Tailwind theme definitions
│
└── README.md                       # Comprehensive documentation
```

---

## 🚀 Getting Started

Follow these instructions to run **Jal Drishti** locally on your computer.

### Prerequisites
* **Node.js** (v18.0 or higher)
* **Python** (v3.10 or higher)
* **npm** or **yarn**

---

### 1. Setting Up the Backend (FastAPI)

1. Open your terminal and navigate to the project root:
   ```bash
   cd E:\Workspace\Projects\Project_Jal_Drishti
   ```

2. Create and activate a Python virtual environment:
   * **Windows (Command Prompt / PowerShell)**:
     ```cmd
     python -m venv .venv
     .venv\Scripts\activate
     ```
   * **Mac / Linux**:
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

3. Install backend dependencies:
   ```bash
   pip install fastapi uvicorn pandas numpy pdfplumber
   ```

4. Launch the FastAPI Uvicorn server:
   ```bash
   uvicorn backend.main:app --reload
   ```
   * API Server will start at: `http://127.0.0.1:8000`
   * Swagger Documentation: `http://127.0.0.1:8000/docs`

---

### 2. Setting Up the Frontend (React / Vite)

1. Open a **new, separate terminal window**.
2. Navigate into the `frontend` folder:
   ```bash
   cd E:\Workspace\Projects\Project_Jal_Drishti\frontend
   ```

3. Install Node packages:
   ```bash
   npm install
   ```

4. Start the Vite development server:
   ```bash
   npm run dev
   ```

5. Open your browser and visit: `http://localhost:5173`

---

## 🌐 API Endpoint Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/engines/reservoirs` | Retrieves national reservoir telemetry & 4-week forecasts |
| `GET` | `/api/engines/groundwater` | Retrieves regional aquifer depth & critical status classification |
| `GET` | `/api/engines/leakage` | Retrieves active pipeline pressure streams & leakage flags |

---

## 🏆 Hackathon Context & Deployment

* **Event**: NexHack 3.0
* **Deployment Status**: Live on Vercel
* **Offline Safety Feature**: Includes an automatic client-side 150-node synthetic telemetry generator so the GIS interactive map operates flawlessly online even when decoupled from local server instances.

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---
<p center="align">
Developed with 💙 for <b>NexHack 3.0</b> • <i>Jal Drishti Water Intelligence Team</i>
</p>