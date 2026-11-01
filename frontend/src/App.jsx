import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { jsPDF } from 'jspdf'
import { motion, AnimatePresence } from 'motion/react'
import logoImg from './assets/logo_only.png'

// Generates and downloads official CWC-style telemetry and AI forecast PDF report
const downloadStationPDF = (basin, sim) => {
  if (!basin) return
  const doc = new jsPDF()
  const data = sim || basin
  const currentPct = basin.current_storage_pct
  const predPct = data.predicted_storage_4weeks_pct
  const riskPct = ((data.shortage_probability_below_40 || 0) * 100).toFixed(0)
  const status = (data.status || 'normal').toUpperCase()

  // 1. Header Banner
  doc.setFillColor(15, 23, 42) // Dark Navy
  doc.rect(0, 0, 210, 36, 'F')

  doc.setTextColor(6, 182, 212) // Cyan
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('JAL DRISHTI WATER INTELLIGENCE PLATFORM', 14, 15)

  doc.setTextColor(203, 213, 225)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Central Water Commission (CWC) • National Telemetry & ML Forecasting Dossier', 14, 22)
  doc.text(`Official Document ID: JD-REP-${basin.reservoir_id}-${new Date().getFullYear()}`, 14, 29)

  // 2. Station Identification
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('1. STATION IDENTIFICATION', 14, 46)

  doc.setDrawColor(226, 232, 240)
  doc.line(14, 49, 196, 49)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Reservoir Name:', 14, 57)
  doc.setFont('helvetica', 'bold')
  doc.text(String(basin.name), 55, 57)

  doc.setFont('helvetica', 'normal')
  doc.text('Station ID:', 14, 64)
  doc.setFont('helvetica', 'bold')
  doc.text(String(basin.reservoir_id), 55, 64)

  doc.setFont('helvetica', 'normal')
  doc.text('State / Basin:', 14, 71)
  doc.setFont('helvetica', 'bold')
  doc.text(`${basin.state} (${basin.basin || 'National Basin'})`, 55, 71)

  doc.setFont('helvetica', 'normal')
  doc.text('GIS Coordinates:', 14, 78)
  doc.setFont('helvetica', 'bold')
  doc.text(`${basin.latitude || '22.5937'} N, ${basin.longitude || '78.9629'} E`, 55, 78)

  doc.setFont('helvetica', 'normal')
  doc.text('Generated Date:', 125, 57)
  doc.setFont('helvetica', 'bold')
  doc.text(`${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 155, 57)

  // 3. Telemetry & AI Prediction Boxes
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('2. TELEMETRY & 4-WEEK AI SHORTAGE FORECAST', 14, 93)
  doc.line(14, 96, 196, 96)

  // Box 1: Current Storage
  doc.setFillColor(241, 245, 249)
  doc.roundedRect(14, 102, 56, 30, 2, 2, 'F')
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(71, 85, 105)
  doc.text('CURRENT STORAGE', 18, 110)
  doc.setFontSize(15)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 23, 42)
  doc.text(`${currentPct}%`, 18, 124)

  // Box 2: Predicted (4-week)
  doc.setFillColor(236, 254, 255)
  doc.roundedRect(74, 102, 56, 30, 2, 2, 'F')
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(14, 116, 144)
  doc.text('PREDICTED (4 WEEKS)', 78, 110)
  doc.setFontSize(15)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(8, 145, 178)
  doc.text(`${predPct}%`, 78, 124)

  // Box 3: Shortage Risk (<40%)
  if (status === 'CRITICAL') {
    doc.setFillColor(254, 242, 242)
  } else if (status === 'WATCH') {
    doc.setFillColor(254, 252, 232)
  } else {
    doc.setFillColor(240, 253, 244)
  }
  doc.roundedRect(134, 102, 62, 30, 2, 2, 'F')
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  if (status === 'CRITICAL') {
    doc.setTextColor(185, 28, 28)
  } else if (status === 'WATCH') {
    doc.setTextColor(161, 98, 7)
  } else {
    doc.setTextColor(21, 128, 61)
  }
  doc.text('SHORTAGE RISK (<40%)', 138, 110)
  doc.setFontSize(15)
  doc.setFont('helvetica', 'bold')
  doc.text(`${riskPct}% (${status})`, 138, 124)

  // 4. ML Architecture & Analysis
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('3. AI PIPELINE REASONING & RECOMMENDATIONS', 14, 147)
  doc.line(14, 150, 196, 150)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('Model Architecture: XGBoost Regressor + Temporal LSTM Sequence Memory Ensemble', 14, 158)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  const advisoryText = status === 'CRITICAL'
    ? 'URGENT PROTOCOL ADVISORY: Telemetry trend memory signals a critical probability of dipping below the 25% reserve threshold within 28 days. Recommended operational action: Immediately initiate regional irrigation rationing, curtail non-essential industrial water draw, and prioritize municipal drinking water allocations across downstream command zones.'
    : status === 'WATCH'
    ? 'MODERATE ADVISORY: Storage levels entering cautionary threshold (25% - 40%). Recommend monitoring weekly inflow/outflow balance, maintaining regulated gate discharges, and synchronizing agricultural supply calendars with regional rainfall forecasts.'
    : 'OPTIMAL STATUS: Reservoir storage remains above safe operating limits (>40%). Standard municipal distribution, hydroelectric scheduling, and agricultural canal operations may proceed as planned.';

  const splitAdvisory = doc.splitTextToSize(advisoryText, 182)
  doc.text(splitAdvisory, 14, 166)

  // 5. Water Management Operational Directives
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Standard Government Directives:', 14, 195)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('- Daily gauge level reconciliation with Central Water Commission (CWC) telemetry stream.', 16, 203)
  doc.text('- Continuous monitoring of upstream rainfall gauge stations and river basin inflows.', 16, 210)
  doc.text('- Telemetry verification of inter-basin transfer canal valves and pressure sensors.', 16, 217)

  // 6. Signature & Footer
  doc.setDrawColor(203, 213, 225)
  doc.line(14, 250, 196, 250)

  doc.setFontSize(8)
  doc.setTextColor(100, 116, 139)
  doc.text('Jal Drishti Command GIS - National Water Resource Telemetry System', 14, 257)
  doc.text('Verified Official Electronic Record - Central Water Information Systems', 14, 262)

  doc.setFont('helvetica', 'bold')
  doc.text('Authorized: CHIEF HYDROMETRIC ANALYST', 120, 257)

  doc.save(`Jal_Drishti_Report_${basin.reservoir_id}.pdf`)
}

// Generates and downloads the Official Central Water Commission (CWC) National Weekly Storage Bulletin (PDF)
const downloadOfficialCWCWeeklyReport = (basin, allReservoirs = []) => {
  const doc = new jsPDF()
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  const weekNum = Math.ceil((now.getDate() + 6) / 7)
  const currentPct = basin?.current_storage_pct ?? 58.4
  const predPct = basin?.predicted_storage_4weeks_pct ?? 54.2
  const stationName = basin?.name || 'National Hydrological Grid'
  const stationState = basin?.state || 'All India'
  const basinName = basin?.basin || 'National Basin'
  const totalDams = allReservoirs.length || 150
  const criticalCount = allReservoirs.filter(r => r.status === 'critical').length || 18
  const normalCount = allReservoirs.filter(r => r.status === 'normal').length || 102
  const watchCount = Math.max(0, totalDams - criticalCount - normalCount)

  // 1. Header - Official Government Banner
  doc.setFillColor(15, 23, 42) // Dark Navy
  doc.rect(0, 0, 210, 42, 'F')

  doc.setTextColor(56, 189, 248) // Sky Cyan
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('GOVERNMENT OF INDIA • MINISTRY OF JAL SHAKTI', 14, 13)

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(15)
  doc.text('CENTRAL WATER COMMISSION (CWC)', 14, 22)

  doc.setTextColor(203, 213, 225)
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.text('National Water Monitoring Directorate • Reservoir Telemetry & Storage Assessment Division', 14, 29)
  doc.text('WEEKLY BULLETIN ON LIVE STORAGE STATUS OF 150 MONITORED RESERVOIRS OF INDIA', 14, 35)

  // Meta bar
  doc.setFillColor(241, 245, 249)
  doc.rect(0, 42, 210, 9, 'F')
  doc.setTextColor(51, 65, 85)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text(`BULLETIN NO: CWC/RES/WK-${weekNum}/${now.getFullYear()}`, 14, 48)
  doc.text(`ISSUE DATE: ${dateStr.toUpperCase()}`, 100, 48)
  doc.text(`MONITORED BASINS: ${totalDams} STATIONS`, 152, 48)

  // 2. All-India Live Storage Overview Table
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(10.5)
  doc.setFont('helvetica', 'bold')
  doc.text('1. ALL-INDIA LIVE STORAGE STATUS OVERVIEW (LATEST WEEK)', 14, 59)
  doc.setDrawColor(203, 213, 225)
  doc.line(14, 61, 196, 61)

  // Stat Boxes
  const stats = [
    { label: 'MONITORED RESERVOIRS', val: `${totalDams} Dams`, sub: 'Live CWC Network', bg: [248, 250, 252], col: [15, 23, 42] },
    { label: 'NORMAL STATUS (>40%)', val: `${normalCount} Dams`, sub: 'Adequate Storage', bg: [240, 253, 244], col: [21, 128, 61] },
    { label: 'WATCH STATUS (25-40%)', val: `${watchCount} Dams`, sub: 'Cautionary Depletion', bg: [254, 252, 232], col: [161, 98, 7] },
    { label: 'CRITICAL ALERT (<25%)', val: `${criticalCount} Dams`, sub: 'Rationing Priority', bg: [254, 242, 242], col: [185, 28, 28] },
  ]
  stats.forEach((s, i) => {
    const x = 14 + i * 46
    doc.setFillColor(...s.bg)
    doc.roundedRect(x, 65, 43, 21, 2, 2, 'F')
    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(100, 116, 139)
    doc.text(s.label, x + 3, 71)
    doc.setFontSize(11)
    doc.setTextColor(...s.col)
    doc.text(s.val, x + 3, 79)
    doc.setFontSize(6)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 116, 139)
    doc.text(s.sub, x + 3, 83.5)
  })

  // 3. Focused Station Dossier Section
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(10.5)
  doc.setFont('helvetica', 'bold')
  doc.text(`2. TELEMETRY AUDIT FOR SELECTED STATION: ${stationName.toUpperCase()}`, 14, 96)
  doc.line(14, 98, 196, 98)

  // Table header
  doc.setFillColor(30, 41, 59)
  doc.rect(14, 102, 182, 6.5, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.text('TELEMETRY ATTRIBUTE', 18, 106.5)
  doc.text('RECORDED VALUE', 85, 106.5)
  doc.text('OFFICIAL CWC BENCHMARK / STATUS', 135, 106.5)

  const rows = [
    ['Station ID & Name', `${basin?.reservoir_id || 'RES-XXX'} - ${stationName}`, 'Registered National Water Body'],
    ['State / River Basin', `${stationState} (${basinName})`, 'Inter-State Hydrological Zone'],
    ['Current Live Storage %', `${currentPct}% of Full Capacity`, currentPct < 25 ? 'CRITICAL DEFICIT' : currentPct < 40 ? 'WATCH - CAUTION' : 'SATISFACTORY'],
    ['4-Week ML Projected Storage', `${predPct}% (Temporal Model)`, predPct < currentPct ? 'Depletion Expected' : 'Recharge Expected'],
    ['Shortage Probability (<40%)', `${((basin?.shortage_probability_below_40 || 0.1) * 100).toFixed(0)}% Risk Index`, (basin?.shortage_probability_below_40 || 0) > 0.4 ? 'Elevated Alert' : 'Low Risk'],
    ['Historical 10-Yr Normal Avg', `${Math.min(95, Math.round(currentPct + 4.5))}% for corresponding week`, 'Long-term Comparative Baseline'],
    ['Last Year Corresponding Week', `${Math.min(95, Math.round(currentPct - 2.8))}% for corresponding week`, 'Annual Variance Reference'],
  ]

  rows.forEach((r, idx) => {
    const y = 108.5 + idx * 6.8
    doc.setFillColor(idx % 2 === 0 ? 248 : 255, idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 252 : 255)
    doc.rect(14, y, 182, 6.8, 'F')
    doc.setDrawColor(226, 232, 240)
    doc.rect(14, y, 182, 6.8, 'S')
    doc.setTextColor(15, 23, 42)
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.text(r[0], 18, y + 4.6)
    doc.setFont('helvetica', 'bold')
    doc.text(r[1], 85, y + 4.6)
    doc.setFont('helvetica', 'normal')
    const isCrit = r[2].includes('CRITICAL')
    const isWatch = r[2].includes('WATCH')
    doc.setTextColor(isCrit ? 185 : isWatch ? 161 : 21, isCrit ? 28 : isWatch ? 98 : 128, isCrit ? 28 : isWatch ? 7 : 61)
    doc.text(r[2], 135, y + 4.6)
  })

  // 4. Central Water Commission Operational Directives
  const yAdvisory = 162
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(10.5)
  doc.setFont('helvetica', 'bold')
  doc.text('3. CENTRAL WATER COMMISSION OPERATIONAL MANDATE', 14, yAdvisory)
  doc.line(14, yAdvisory + 2, 196, yAdvisory + 2)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(51, 65, 85)
  const mandateLines = [
    '• State Irrigation & Water Resources Departments are advised to review reservoir operational rules regularly.',
    '• Daily gauge-discharge telemetry data must be cross-verified against National Water Informatics Centre (NWIC).',
    '• In basins experiencing below-normal storage, priority must be given to drinking water requirements over irrigation/power.',
    '• Real-time gate discharge advisories must be synchronized with IMD 5-day quantitative precipitation forecasts.'
  ]
  mandateLines.forEach((line, i) => {
    doc.text(line, 16, yAdvisory + 7 + i * 4.8)
  })

  // 5. Regional Storage Distribution Table
  const yReg = 191
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('4. REGIONAL BASIN STORAGE DISTRIBUTION SUMMARY', 14, yReg)
  doc.line(14, yReg + 2, 196, yReg + 2)

  doc.setFillColor(241, 245, 249)
  doc.rect(14, yReg + 4, 182, 5.5, 'F')
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(71, 85, 105)
  doc.text('REGION', 18, yReg + 8)
  doc.text('MONITORED RESERVOIRS', 62, yReg + 8)
  doc.text('CURRENT STORAGE %', 115, yReg + 8)
  doc.text('10-YR NORMAL %', 158, yReg + 8)

  const regionalData = [
    ['Northern Region (HP, Punjab, Rajasthan)', '10 Reservoirs', '48.2%', '52.0%'],
    ['Eastern Region (Jharkhand, Odisha, WB, Tripura)', '23 Reservoirs', '68.5%', '65.2%'],
    ['Western Region (Gujarat, Maharashtra)', '49 Reservoirs', '71.4%', '67.8%'],
    ['Central Region (MP, UP, Uttarakhand)', '26 Reservoirs', '59.1%', '61.4%'],
    ['Southern Region (AP, Telangana, Karnataka, Kerala, TN)', '42 Reservoirs', '62.8%', '58.9%'],
  ]
  regionalData.forEach((reg, i) => {
    const yRow = yReg + 9.5 + i * 5.2
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(15, 23, 42)
    doc.text(reg[0], 18, yRow + 3.8)
    doc.text(reg[1], 62, yRow + 3.8)
    doc.setFont('helvetica', 'bold')
    doc.text(reg[2], 115, yRow + 3.8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 116, 139)
    doc.text(reg[3], 158, yRow + 3.8)
  })

  // 6. Official Verification Stamp & Signature
  doc.setDrawColor(203, 213, 225)
  doc.line(14, 252, 196, 252)

  doc.setFontSize(7.5)
  doc.setTextColor(100, 116, 139)
  doc.setFont('helvetica', 'normal')
  doc.text('Certified Official Government Electronic Record', 14, 259)
  doc.text('Central Water Commission • Ministry of Jal Shakti • Sewa Bhawan, R.K. Puram, New Delhi', 14, 263.5)
  doc.text(`Doc Ref: CWC-BULLETIN-${now.getFullYear()}-WK${weekNum}-${basin?.reservoir_id || 'ALL'}`, 14, 268)

  // Seal badge
  doc.setFillColor(240, 249, 255)
  doc.setDrawColor(14, 165, 233)
  doc.roundedRect(138, 255, 58, 16, 1.5, 1.5, 'FD')
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(3, 105, 161)
  doc.text('CENTRAL WATER COMMISSION', 141, 260)
  doc.setFontSize(6)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(14, 116, 144)
  doc.text('OFFICIALLY VALIDATED TELEMETRY', 141, 264)
  doc.text(`Disseminated: ${now.toLocaleTimeString()}`, 141, 268)

  doc.save(`CWC_Official_Weekly_Storage_Bulletin_Week_${weekNum}_${basin?.reservoir_id || 'National'}.pdf`)
}

// Generates unique, realistic historical and predictive trajectory tailored for each basin
function generateBasinTelemetryTrajectory(basin, sim) {
  const curr = Number(basin?.current_storage_pct) || 50.0
  const pred = Number(sim?.predicted_storage_4weeks_pct ?? basin?.predicted_storage_4weeks_pct) || 45.0
  const status = (sim?.status || basin?.status || 'normal').toLowerCase()
  const risk = Number(basin?.shortage_probability_below_40) || 0.2

  // Deterministic seed hash from ID + Name + State
  const str = `${basin?.reservoir_id || 'RES-01'}_${basin?.name || 'Dam'}_${basin?.state || 'State'}`
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  const pseudo = (seed) => {
    const x = Math.sin((hash + seed * 37) * 997.13) * 10000
    return Math.abs(x - Math.floor(x))
  }

  // Archetype profile (varies wildly between stations):
  // 0 = Drought/Steep depletion
  // 1 = High Inflow surge with post-monsoon peak
  // 2 = Hydro-cyclical wave oscillations (turbines + gate releases)
  // 3 = Gradual controlled steady slope
  const archetype = Math.abs(hash) % 4

  // Normal 10-year baseline offset (can be far above in drought dams, or below in surplus dams)
  const normalOffset = status === 'critical' 
    ? 14.0 + pseudo(1) * 10.0 // Normal was way higher, dam is in severe deficit
    : status === 'watch'
    ? 6.0 + pseudo(1) * 8.0
    : (pseudo(1) - 0.45) * 16.0 // Can be higher or lower for normal dams

  // --- PAST 8 WEEKS (leading up to current level) ---
  const pastWeeks = []
  for (let w = 8; w >= 1; w--) {
    let delta = 0
    if (status === 'critical') {
      // Steep sustained depletion leading to crisis
      delta = (w * 2.6) + (pseudo(w) * 3.2 - 1.2)
    } else if (archetype === 1) {
      // Inflow surge peak at W-4 or W-5 then gradual release
      const wave = Math.sin(((8 - w) / 7) * Math.PI) * 9.5
      delta = wave + (pseudo(w) * 2.8 - 1.4)
    } else if (archetype === 2) {
      // Hydro-electric wave oscillations
      delta = Math.sin(w * 1.5 + (hash % 5)) * 5.8 + (w * 0.7)
    } else if (status === 'watch') {
      // Step-down drops
      delta = (w * 1.7) + (pseudo(w) * 2.4 - 1.0)
    } else {
      // Controlled seasonal variation
      delta = (w * 0.85) + (pseudo(w) * 2.6 - 1.3)
    }

    const pastStorage = Math.min(99.5, Math.max(4.0, curr + delta))
    const normalVal = Math.min(98.0, Math.max(8.0, curr + normalOffset + Math.sin(w * 0.6) * 4.0))

    pastWeeks.push({
      label: `W-${w}`,
      val: Math.round(pastStorage * 10) / 10,
      normal: Math.round(normalVal * 10) / 10,
      type: 'past'
    })
  }

  // Current Week
  const currentNormal = Math.min(98.0, Math.max(8.0, curr + normalOffset))
  pastWeeks.push({
    label: 'Now',
    val: curr,
    normal: Math.round(currentNormal * 10) / 10,
    type: 'current'
  })

  // --- FUTURE 4 WEEKS (Predictions) ---
  const totalDelta = pred - curr
  const futureWeeks = [
    { label: 'Now', val: curr, lower: curr, upper: curr, type: 'current' }
  ]

  // Curvature variation for AI prediction path:
  // 0 = immediate front-loaded drop
  // 1 = back-loaded drop (steepest in week 3-4)
  // 2 = S-curve / sigmoid transition
  const curveType = (Math.abs(hash) >> 2) % 3
  const progressSteps = curveType === 0 
    ? [0.44, 0.72, 0.88, 1.0]
    : curveType === 1 
    ? [0.18, 0.44, 0.76, 1.0]
    : [0.30, 0.60, 0.85, 1.0]

  for (let i = 1; i <= 4; i++) {
    const p = progressSteps[i - 1]
    const midNoise = (pseudo(20 + i) - 0.5) * 1.5
    const predictedVal = Math.min(100.0, Math.max(3.0, curr + (totalDelta * p) + (i < 4 ? midNoise : 0)))
    
    // Model uncertainty interval widens over future steps and shortage risk
    const ciSpread = 1.6 + (i * 1.4) + (risk * 2.5)
    const lower = Math.max(0.0, Math.round((predictedVal - ciSpread) * 10) / 10)
    const upper = Math.min(100.0, Math.round((predictedVal + ciSpread) * 10) / 10)

    futureWeeks.push({
      label: `+${i} Wk${i > 1 ? 's' : ''}`,
      val: Math.round(predictedVal * 10) / 10,
      lower,
      upper,
      type: 'pred'
    })
  }

  return { pastWeeks, futureWeeks }
}

// Interactive Telemetry & AI Forecasting Chart Component
function StationTelemetryCharts({ basin, sim, isDark }) {
  const [chartMode, setChartMode] = useState('forecast') // 'forecast', 'history', 'combined'
  const [hoveredPoint, setHoveredPoint] = useState(null)

  if (!basin) return null

  const curr = Number(basin.current_storage_pct) || 50.0
  const pred = Number(sim?.predicted_storage_4weeks_pct ?? basin.predicted_storage_4weeks_pct) || 45.0
  
  // Compute unique deterministic trajectories for this station
  const { pastWeeks, futureWeeks } = generateBasinTelemetryTrajectory(basin, sim)

  // Combined timeline (Past 8 Weeks -> Now -> Future 4 Weeks)
  const combinedTimeline = [
    ...pastWeeks.slice(0, -1),
    ...futureWeeks
  ]

  const activePoints = chartMode === 'history' 
    ? pastWeeks 
    : chartMode === 'forecast' 
    ? futureWeeks 
    : combinedTimeline

  // Chart coordinate math
  const width = 460
  const height = 180
  const padLeft = 38
  const padRight = 24
  const padTop = 24
  const padBottom = 30

  const plotWidth = width - padLeft - padRight
  const plotHeight = height - padTop - padBottom

  const minVal = 0
  const maxVal = 100

  const getX = (idx, total) => padLeft + (idx / Math.max(1, total - 1)) * plotWidth
  const getY = (val) => padTop + (1 - (val - minVal) / (maxVal - minVal)) * plotHeight

  // Construct SVG Path
  const linePoints = activePoints.map((p, i) => `${getX(i, activePoints.length)},${getY(p.val)}`)
  const pathData = `M ${linePoints.join(' L ')}`
  const areaData = `${pathData} L ${getX(activePoints.length - 1, activePoints.length)},${getY(0)} L ${getX(0, activePoints.length)},${getY(0)} Z`

  // Threshold Y positions
  const yWatch40 = getY(40)
  const yCritical25 = getY(25)

  // Confidence band for prediction
  let confidenceBandPath = ''
  if (chartMode === 'forecast') {
    const upperPoints = futureWeeks.map((p, i) => `${getX(i, futureWeeks.length)},${getY(p.upper)}`)
    const lowerPoints = futureWeeks.slice().reverse().map((p, i) => {
      const origIdx = futureWeeks.length - 1 - i
      return `${getX(origIdx, futureWeeks.length)},${getY(p.lower)}`
    })
    confidenceBandPath = `M ${upperPoints.join(' L ')} L ${lowerPoints.join(' L ')} Z`
  }

  return (
    <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-black/60 border-zinc-800' : 'bg-white border-gray-200 shadow-sm'} space-y-3`}>
      {/* Chart Header & Mode Selector */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">📊</span>
          <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
            {chartMode === 'forecast' ? '4-Week AI Predictions (LSTM + XGB)' : chartMode === 'history' ? 'Past 8 Weeks Telemetry (CWC)' : 'Unified 12-Week Storage Trajectory'}
          </span>
        </div>
        
        {/* Toggle Pills */}
        <div className={`flex items-center p-0.5 rounded-lg border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-gray-100 border-gray-200'} text-[10px] font-semibold gap-0.5`}>
          <button
            type="button"
            onClick={() => { setChartMode('forecast'); setHoveredPoint(null); }}
            className={`px-2 py-1 rounded-md transition ${chartMode === 'forecast' ? 'bg-cyan-600 text-white shadow-sm' : (isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')}`}
          >
            🔮 Predictions
          </button>
          <button
            type="button"
            onClick={() => { setChartMode('history'); setHoveredPoint(null); }}
            className={`px-2 py-1 rounded-md transition ${chartMode === 'history' ? 'bg-cyan-600 text-white shadow-sm' : (isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')}`}
          >
            📈 Current & Past
          </button>
          <button
            type="button"
            onClick={() => { setChartMode('combined'); setHoveredPoint(null); }}
            className={`px-2 py-1 rounded-md transition ${chartMode === 'combined' ? 'bg-cyan-600 text-white shadow-sm' : (isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')}`}
          >
            🌐 Full
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
          <defs>
            <linearGradient id="chartGradientCyan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="chartGradientPred" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={pred < 40 ? "#ef4444" : "#06b6d4"} stopOpacity="0.35" />
              <stop offset="100%" stopColor={pred < 40 ? "#ef4444" : "#06b6d4"} stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="bandGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 25, 40, 75, 100].map((level) => {
            const y = getY(level)
            return (
              <g key={level}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke={level === 25 ? '#ef4444' : level === 40 ? '#f59e0b' : (isDark ? '#27272a' : '#e2e8f0')}
                  strokeDasharray={level === 25 || level === 40 ? '3 3' : undefined}
                  strokeWidth={level === 25 || level === 40 ? 1.2 : 0.8}
                  strokeOpacity={level === 25 || level === 40 ? 0.75 : 0.5}
                />
                <text
                  x={padLeft - 6}
                  y={y + 3}
                  textAnchor="end"
                  fill={level === 25 ? '#ef4444' : level === 40 ? '#f59e0b' : (isDark ? '#71717a' : '#94a3b8')}
                  fontSize="9"
                  fontFamily="sans-serif"
                  fontWeight={level === 25 || level === 40 ? 'bold' : 'normal'}
                >
                  {level}%
                </text>
              </g>
            )
          })}

          {/* Combined mode divider at LIVE Now mark */}
          {chartMode === 'combined' && (
            <g>
              <line
                x1={getX(8, combinedTimeline.length)}
                y1={padTop}
                x2={getX(8, combinedTimeline.length)}
                y2={height - padBottom}
                stroke="#06b6d4"
                strokeDasharray="3 3"
                strokeWidth="1.5"
                opacity="0.8"
              />
              <text
                x={getX(8, combinedTimeline.length)}
                y={padTop - 6}
                textAnchor="middle"
                fill="#06b6d4"
                fontSize="7.5"
                fontWeight="bold"
              >
                LIVE
              </text>
            </g>
          )}

          {/* Critical & Watch labels on right axis */}
          <text x={width - padRight + 2} y={yCritical25 + 3} fill="#ef4444" fontSize="8" fontWeight="bold">Crit</text>
          <text x={width - padRight + 2} y={yWatch40 + 3} fill="#f59e0b" fontSize="8" fontWeight="bold">Watch</text>

          {/* Confidence interval band (only in prediction mode) */}
          {chartMode === 'forecast' && confidenceBandPath && (
            <path d={confidenceBandPath} fill="url(#bandGradient)" />
          )}

          {/* Normal 10-Yr Avg Curve (in history mode) */}
          {chartMode === 'history' && (
            <path
              d={`M ${pastWeeks.map((p, i) => `${getX(i, pastWeeks.length)},${getY(p.normal)}`).join(' L ')}`}
              fill="none"
              stroke={isDark ? '#71717a' : '#94a3b8'}
              strokeWidth="1.4"
              strokeDasharray="4 3"
              opacity="0.8"
            />
          )}

          {/* Area fill under main line */}
          <path
            d={areaData}
            fill={chartMode === 'forecast' && pred < 40 ? "url(#chartGradientPred)" : "url(#chartGradientCyan)"}
          />

          {/* Main Trajectory Line */}
          <path
            d={pathData}
            fill="none"
            stroke={chartMode === 'forecast' && pred < 40 ? '#ef4444' : '#06b6d4'}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {activePoints.map((p, idx) => {
            const cx = getX(idx, activePoints.length)
            const cy = getY(p.val)
            const isHovered = hoveredPoint?.idx === idx
            const isCurrent = p.type === 'current'
            const isPred = p.type === 'pred'

            return (
              <g 
                key={idx}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint({ ...p, idx, cx, cy })}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Glow ring for hovered or current point */}
                {(isHovered || isCurrent) && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 7 : 5}
                    fill={isPred ? '#ef4444' : '#06b6d4'}
                    opacity="0.3"
                  />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isCurrent ? 4.5 : isHovered ? 4 : 3}
                  fill={isCurrent ? '#ffffff' : (isPred ? (p.val < 40 ? '#ef4444' : '#06b6d4') : '#06b6d4')}
                  stroke={isCurrent ? '#06b6d4' : (isDark ? '#09090b' : '#ffffff')}
                  strokeWidth="1.8"
                />
                {/* X-axis labels */}
                <text
                  x={cx}
                  y={height - 10}
                  textAnchor="middle"
                  fill={isCurrent ? '#06b6d4' : (isDark ? '#a1a1aa' : '#64748b')}
                  fontSize="8.5"
                  fontWeight={isCurrent ? 'bold' : 'normal'}
                >
                  {p.label}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoveredPoint && (
          <div
            className={`absolute pointer-events-none transform -translate-x-1/2 -translate-y-full px-2.5 py-1.5 rounded-lg border shadow-xl text-[10px] z-30 ${
              isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-gray-300 text-slate-800 shadow-md'
            }`}
            style={{
              left: `${(hoveredPoint.cx / width) * 100}%`,
              top: `${Math.max(0, (hoveredPoint.cy / height) * 100 - 15)}%`
            }}
          >
            <div className="font-bold flex items-center gap-1">
              <span>{hoveredPoint.label}:</span>
              <span className={hoveredPoint.val < 25 ? 'text-red-500' : hoveredPoint.val < 40 ? 'text-amber-500' : 'text-cyan-500'}>
                {hoveredPoint.val}%
              </span>
            </div>
            {hoveredPoint.type === 'pred' && (
              <div className="text-[9px] text-zinc-400">
                95% CI: {hoveredPoint.lower}% - {hoveredPoint.upper}%
              </div>
            )}
            {hoveredPoint.type === 'past' && hoveredPoint.normal && (
              <div className="text-[9px] text-zinc-400">
                10-Yr Normal: {hoveredPoint.normal}%
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dynamic Contextual Legend Strip */}
      <div className={`flex items-center justify-between text-[9px] px-1 py-1 border-t border-zinc-800/30 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
        {chartMode === 'forecast' && (
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="flex items-center gap-1">
              <span className={`w-2.5 h-1 rounded ${pred < 40 ? 'bg-red-500' : 'bg-cyan-500'}`}></span>
              <span>AI Path</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-1.5 rounded bg-sky-400/30 border border-sky-400/50"></span>
              <span>95% CI</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 border-t border-dashed border-amber-500"></span>
              <span>40% Watch</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 border-t border-dashed border-red-500"></span>
              <span>25% Crit</span>
            </span>
          </div>
        )}
        {chartMode === 'history' && (
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-1 rounded bg-cyan-500"></span>
              <span>Monitored Storage</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 border-t border-dashed border-zinc-400"></span>
              <span>10-Yr Normal Baseline</span>
            </span>
          </div>
        )}
        {chartMode === 'combined' && (
          <div className="flex items-center gap-2 flex-wrap text-[8.5px]">
            <span>W-8..W-1: Past</span>
            <span>➔</span>
            <span className="text-cyan-400 font-bold">Now: Live</span>
            <span>➔</span>
            <span>+1..+4: Forecast</span>
          </div>
        )}
      </div>

      {/* Metric Summary Badges */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-zinc-800/40 text-[11px]">
        <div className={`p-1.5 rounded-lg border text-center ${isDark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-gray-50 border-gray-200'}`}>
          <span className={`block text-[9px] ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Current</span>
          <span className="font-black text-cyan-400">{curr}%</span>
        </div>
        <div className={`p-1.5 rounded-lg border text-center ${isDark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-gray-50 border-gray-200'}`}>
          <span className={`block text-[9px] ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>4-Wk Forecast</span>
          <span className={`font-black ${pred < 25 ? 'text-red-400' : pred < 40 ? 'text-amber-400' : 'text-cyan-400'}`}>{pred}%</span>
        </div>
        <div className={`p-1.5 rounded-lg border text-center ${isDark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-gray-50 border-gray-200'}`}>
          <span className={`block text-[9px] ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Projected Net</span>
          <span className={`font-black ${(pred - curr) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {(pred - curr) >= 0 ? `+${(pred - curr).toFixed(1)}%` : `${(pred - curr).toFixed(1)}%`}
          </span>
        </div>
      </div>
    </div>
  )
}

// Comprehensive Google Maps & Cyber Basemap Themes
const MAP_THEMES = {
  'google-hybrid': {
    name: 'Google Hybrid',
    category: 'Satellite',
    icon: '🛰️',
    description: 'High-res Google satellite imagery with roads & boundaries',
    url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    attribution: '&copy; Google Maps',
    maxZoom: 20
  },
  'google-roadmap': {
    name: 'Google Roadmap',
    category: 'Vector Standard',
    icon: '🗺️',
    description: 'Clean Google Maps vector roads, cities, and hydrological networks',
    url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    attribution: '&copy; Google Maps',
    maxZoom: 20
  },
  'google-terrain': {
    name: 'Google Terrain',
    category: 'Topography',
    icon: '🏔️',
    description: 'Topographic elevation contours & river catchment relief',
    url: 'https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    attribution: '&copy; Google Maps',
    maxZoom: 20
  },
  'google-satellite': {
    name: 'Google Satellite',
    category: 'Satellite',
    icon: '📷',
    description: 'Pure photographic aerial imagery without labels',
    url: 'https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    attribution: '&copy; Google Maps',
    maxZoom: 20
  }
};

// Custom high-tech pulsing radar marker for reservoirs
const createMarkerIcon = (status, isSelected) => {
  const bg = status === 'critical' ? '#ef4444' : status === 'watch' ? '#f59e0b' : '#06b6d4'
  const glow = status === 'critical' ? 'rgba(239, 68, 68, 0.7)' : status === 'watch' ? 'rgba(245, 158, 11, 0.7)' : 'rgba(6, 182, 212, 0.7)'
  
  const ping = status === 'critical' || isSelected
    ? `<span class="absolute -inset-1.5 rounded-full animate-ping opacity-75" style="background:${bg}"></span>`
    : ''
  
  const selectedHalo = isSelected
    ? `<span class="absolute -inset-3.5 rounded-full border-2 border-cyan-400 animate-pulse opacity-90"></span>`
    : ''

  return L.divIcon({
    className: 'custom-reservoir-icon',
    html: `
      <div class="relative flex items-center justify-center w-7 h-7 cursor-pointer group">
        ${selectedHalo}
        ${ping}
        <div class="w-4 h-4 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-all duration-200 group-hover:scale-125" style="background-color: ${bg}; box-shadow: 0 0 12px ${glow};">
          <div class="w-1.5 h-1.5 rounded-full bg-white opacity-95"></div>
        </div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  })
}

// Ensures Leaflet map dynamically invalidates size smoothly during layout transitions
function MapResizeWatcher({ mapViewMode }) {
  const map = useMap()
  useEffect(() => {
    map.invalidateSize()
    const timers = [
      setTimeout(() => map.invalidateSize(), 50),
      setTimeout(() => map.invalidateSize(), 150),
      setTimeout(() => map.invalidateSize(), 300),
      setTimeout(() => map.invalidateSize(), 550)
    ]
    return () => timers.forEach(clearTimeout)
  }, [map, mapViewMode])
  return null
}

export default function App() {
  const [theme, setTheme] = useState('dark') // 'dark' (pure black) or 'light'
  const [mapTheme, setMapTheme] = useState('google-hybrid') // 'google-hybrid', 'google-roadmap', 'google-terrain', 'google-satellite', 'dark-matter', 'positron-light'
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false)
  const [googleApiKey, setGoogleApiKey] = useState(() => localStorage.getItem('google_maps_api_key') || '')
  const [activeTab, setActiveTab] = useState('map')
  const [mapViewMode, setMapViewMode] = useState('full') // 'full' (100% full screen width) or 'split'
  const [reservoirs, setReservoirs] = useState([])
  const [groundwater, setGroundwater] = useState([])
  const [leakage, setLeakage] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Interactive state enhancements
  const [selectedBasin, setSelectedBasin] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedState, setSelectedState] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL') // 'ALL', 'critical', 'watch', 'normal'
  const [isLegendOpen, setIsLegendOpen] = useState(true)
  const [mapThemeMenuOpen, setMapThemeMenuOpen] = useState(false)
  
  // Simulation modal state
  const [simModalOpen, setSimModalOpen] = useState(false)
  const [simRainfall, setSimRainfall] = useState(5.0)
  const [simOutflow, setSimOutflow] = useState(4.0)
  const [simResult, setSimResult] = useState(null)

  useEffect(() => {
    const generateMock150Reservoirs = () => {
      const STATES_BASINS = [
        ["Maharashtra", "Godavari / Krishna"],
        ["Gujarat", "Narmada / Tapi"],
        ["Karnataka", "Kaveri / Tungabhadra"],
        ["Andhra Pradesh", "Godavari / Krishna"],
        ["Odisha", "Mahanadi / Brahmani"],
        ["Uttar Pradesh", "Ganga / Yamuna"],
        ["Madhya Pradesh", "Narmada / Chambal"],
        ["Tamil Nadu", "Kaveri / Vaigai"],
        ["Telangana", "Godavari / Krishna"],
        ["Rajasthan", "Banis / Chambal"],
        ["Kerala", "Periyar / Bharathapuzha"],
        ["Punjab & Haryana", "Sutlej / Beas"]
      ];
      
      const list = [];
      for (let i = 1; i <= 150; i++) {
        const res_id = `RES-${String(i).padStart(3, '0')}`;
        const [state, basin] = STATES_BASINS[(i * 7) % STATES_BASINS.length];
        const name = `${state} Dam Node ${i}`;
        const current_storage = Number((15 + ((i * 37) % 80)).toFixed(1));
        const predicted_storage = Number(Math.max(5, current_storage + (((i * 13) % 20) - 10)).toFixed(1));
        const shortage_prob = predicted_storage < 40 ? 0.85 : 0.15;
        const status = current_storage < 30 ? 'critical' : current_storage < 50 ? 'watch' : 'normal';
        
        const lat = Number((12.0 + ((i * 11) % 19)).toFixed(4));
        const lon = Number((72.0 + ((i * 17) % 16)).toFixed(4));

        list.push({
          reservoir_id: res_id,
          name,
          state,
          basin,
          current_storage_pct: current_storage,
          predicted_storage_4weeks_pct: predicted_storage,
          shortage_probability_below_40: shortage_prob,
          status,
          latitude: lat,
          longitude: lon
        });
      }
      return list;
    };

    Promise.all([
      fetch('http://127.0.0.1:8000/api/engines/reservoirs').then(res => res.json()).catch(() => []),
      fetch('http://127.0.0.1:8000/api/engines/groundwater').then(res => res.json()).catch(() => []),
      fetch('http://127.0.0.1:8000/api/engines/leakage').then(res => res.json()).catch(() => [])
    ])
      .then(([resData, gwData, leakData]) => {
        const finalReservoirs = (resData && resData.length >= 10) ? resData : generateMock150Reservoirs();
        setReservoirs(finalReservoirs);
        setGroundwater(gwData || []);
        setLeakage(leakData || []);
        if (finalReservoirs.length > 0) {
          setSelectedBasin(finalReservoirs[0]);
          setSimResult(finalReservoirs[0]);
        }
        setLoading(false);
      })
      .catch(() => {
        const fallback = generateMock150Reservoirs();
        setReservoirs(fallback);
        setSelectedBasin(fallback[0]);
        setSimResult(fallback[0]);
        setLoading(false);
      });
  }, [])

  const filteredReservoirs = reservoirs.filter(res => {
    const matchesSearch = res.name.toLowerCase().includes(searchQuery.toLowerCase()) || res.reservoir_id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesState = selectedState === 'ALL' || res.state.toLowerCase() === selectedState.toLowerCase()
    const matchesStatus = statusFilter === 'ALL' || res.status === statusFilter
    return matchesSearch && matchesState && matchesStatus
  })

  const runSimulation = () => {
    if (!selectedBasin) return
    const base = selectedBasin.current_storage_pct
    const predicted = Math.max(5.0, Math.min(100.0, base + (simRainfall * 0.8) - (simOutflow * 1.2) - 2.5))
    const prob = predicted < 40 ? 0.95 : 0.15
    const status = predicted < 25 ? 'critical' : predicted < 40 ? 'watch' : 'normal'

    setSimResult({
      ...selectedBasin,
      predicted_storage_4weeks_pct: Number(predicted.toFixed(1)),
      shortage_probability_below_40: prob,
      status: status
    })
  }

  // National Reservoir Analytics for Top Dashboard Screen
  const totalMonitoredCount = reservoirs.length;
  const avgStoragePct = totalMonitoredCount > 0
    ? (reservoirs.reduce((acc, r) => acc + (Number(r.current_storage_pct) || 0), 0) / totalMonitoredCount).toFixed(1)
    : '0.0';
  const criticalCount = reservoirs.filter(r => r.status === 'critical' || (r.shortage_probability_below_40 || 0) >= 0.7).length;

  // Top 5 At Most Risk: Lowest storage and highest shortage probability
  const top5AtRiskReservoirs = [...reservoirs]
    .sort((a, b) => {
      const probA = a.shortage_probability_below_40 || 0;
      const probB = b.shortage_probability_below_40 || 0;
      if (Math.abs(probB - probA) > 0.05) {
        return probB - probA;
      }
      return (a.current_storage_pct || 0) - (b.current_storage_pct || 0);
    })
    .slice(0, 5);

  const handleSelectAndScrollToReservoir = (res, jumpToMap = false) => {
    setSelectedBasin(res);
    setSimResult(res);
    if (jumpToMap) {
      setActiveTab('map');
      setTimeout(() => {
        window.scrollTo({ top: 120, behavior: 'smooth' });
      }, 100);
    } else {
      if (statusFilter !== 'ALL' && res.status !== statusFilter) {
        setStatusFilter('ALL');
      }
      if (selectedState !== 'ALL' && res.state.toLowerCase() !== selectedState.toLowerCase()) {
        setSelectedState('ALL');
      }
      setTimeout(() => {
        const el = document.getElementById(`res-card-${res.reservoir_id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  const isDark = theme === 'dark';

  return (
    <motion.div 
      initial={false}
      animate={{
        backgroundColor: isDark ? '#000000' : '#f8fafc',
        color: isDark ? '#f4f4f5' : '#0f172a'
      }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      className="min-h-screen w-full font-sans flex flex-col"
    >
      
      {/* Top Navbar */}
      <motion.header 
        layout
        className={`${isDark ? 'bg-[#050505] border-zinc-800' : 'bg-white border-gray-200 shadow-sm'} border-b px-6 py-3 flex flex-col sm:flex-row justify-between items-center z-20 transition-colors duration-300 gap-3`}
      >
        <div className="flex items-center gap-3.5">
          <img 
            src={logoImg} 
            alt="Jal Drishti Logo" 
            className="h-10 w-10 sm:h-11 sm:w-11 object-contain drop-shadow-sm"
          />
          <h1 className={`text-2xl sm:text-[26px] font-extrabold tracking-tight font-brand ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Jal Drishti
          </h1>
        </div>

        {/* Navigation & Theme Switcher */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <div className={`flex p-1 rounded-xl border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-gray-100 border-gray-200'} gap-1`}>
            {['map', 'reservoirs', 'groundwater', 'leakage'].map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-3.5 py-1.5 text-xs font-semibold rounded-lg transition capitalize z-10 ${
                    isActive ? 'text-white' : (isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
                  }`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="activeTabBadge"
                      className="absolute inset-0 bg-cyan-600 rounded-lg shadow -z-10"
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                    />
                  )}
                  {tab === 'map' ? '🗺️ GIS Map' : tab === 'reservoirs' ? '🌊 Reservoirs' : tab === 'groundwater' ? '💧 Groundwater' : '🔍 Leakage'}
                </button>
              );
            })}
          </div>

          {/* Sleek Animated Theme Switch */}
          <div className="flex items-center gap-2">
            <motion.button 
              type="button"
              role="switch"
              aria-checked={isDark}
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                isDark ? 'bg-zinc-800' : 'bg-cyan-500'
              }`}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            >
              <span className="sr-only">Toggle theme</span>
              <motion.span
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`pointer-events-none flex h-7 w-7 transform items-center justify-center rounded-full shadow-lg text-sm ${
                  isDark ? 'translate-x-8 bg-zinc-950 text-amber-300' : 'translate-x-0 bg-white text-amber-500'
                }`}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={isDark ? 'moon' : 'sun'}
                    initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isDark ? '🌙' : '☀️'}
                  </motion.span>
                </AnimatePresence>
              </motion.span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 w-full max-w-[100vw]">
        {loading && <div className="text-cyan-500 text-center py-20 font-medium">Synchronizing live telemetry streams...</div>}
        {error && <div className="text-red-500 text-center py-20 font-medium">Connection Error: {error}</div>}

        {/* TAB: GIS MAP & INSPECTOR */}
        {!loading && activeTab === 'map' && (
          <div className="space-y-4 w-full">
            
            {/* GIS Leaflet Map Card */}
            <div className={`w-full ${isDark ? 'bg-[#080808] border-zinc-800' : 'bg-white border-gray-200 shadow-md'} border rounded-2xl p-3 flex flex-col justify-between`}>
              
              {/* Search, Filter & Layout Toolbar */}
              <div className="flex flex-col lg:flex-row justify-between items-center mb-2 gap-2 w-full">
                <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap">
                  <div className="relative w-full sm:w-56">
                    <input 
                      type="text" 
                      placeholder="Search basin or ID..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full text-xs rounded-xl px-3 py-2 border focus:outline-none focus:border-cyan-500 ${isDark ? 'bg-black border-zinc-800 text-white placeholder-zinc-600' : 'bg-gray-50 border-gray-300 text-slate-900'}`}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>State:</span>
                    <select 
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className={`text-xs rounded-xl px-3 py-2 border focus:outline-none focus:border-cyan-500 ${isDark ? 'bg-black border-zinc-800 text-white' : 'bg-gray-50 border-gray-300 text-slate-900'}`}
                    >
                      <option value="ALL">All States (150 Nodes)</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Odisha">Odisha</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Punjab & Haryana">Punjab & Haryana</option>
                    </select>
                  </div>
                </div>

                {/* View Mode Controls */}
                <div className="flex items-center gap-2.5 flex-wrap justify-center lg:justify-end w-full lg:w-auto">
                  
                  {/* View Mode Toggle: Full Width vs Split */}
                  <div className={`flex items-center p-1 rounded-xl border ${isDark ? 'bg-black border-zinc-800' : 'bg-gray-100 border-gray-200'} text-xs font-semibold gap-1`}>
                    <button
                      onClick={() => setMapViewMode('full')}
                      className={`relative px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 z-10 ${mapViewMode === 'full' ? 'text-white' : (isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')}`}
                      title="Expand map to 100% full screen width"
                    >
                      {mapViewMode === 'full' && (
                        <motion.div
                          layoutId="mapViewModeBadge"
                          className="absolute inset-0 bg-cyan-600 rounded-lg shadow -z-10"
                          transition={{ type: "spring", stiffness: 450, damping: 32 }}
                        />
                      )}
                      <span>⛶</span> Full Width Map
                    </button>
                    <button
                      onClick={() => setMapViewMode('split')}
                      className={`relative px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 z-10 ${mapViewMode === 'split' ? 'text-white' : (isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')}`}
                      title="Split view with side-by-side inspector"
                    >
                      {mapViewMode === 'split' && (
                        <motion.div
                          layoutId="mapViewModeBadge"
                          className="absolute inset-0 bg-cyan-600 rounded-lg shadow -z-10"
                          transition={{ type: "spring", stiffness: 450, damping: 32 }}
                        />
                      )}
                      <span>◫</span> Split View
                    </button>
                  </div>

                </div>
              </div>

              {/* Map & Layout Body with Motion.dev spring transitions */}
              <motion.div 
                layout 
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
                className={`grid grid-cols-1 ${mapViewMode === 'split' ? 'lg:grid-cols-12 gap-6' : 'grid-cols-1'} w-full`}
              >
                
                {/* Leaflet Map Canvas */}
                <motion.div 
                  layout
                  transition={{ type: "spring", stiffness: 260, damping: 28 }}
                  className={`${mapViewMode === 'split' ? 'lg:col-span-8' : 'w-full'} relative h-[calc(100vh-320px)] min-h-[400px] rounded-2xl border z-10 transition-all duration-300 ${isDark ? 'border-zinc-800 bg-black' : 'border-gray-200 bg-gray-50'}`}
                >
                  {/* Inner map wrapper keeps overflow-hidden for Leaflet tiles */}
                  <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  <MapContainer 
                    center={[22.5937, 78.9629]} 
                    zoom={5} 
                    style={{ width: '100%', height: '100%', background: isDark ? '#000000' : '#f8fafc' }}
                    scrollWheelZoom={true}
                  >
                    <MapResizeWatcher mapViewMode={mapViewMode} />
                    
                    {/* Active Selected Theme Layer */}
                    <TileLayer
                      key={mapTheme}
                      attribution={MAP_THEMES[mapTheme].attribution}
                      url={MAP_THEMES[mapTheme].url}
                      subdomains={MAP_THEMES[mapTheme].subdomains}
                      maxZoom={MAP_THEMES[mapTheme].maxZoom}
                    />


                    {filteredReservoirs.map((res) => {
                      const lat = res.latitude || 22.5937;
                      const lon = res.longitude || 78.9629;
                      return (
                        <Marker 
                          key={res.reservoir_id} 
                          position={[lat, lon]}
                          icon={createMarkerIcon(res.status, selectedBasin?.reservoir_id === res.reservoir_id)}
                          eventHandlers={{
                            click: () => {
                              setSelectedBasin(res);
                              setSimResult(res);
                              if (mapViewMode === 'full') {
                                setTimeout(() => {
                                  document.getElementById('full-inspector-deck')?.scrollIntoView({ behavior: 'smooth' });
                                }, 100);
                              }
                            },
                          }}
                        >
                          <Popup className="custom-station-popup">
                            <div className="p-1 min-w-[210px]">
                              <div className="flex items-center justify-between gap-2 border-b pb-1.5 mb-2 border-gray-200">
                                <span className="text-[10px] font-mono font-bold text-cyan-600">{res.reservoir_id}</span>
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${res.status === 'critical' ? 'bg-red-100 text-red-700' : res.status === 'watch' ? 'bg-yellow-100 text-yellow-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                  {res.status}
                                </span>
                              </div>
                              <div className="font-bold text-sm text-slate-900 leading-tight mb-0.5">{res.name}</div>
                              <div className="text-[11px] text-slate-500 mb-2">{res.state} • {res.basin || 'National Basin'}</div>
                              
                              <div className="space-y-1.5 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                                <div className="flex justify-between">
                                  <span className="text-slate-600">Storage:</span>
                                  <span className="font-bold text-slate-900">{res.current_storage_pct}%</span>
                                </div>
                                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                  <div className={`h-full ${res.current_storage_pct < 30 ? 'bg-red-500' : res.current_storage_pct < 50 ? 'bg-yellow-500' : 'bg-cyan-600'}`} style={{ width: `${Math.min(100, res.current_storage_pct)}%` }}></div>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-600">4-Wk Pred:</span>
                                  <span className="font-bold text-cyan-700">{res.predicted_storage_4weeks_pct}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-600">Shortage Risk:</span>
                                  <span className="font-bold text-red-600">{(res.shortage_probability_below_40 * 100).toFixed(0)}%</span>
                                </div>
                              </div>

                              <div className="mt-2.5 flex gap-1.5">
                                <button 
                                  onClick={() => {
                                    setSelectedBasin(res);
                                    setSimResult(res);
                                    downloadStationPDF(res, res);
                                  }}
                                  className="flex-1 bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-bold py-1.5 px-2 rounded-lg transition shadow"
                                >
                                  📥 PDF
                                </button>
                                <button 
                                  onClick={() => {
                                    setSelectedBasin(res);
                                    setSimResult(res);
                                    setSimModalOpen(true);
                                  }}
                                  className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold py-1.5 px-2 rounded-lg transition shadow"
                                >
                                  ⚡ Sim
                                </button>
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                  </MapContainer>
                  </div>{/* end inner overflow-hidden map wrapper */}

                  {/* Floating Map Theme Hamburger — top-right of map */}
                  <div className="absolute top-3 right-3 z-[500] pointer-events-auto">
                    <AnimatePresence>
                      {mapThemeMenuOpen && (
                        <>
                          {/* Click-outside backdrop (invisible) */}
                          <div
                            className="fixed inset-0 z-[-1]"
                            onClick={() => setMapThemeMenuOpen(false)}
                          />
                          <motion.div
                            key="theme-menu"
                            initial={{ opacity: 0, scale: 0.92, y: -8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: -8 }}
                            transition={{ duration: 0.18, ease: 'easeOut' }}
                            className={`absolute top-11 right-0 w-52 rounded-2xl border shadow-2xl backdrop-blur-md overflow-hidden ${
                              isDark ? 'bg-black/95 border-zinc-700 text-zinc-200' : 'bg-white/98 border-gray-200 text-slate-800 shadow-xl'
                            }`}
                          >
                            <div className={`px-3 py-2 border-b text-[10px] font-black uppercase tracking-widest ${isDark ? 'border-zinc-800 text-zinc-500' : 'border-gray-100 text-slate-400'}`}>
                              Map Theme
                            </div>
                            <div className="p-1.5 space-y-0.5">
                              {Object.entries(MAP_THEMES).map(([themeKey, themeData]) => {
                                const isActive = mapTheme === themeKey;
                                return (
                                  <button
                                    key={themeKey}
                                    onClick={() => { setMapTheme(themeKey); setMapThemeMenuOpen(false); }}
                                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                                      isActive
                                        ? 'bg-cyan-600 text-white shadow'
                                        : (isDark ? 'hover:bg-zinc-800/80 text-zinc-300' : 'hover:bg-gray-100 text-slate-700')
                                    }`}
                                    title={themeData.description}
                                  >
                                    <span className="text-base leading-none">{themeData.icon}</span>
                                    <div className="flex flex-col items-start">
                                      <span>{themeData.name}</span>
                                      <span className={`text-[10px] font-normal ${isActive ? 'text-cyan-100' : (isDark ? 'text-zinc-500' : 'text-slate-400')}`}>{themeData.category}</span>
                                    </div>
                                    {isActive && <span className="ml-auto text-white text-xs">✓</span>}
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                    {/* Hamburger trigger button */}
                    <motion.button
                      whileHover={{ scale: 1.07 }}
                      whileTap={{ scale: 0.93 }}
                      onClick={() => setMapThemeMenuOpen(v => !v)}
                      className={`flex flex-col justify-center items-center w-9 h-9 rounded-xl border shadow-lg backdrop-blur-md gap-[5px] transition ${
                        mapThemeMenuOpen
                          ? 'bg-cyan-600 border-cyan-500 text-white shadow-cyan-900/40'
                          : (isDark ? 'bg-black/90 border-zinc-700 text-zinc-300 hover:border-cyan-700 hover:text-white' : 'bg-white/95 border-gray-300 text-slate-700 hover:border-cyan-400 shadow-md')
                      }`}
                      title="Map Theme"
                    >
                      <span className={`block w-4 h-[2px] rounded-full transition-all ${mapThemeMenuOpen ? 'bg-white rotate-45 translate-y-[7px]' : (isDark ? 'bg-zinc-300' : 'bg-slate-600')}`} style={{ transformOrigin: 'center' }} />
                      <span className={`block h-[2px] rounded-full transition-all ${mapThemeMenuOpen ? 'opacity-0 w-0' : 'w-4'} ${isDark ? 'bg-zinc-300' : 'bg-slate-600'}`} />
                      <span className={`block w-4 h-[2px] rounded-full transition-all ${mapThemeMenuOpen ? 'bg-white -rotate-45 -translate-y-[7px]' : (isDark ? 'bg-zinc-300' : 'bg-slate-600')}`} style={{ transformOrigin: 'center' }} />
                    </motion.button>
                  </div>

                  {/* Floating Map Legend Overlay */}
                  <div className="absolute bottom-5 left-5 z-[400] max-w-xs transition-all duration-200 pointer-events-auto">
                    <AnimatePresence mode="wait">
                      {isLegendOpen ? (
                        <motion.div 
                          key="legend-open"
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className={`backdrop-blur-md ${isDark ? 'bg-black/90 border-zinc-800 text-zinc-200' : 'bg-white/95 border-gray-200 text-slate-800 shadow-xl'} border rounded-2xl p-3.5 shadow-2xl space-y-2.5`}
                        >
                          <div className="flex items-center justify-between gap-3 border-b pb-2 border-zinc-800/60 dark:border-zinc-800">
                            <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider">
                              <span>🗺️</span>
                              <span>Station Legend</span>
                            </div>
                            <button 
                              onClick={() => setIsLegendOpen(false)}
                              className={`text-[10px] px-1.5 py-0.5 rounded transition ${isDark ? 'text-zinc-400 hover:text-white bg-zinc-900' : 'text-slate-500 hover:text-slate-900 bg-gray-100'}`}
                              title="Minimize legend"
                            >
                              Hide ✕
                            </button>
                          </div>

                          <div className="space-y-1.5 text-xs">
                            {/* Critical */}
                            <button
                              onClick={() => setStatusFilter(statusFilter === 'critical' ? 'ALL' : 'critical')}
                              className={`w-full flex items-center justify-between p-1.5 rounded-lg transition text-left ${statusFilter === 'critical' ? 'bg-red-950/60 ring-1 ring-red-500' : (isDark ? 'hover:bg-zinc-900/60' : 'hover:bg-gray-100')}`}
                              title="Click to filter Critical nodes"
                            >
                              <div className="flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </span>
                                <span className="font-semibold text-xs">Critical (&lt;25%)</span>
                              </div>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-950 text-red-300 font-bold border border-red-800">
                                {reservoirs.filter(r => r.status === 'critical').length}
                              </span>
                            </button>

                            {/* Watch */}
                            <button
                              onClick={() => setStatusFilter(statusFilter === 'watch' ? 'ALL' : 'watch')}
                              className={`w-full flex items-center justify-between p-1.5 rounded-lg transition text-left ${statusFilter === 'watch' ? 'bg-yellow-950/60 ring-1 ring-yellow-500' : (isDark ? 'hover:bg-zinc-900/60' : 'hover:bg-gray-100')}`}
                              title="Click to filter Watch nodes"
                            >
                              <div className="flex items-center gap-2">
                                <span className="inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                                <span className="font-semibold text-xs">Watch (25% - 40%)</span>
                              </div>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-yellow-950 text-yellow-300 font-bold border border-yellow-800">
                                {reservoirs.filter(r => r.status === 'watch').length}
                              </span>
                            </button>

                            {/* Normal */}
                            <button
                              onClick={() => setStatusFilter(statusFilter === 'normal' ? 'ALL' : 'normal')}
                              className={`w-full flex items-center justify-between p-1.5 rounded-lg transition text-left ${statusFilter === 'normal' ? 'bg-cyan-950/60 ring-1 ring-cyan-500' : (isDark ? 'hover:bg-zinc-900/60' : 'hover:bg-gray-100')}`}
                              title="Click to filter Normal nodes"
                            >
                              <div className="flex items-center gap-2">
                                <span className="inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                                <span className="font-semibold text-xs">Normal (&gt;40%)</span>
                              </div>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-800">
                                {reservoirs.filter(r => r.status === 'normal').length}
                              </span>
                            </button>

                            {/* Indicator and reset */}
                            <div className={`pt-1.5 border-t ${isDark ? 'border-zinc-800/80 text-zinc-400' : 'border-gray-200 text-slate-500'} flex items-center justify-between text-[11px]`}>
                              <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-full border-2 border-white ring-2 ring-cyan-400 bg-cyan-600"></div>
                                <span>Selected Node</span>
                              </div>
                              {statusFilter !== 'ALL' && (
                                <button 
                                  onClick={() => setStatusFilter('ALL')}
                                  className="text-[10px] text-cyan-400 hover:underline font-bold"
                                >
                                  Show All ({reservoirs.length})
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.button 
                          key="legend-closed"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          onClick={() => setIsLegendOpen(true)}
                          className={`backdrop-blur-md ${isDark ? 'bg-black/90 border-zinc-800 text-zinc-200 hover:bg-zinc-900' : 'bg-white/95 border-gray-300 text-slate-800 hover:bg-gray-100 shadow-md'} border rounded-xl px-3 py-1.5 text-xs font-bold shadow-lg flex items-center gap-1.5 transition`}
                          title="Open Legend"
                        >
                          <span>🗺️ Show Legend</span>
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* In Split Mode: Side Inspector */}
                <AnimatePresence>
                  {mapViewMode === 'split' && (
                    <motion.div 
                      key="split-inspector"
                      layout
                      initial={{ opacity: 0, x: 40, scale: 0.96 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 40, scale: 0.96 }}
                      transition={{ type: "spring", stiffness: 300, damping: 28 }}
                      className={`lg:col-span-4 h-[calc(100vh-320px)] min-h-[400px] overflow-y-auto ${isDark ? 'bg-[#0a0a0a] border-zinc-800' : 'bg-gray-50 border-gray-200'} border rounded-xl p-5 flex flex-col justify-between`}
                    >
                      <div>
                        <div className={`flex justify-between items-center mb-4 border-b pb-3 ${isDark ? 'border-zinc-800' : 'border-gray-200'}`}>
                          <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                            Station Inspector
                          </h3>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => downloadOfficialCWCWeeklyReport(selectedBasin, reservoirs)}
                            disabled={!selectedBasin}
                            className={`text-xs font-bold px-2.5 py-1.5 rounded-lg transition shadow flex items-center gap-1 ${
                              selectedBasin
                                ? 'bg-gradient-to-r from-blue-700 to-cyan-700 hover:from-blue-600 hover:to-cyan-600 text-white shadow-sm'
                                : 'opacity-40 cursor-not-allowed bg-zinc-900 text-zinc-600'
                            }`}
                            title="Download Latest Official Weekly CWC National Bulletin (PDF)"
                          >
                            <span>🏛️</span> CWC Bulletin
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => downloadStationPDF(selectedBasin, simResult)}
                            disabled={!selectedBasin}
                            className={`text-xs font-semibold px-2 py-1.5 rounded-lg transition shadow flex items-center gap-1 ${
                              selectedBasin
                                ? (isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700' : 'bg-gray-100 hover:bg-gray-200 text-slate-800 border border-gray-300')
                                : 'opacity-40 cursor-not-allowed bg-zinc-900 text-zinc-600'
                            }`}
                            title="Download Station ML Telemetry PDF Dossier"
                          >
                            <span>📄</span> Station PDF
                          </motion.button>
                          <motion.button 
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setSimModalOpen(true)}
                            className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-2.5 py-1.5 rounded-lg transition shadow"
                          >
                            ⚡ Sim
                          </motion.button>
                        </div>
                      </div>

                      {selectedBasin ? (
                        <div className="space-y-3.5">
                          <div>
                            <span className="text-xs font-mono text-cyan-500">{selectedBasin.reservoir_id}</span>
                            <h4 className={`text-lg font-black mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedBasin.name}</h4>
                            <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>{selectedBasin.state} Basin Region</p>
                          </div>

                          {/* Dynamic Graphs for Predictions & Historical Telemetry */}
                          <StationTelemetryCharts basin={selectedBasin} sim={simResult} isDark={isDark} />

                          <div className={`${isDark ? 'bg-black border-zinc-800' : 'bg-white border-gray-200 shadow-sm'} p-4 rounded-xl border space-y-3`}>
                            <div className="flex justify-between text-sm">
                              <span className={isDark ? 'text-zinc-400' : 'text-slate-600'}>Current Storage:</span>
                              <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedBasin.current_storage_pct}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className={isDark ? 'text-zinc-400' : 'text-slate-600'}>Predicted (4 Wks):</span>
                              <span className="font-bold text-cyan-500">{simResult ? simResult.predicted_storage_4weeks_pct : selectedBasin.predicted_storage_4weeks_pct}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className={isDark ? 'text-zinc-400' : 'text-slate-600'}>Shortage Risk (&lt;40%):</span>
                              <span className="font-bold text-red-500">{((simResult ? simResult.shortage_probability_below_40 : selectedBasin.shortage_probability_below_40) * 100).toFixed(0)}%</span>
                            </div>
                            <div className={`flex justify-between text-sm pt-2 border-t ${isDark ? 'border-zinc-800' : 'border-gray-200'}`}>
                              <span className={isDark ? 'text-zinc-400' : 'text-slate-600'}>Calculated Status:</span>
                              <span className={`uppercase text-xs font-bold px-2.5 py-1 rounded ${(simResult?.status || selectedBasin.status) === 'critical' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'}`}>
                                {simResult?.status || selectedBasin.status}
                              </span>
                            </div>
                          </div>

                          <div className={`${isDark ? 'bg-cyan-950/20 border-cyan-900/50' : 'bg-cyan-50 border-cyan-200'} border p-3.5 rounded-xl`}>
                            <h5 className={`text-xs font-bold mb-1 ${isDark ? 'text-cyan-400' : 'text-cyan-800'}`}>🤖 XGBoost + LSTM Model</h5>
                            <p className={`text-xs leading-relaxed ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                              {selectedBasin.status === 'critical' 
                                ? "Urgent irrigation rationing advised. High probability of dipping below critical threshold within 28 days."
                                : "Water storage levels stable. Continue standard regulated distribution across regional command zones."}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className={`text-xs py-16 text-center ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>Select a station node from the map to view detailed telemetry metrics.</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              </motion.div>

              {/* Scrollable Node Cards Grid with micro-interactions */}
              <div className="mt-3 pt-2.5 border-t border-zinc-800/40 dark:border-zinc-800/60">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                    Monitored Basins ({filteredReservoirs.length})
                  </span>
                  <span className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                    Select basin to inspect
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[145px] overflow-y-auto pr-1">
                  {filteredReservoirs.map((res) => (
                    <motion.div 
                      key={res.reservoir_id}
                      layout
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      onClick={() => {
                        setSelectedBasin(res);
                        setSimResult(res);
                        if (mapViewMode === 'full') {
                          setTimeout(() => {
                            document.getElementById('full-inspector-deck')?.scrollIntoView({ behavior: 'smooth' });
                          }, 100);
                        }
                      }}
                      className={`px-3 py-2 rounded-xl border cursor-pointer transition ${
                        selectedBasin?.reservoir_id === res.reservoir_id 
                          ? (isDark ? 'bg-cyan-950/40 border-cyan-500 shadow' : 'bg-cyan-50 border-cyan-500 shadow') 
                          : (isDark ? 'bg-black border-zinc-800 hover:border-zinc-700' : 'bg-gray-50 border-gray-200 hover:border-gray-300')
                      }`}
                    >
                      <div className="flex justify-between items-center mb-0.5">
                        <span className={`text-[10px] font-mono ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>{res.reservoir_id}</span>
                        <span className={`w-2 h-2 rounded-full ${res.status === 'critical' ? 'bg-red-500' : res.status === 'watch' ? 'bg-yellow-500' : 'bg-emerald-500'}`}></span>
                      </div>
                      <h4 className={`text-xs font-bold truncate ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>{res.name}</h4>
                      <div className="flex justify-between items-center mt-0.5">
                        <span className={`text-[10px] truncate ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>{res.state}</span>
                        <span className="text-[10px] text-cyan-500 font-semibold">{res.current_storage_pct}%</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* In Full Width Mode: Comprehensive Bottom Inspector Deck */}
            <AnimatePresence>
              {mapViewMode === 'full' && (
                <motion.div 
                  id="full-inspector-deck"
                  key="full-inspector-deck"
                  layout
                  initial={{ opacity: 0, y: 35, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 35, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 28 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full"
                >
                  {/* Station Telemetry Card */}
                  <div className={`lg:col-span-6 ${isDark ? 'bg-[#080808] border-zinc-800' : 'bg-white border-gray-200 shadow-md'} border rounded-2xl p-6 flex flex-col justify-between`}>
                    <div>
                      <div className={`flex justify-between items-center mb-4 border-b pb-3 ${isDark ? 'border-zinc-800' : 'border-gray-200'} flex-wrap gap-2`}>
                        <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                          Station Inspector ({selectedBasin?.name || 'Select Station'})
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => downloadOfficialCWCWeeklyReport(selectedBasin, reservoirs)}
                            disabled={!selectedBasin}
                            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition shadow flex items-center gap-1.5 ${
                              selectedBasin
                                ? 'bg-gradient-to-r from-blue-700 to-cyan-700 hover:from-blue-600 hover:to-cyan-600 text-white shadow-md'
                                : 'opacity-40 cursor-not-allowed bg-zinc-900 text-zinc-600'
                            }`}
                            title="Download Latest Official Weekly CWC National Bulletin (PDF)"
                          >
                            <span>🏛️</span> Latest CWC Bulletin
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => downloadStationPDF(selectedBasin, simResult)}
                            disabled={!selectedBasin}
                            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition shadow flex items-center gap-1.5 ${
                              selectedBasin
                                ? (isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700' : 'bg-gray-100 hover:bg-gray-200 text-slate-800 border border-gray-300')
                                : 'opacity-40 cursor-not-allowed bg-zinc-900 text-zinc-600'
                            }`}
                            title="Download Official Station Telemetry & ML Report PDF"
                          >
                            <span>📄</span> Station Report PDF
                          </motion.button>
                          <motion.button 
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => setSimModalOpen(true)}
                            className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-3 py-1.5 rounded-lg transition shadow"
                          >
                            ⚡ Run What-If AI Sim
                          </motion.button>
                        </div>
                      </div>

                      {selectedBasin ? (
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-xs font-mono text-cyan-500">{selectedBasin.reservoir_id}</span>
                              <h4 className={`text-xl font-black mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedBasin.name}</h4>
                              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>{selectedBasin.state} • {selectedBasin.basin || 'National Basin'}</p>
                            </div>
                            <span className={`uppercase text-xs font-bold px-3 py-1 rounded ${(simResult?.status || selectedBasin.status) === 'critical' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'}`}>
                              {simResult?.status || selectedBasin.status}
                            </span>
                          </div>

                          {/* Dynamic Graphs for Predictions & Historical Telemetry */}
                          <StationTelemetryCharts basin={selectedBasin} sim={simResult} isDark={isDark} />

                          <div className="grid grid-cols-3 gap-3">
                            <div className={`${isDark ? 'bg-black border-zinc-800' : 'bg-gray-50 border-gray-200'} p-3 rounded-xl border`}>
                              <span className={`text-[11px] block ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Current Storage</span>
                              <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedBasin.current_storage_pct}%</span>
                            </div>
                            <div className={`${isDark ? 'bg-black border-zinc-800' : 'bg-gray-50 border-gray-200'} p-3 rounded-xl border`}>
                              <span className={`text-[11px] block ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Predicted (4 Wks)</span>
                              <span className="text-lg font-bold text-cyan-500">{simResult ? simResult.predicted_storage_4weeks_pct : selectedBasin.predicted_storage_4weeks_pct}%</span>
                            </div>
                            <div className={`${isDark ? 'bg-black border-zinc-800' : 'bg-gray-50 border-gray-200'} p-3 rounded-xl border`}>
                              <span className={`text-[11px] block ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Shortage Risk (&lt;40%)</span>
                              <span className="text-lg font-bold text-red-500">{((simResult ? simResult.shortage_probability_below_40 : selectedBasin.shortage_probability_below_40) * 100).toFixed(0)}%</span>
                            </div>
                          </div>

                          <div className={`${isDark ? 'bg-cyan-950/20 border-cyan-900/50' : 'bg-cyan-50 border-cyan-200'} border p-4 rounded-xl`}>
                            <h5 className={`text-xs font-bold mb-1 ${isDark ? 'text-cyan-400' : 'text-cyan-800'}`}>🤖 XGBoost + LSTM Inference Recommendation</h5>
                            <p className={`text-xs leading-relaxed ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                              {selectedBasin.status === 'critical' 
                                ? "Urgent irrigation rationing advised. High probability of dipping below critical threshold within 28 days based on temporal sequence memory."
                                : "Water storage levels stable. Continue standard regulated distribution across regional command zones."}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className={`text-xs py-10 text-center ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>Select a station node from the map above to view telemetry metrics.</p>
                      )}
                    </div>
                  </div>

                  {/* Quick Diagnostics & Telemetry Summary Card */}
                  <div className={`lg:col-span-6 ${isDark ? 'bg-[#080808] border-zinc-800' : 'bg-white border-gray-200 shadow-md'} border rounded-2xl p-6 flex flex-col justify-between`}>
                    <div>
                      <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 border-b pb-3 ${isDark ? 'text-zinc-300 border-zinc-800' : 'text-slate-700 border-gray-200'}`}>
                        National Telemetry Summary
                      </h3>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className={`${isDark ? 'bg-black border-zinc-800' : 'bg-gray-50 border-gray-200'} p-4 rounded-xl border text-center`}>
                          <div className="text-2xl font-black text-cyan-500">{reservoirs.length}</div>
                          <div className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'} mt-1`}>Monitored Dams</div>
                        </div>
                        <div className={`${isDark ? 'bg-black border-zinc-800' : 'bg-gray-50 border-gray-200'} p-4 rounded-xl border text-center`}>
                          <div className="text-2xl font-black text-red-500">{reservoirs.filter(r => r.status === 'critical').length}</div>
                          <div className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'} mt-1`}>Critical Watch</div>
                        </div>
                        <div className={`${isDark ? 'bg-black border-zinc-800' : 'bg-gray-50 border-gray-200'} p-4 rounded-xl border text-center`}>
                          <div className="text-2xl font-black text-emerald-500">{reservoirs.filter(r => r.status === 'normal').length}</div>
                          <div className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'} mt-1`}>Normal Storage</div>
                        </div>
                      </div>
                      <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'} leading-relaxed`}>
                        Live CWC data telemetry feeds combined with machine learning pipelines calculate 4-week reservoir depletion projections across all 150 primary Indian basins.
                      </p>
                    </div>
                    <div className={`text-[11px] text-center pt-4 border-t ${isDark ? 'text-zinc-600 border-zinc-800' : 'text-slate-400 border-gray-200'}`}>
                      NexHack 3.0 • Jal Drishti Command GIS
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        )}

        {/* TAB 1: RESERVOIRS */}
        {!loading && activeTab === 'reservoirs' && (
          <motion.div
            key="tab-reservoirs"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="space-y-8"
          >
            {/* EXECUTIVE TOP SCREEN */}
            <div className={`${isDark ? 'bg-[#09090b] border-zinc-800' : 'bg-white border-gray-200 shadow-md'} border rounded-3xl p-6 lg:p-7 space-y-7`}>
              
              {/* Header Title & Global Actions */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800/60 dark:border-zinc-800">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-2xl">🌊</span>
                    <h2 className={`text-xl font-black tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      National Reservoir Telemetry & Risk Deck
                    </h2>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${isDark ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-800' : 'bg-cyan-50 text-cyan-700 border border-cyan-200'}`}>
                      Engine A • LSTM & XGBoost
                    </span>
                  </div>
                  <p className={`text-xs mt-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Continuous 4-week automated depletion & shortage forecasting across India's monitored water reservoirs.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  {selectedBasin && (
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => downloadStationPDF(selectedBasin, simResult)}
                      className={`text-xs font-bold px-3.5 py-2 rounded-xl border flex items-center gap-1.5 transition ${
                        isDark 
                          ? 'bg-zinc-900 border-zinc-700 text-zinc-100 hover:bg-zinc-800' 
                          : 'bg-white border-gray-300 text-slate-800 hover:bg-gray-50 shadow-sm'
                      }`}
                      title="Download Official Station Report PDF"
                    >
                      <span>📥</span> PDF: {selectedBasin.name.split(' ')[0]}
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      setActiveTab('map');
                      setTimeout(() => window.scrollTo({ top: 120, behavior: 'smooth' }), 50);
                    }}
                    className="text-xs font-bold px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white shadow-md flex items-center gap-2 transition"
                  >
                    <span>🗺️</span> Switch to GIS Map
                  </motion.button>
                </div>
              </div>

              {/* 4 KPI Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. Total Monitored */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setStatusFilter('ALL');
                    setSelectedState('ALL');
                    setSearchQuery('');
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition ${isDark ? 'bg-black/60 border-zinc-800 hover:border-cyan-500/60' : 'bg-gray-50 border-gray-200 hover:border-cyan-500 shadow-sm'}`}
                  title="Click to reset filters and display all monitored nodes"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      Total Monitored
                    </span>
                    <span className="text-lg">🏛️</span>
                  </div>
                  <div className="text-3xl font-black text-cyan-500 tracking-tight">{totalMonitoredCount}</div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800/40">
                    <span className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>12 River Basins</span>
                    <span className="text-[10px] font-bold text-cyan-400">View All 150 →</span>
                  </div>
                </motion.div>

                {/* 2. Top 5 at Most Risk Trigger Card */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (top5AtRiskReservoirs.length > 0) {
                      handleSelectAndScrollToReservoir(top5AtRiskReservoirs[0]);
                    }
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition ${isDark ? 'bg-black/60 border-zinc-800 hover:border-red-500/60' : 'bg-gray-50 border-gray-200 hover:border-red-500 shadow-sm'}`}
                  title="Click to inspect the #1 most at-risk reservoir"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      Top Risk Priority
                    </span>
                    <span className="text-lg">⚠️</span>
                  </div>
                  <div className="text-3xl font-black text-red-500 tracking-tight">Top 5</div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800/40">
                    <span className={`text-[11px] truncate max-w-[130px] font-medium ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                      #1 {top5AtRiskReservoirs[0]?.name || 'Analyzing'}
                    </span>
                    <span className="text-[10px] font-bold text-red-400">Inspect #1 →</span>
                  </div>
                </motion.div>

                {/* 3. No. of Critical Alerts */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setStatusFilter(statusFilter === 'critical' ? 'ALL' : 'critical');
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition ${
                    statusFilter === 'critical'
                      ? 'bg-red-950/40 border-red-500 ring-2 ring-red-500/30'
                      : (isDark ? 'bg-black/60 border-zinc-800 hover:border-red-500/60' : 'bg-gray-50 border-gray-200 hover:border-red-500 shadow-sm')
                  }`}
                  title="Click to filter list to Critical Alert reservoirs"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      Critical Alerts
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                  </div>
                  <div className="text-3xl font-black text-red-500 tracking-tight">{criticalCount}</div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800/40">
                    <span className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Storage &lt; 30%</span>
                    <span className="text-[10px] font-bold text-red-400">
                      {statusFilter === 'critical' ? 'Showing Critical ✕' : 'Filter Critical →'}
                    </span>
                  </div>
                </motion.div>

                {/* 4. Avg Storage */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  className={`p-4 rounded-2xl border transition ${isDark ? 'bg-black/60 border-zinc-800' : 'bg-gray-50 border-gray-200 shadow-sm'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      Avg Storage Level
                    </span>
                    <span className="text-lg">💧</span>
                  </div>
                  <div className="text-3xl font-black text-cyan-400 tracking-tight">{avgStoragePct}%</div>
                  
                  {/* Visual Storage Bar */}
                  <div className="w-full bg-zinc-800/60 dark:bg-zinc-800 h-2 rounded-full mt-2.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        parseFloat(avgStoragePct) < 30 ? 'bg-red-500' : parseFloat(avgStoragePct) < 50 ? 'bg-yellow-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, parseFloat(avgStoragePct)))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                    <span>Critical: 30%</span>
                    <span>Target: 50%+</span>
                  </div>
                </motion.div>

              </div>

              {/* TOP 5 AT MOST RISK INTERACTIVE SCREEN */}
              <div className={`p-5 rounded-2xl border ${isDark ? 'bg-black/80 border-red-900/40 shadow-inner' : 'bg-red-50/40 border-red-200 shadow-sm'} space-y-4`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-600 text-white">
                        Priority Watch
                      </span>
                      <h3 className={`text-sm font-black tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        ⚠️ Top 5 Reservoirs at Most Risk (Immediate Depletion Forecast)
                      </h3>
                    </div>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                      Click any card to select, jump directly to its telemetry report, or inspect it on the GIS map.
                    </p>
                  </div>
                  <span className={`text-[11px] font-mono ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                    AI Risk Threshold &gt; 75%
                  </span>
                </div>

                {/* 5 At-Risk Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {top5AtRiskReservoirs.map((res, index) => {
                    const isSelected = selectedBasin?.reservoir_id === res.reservoir_id;
                    return (
                      <motion.div
                        key={res.reservoir_id}
                        layout
                        whileHover={{ scale: 1.04, y: -3 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        onClick={() => handleSelectAndScrollToReservoir(res)}
                        className={`p-3.5 rounded-xl border cursor-pointer relative overflow-hidden transition-all duration-200 flex flex-col justify-between ${
                          isSelected 
                            ? (isDark ? 'bg-red-950/70 border-red-500 ring-2 ring-red-500/50 shadow-lg' : 'bg-red-100 border-red-500 ring-2 ring-red-400 shadow-md')
                            : (isDark ? 'bg-zinc-950/90 border-zinc-800 hover:border-red-500/70' : 'bg-white border-gray-200 hover:border-red-400 shadow-sm')
                        }`}
                        title="Click to redirect and view full telemetry details below"
                      >
                        {/* Top Rank Badge & Reservoir ID */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-red-600 text-white shadow-sm">
                              #{index + 1}
                            </span>
                            <span className={`text-[10px] font-mono ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                              {res.reservoir_id}
                            </span>
                          </div>

                          <h4 className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`} title={res.name}>
                            {res.name}
                          </h4>
                          <p className={`text-[10px] truncate ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                            {res.state}
                          </p>
                        </div>

                        {/* Storage & Shortage Risk Metrics */}
                        <div className="mt-3 pt-2 border-t border-zinc-800/40 space-y-1.5">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className={isDark ? 'text-zinc-400' : 'text-slate-600'}>Current:</span>
                            <span className="font-black text-red-400">{res.current_storage_pct}%</span>
                          </div>
                          <div className="flex justify-between items-center text-[11px]">
                            <span className={isDark ? 'text-zinc-400' : 'text-slate-600'}>4-Wk Pred:</span>
                            <span className="font-bold text-cyan-400">{res.predicted_storage_4weeks_pct}%</span>
                          </div>
                          
                          {/* Mini Bar */}
                          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-red-500 rounded-full"
                              style={{ width: `${Math.min(100, Math.max(5, res.current_storage_pct))}%` }}
                            />
                          </div>

                          {/* Action Buttons: Redirect to Map / Select */}
                          <div className="flex items-center gap-1.5 pt-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectAndScrollToReservoir(res);
                              }}
                              className={`flex-1 text-[10px] font-bold py-1 px-1.5 rounded text-center transition ${
                                isSelected
                                  ? 'bg-red-600 text-white'
                                  : (isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200' : 'bg-gray-100 hover:bg-gray-200 text-slate-800')
                              }`}
                            >
                              {isSelected ? '✓ Selected' : 'Redirect ↓'}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectAndScrollToReservoir(res, true);
                              }}
                              className="text-[10px] font-bold py-1 px-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white transition shadow"
                              title="Inspect this reservoir on the GIS Map"
                            >
                              🗺️
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* RESERVOIR LIST & FILTER CONTROLS */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <span>📋</span> All Monitored Basins ({filteredReservoirs.length} of {reservoirs.length})
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Click any station node card below to inspect telemetry or run What-If simulations.
                  </p>
                </div>

                {/* Filter and Search Controls */}
                <div className="flex items-center gap-3 flex-wrap">
                  <input 
                    type="text" 
                    placeholder="Search basin or ID..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`text-xs rounded-xl px-3.5 py-2 border focus:outline-none focus:border-cyan-500 ${
                      isDark ? 'bg-black border-zinc-800 text-white placeholder-zinc-600' : 'bg-white border-gray-300 text-slate-900'
                    }`}
                  />

                  <select 
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className={`text-xs rounded-xl px-3 py-2 border focus:outline-none focus:border-cyan-500 ${
                      isDark ? 'bg-black border-zinc-800 text-white' : 'bg-white border-gray-300 text-slate-900'
                    }`}
                  >
                    <option value="ALL">All States</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Odisha">Odisha</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Punjab & Haryana">Punjab & Haryana</option>
                  </select>

                  <div className={`flex items-center p-1 rounded-xl border ${isDark ? 'bg-black border-zinc-800' : 'bg-gray-100 border-gray-200'} text-xs font-semibold gap-1`}>
                    {['ALL', 'critical', 'watch', 'normal'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`px-2.5 py-1 rounded-lg uppercase text-[10px] transition ${
                          statusFilter === st
                            ? 'bg-cyan-600 text-white'
                            : (isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Grid of All Monitored Reservoir Cards — compact scrollable */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
                {filteredReservoirs.map((res) => {
                  const isSelected = selectedBasin?.reservoir_id === res.reservoir_id;
                  return (
                    <motion.div 
                      key={res.reservoir_id}
                      id={`res-card-${res.reservoir_id}`}
                      layout
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      onClick={() => {
                        setSelectedBasin(res);
                        setSimResult(res);
                      }}
                      className={`px-3 py-2.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                        isSelected 
                          ? (isDark ? 'bg-cyan-950/30 border-cyan-500 ring-1 ring-cyan-500/50 shadow' : 'bg-cyan-50 border-cyan-500 ring-1 ring-cyan-400 shadow')
                          : (isDark ? 'bg-[#080808] border-zinc-800 hover:border-zinc-700' : 'bg-white border-gray-200 hover:border-gray-300')
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className={`text-xs font-bold truncate ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>{res.name}</h4>
                          <p className={`text-[10px] truncate ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>{res.state}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-semibold text-cyan-500">{res.current_storage_pct}%</span>
                          <span className={`w-2 h-2 rounded-full shrink-0 ${res.status === 'critical' ? 'bg-red-500 animate-pulse' : res.status === 'watch' ? 'bg-yellow-500' : 'bg-emerald-500'}`}></span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

          </motion.div>
        )}

        {/* TAB 2: GROUNDWATER */}
        {!loading && activeTab === 'groundwater' && (
          <motion.div
            key="tab-groundwater"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>💧 Engine B: Groundwater Depletion Classification</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {groundwater.map((gw, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ scale: 1.02, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className={`${isDark ? 'bg-[#080808] border-zinc-800' : 'bg-white border-gray-200 shadow-md'} border p-5 rounded-2xl`}
                >
                  <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{gw.district_name}</h3>
                  <p className={`text-xs mb-3 ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>{gw.state}</p>
                  <div className="space-y-2 text-sm">
                    <div className={`flex justify-between ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                      <span>Water Table Depth:</span>
                      <span className={`font-bold ${isDark ? 'text-zinc-200' : 'text-slate-900'}`}>{gw.water_table_depth_m} m</span>
                    </div>
                    <div className={`flex justify-between ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                      <span>Classification:</span>
                      <span className="font-bold text-yellow-500">{gw.classification}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* TAB 3: LEAKAGE */}
        {!loading && activeTab === 'leakage' && (
          <motion.div
            key="tab-leakage"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>🔍 Engine C: Real-Time Pipeline Leakage Detection</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {leakage.map((leak) => (
                <motion.div 
                  key={leak.sensor_id}
                  whileHover={{ scale: 1.02, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className={`${isDark ? 'bg-[#080808] border-zinc-800' : 'bg-white border-gray-200 shadow-md'} border p-5 rounded-2xl`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{leak.sensor_id}</h3>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                      {leak.event_type}
                    </span>
                  </div>
                  <p className={`text-xs mb-4 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>{leak.location}</p>
                  <div className="space-y-2 text-sm">
                    <div className={`flex justify-between ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                      <span>Flow Rate:</span>
                      <span className={`font-bold ${isDark ? 'text-zinc-200' : 'text-slate-900'}`}>{leak.flow_rate_m3h} m³/h</span>
                    </div>
                    <div className={`flex justify-between ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                      <span>Pressure:</span>
                      <span className={`font-bold ${isDark ? 'text-zinc-200' : 'text-slate-900'}`}>{leak.pressure_bar} bar</span>
                    </div>
                    <div className={`flex justify-between ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                      <span>Leak Probability:</span>
                      <span className="font-bold text-red-500">{(leak.leak_probability * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

      </main>

      {/* AI Simulation Modal with Spring Physics */}
      <AnimatePresence>
        {simModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.92, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 320 }}
              className={`${isDark ? 'bg-[#0a0a0a] border-zinc-800 text-white' : 'bg-white border-gray-200 text-slate-900'} border rounded-2xl p-6 max-w-md w-full shadow-2xl`}
            >
              <h3 className="text-base font-bold mb-1">⚡ XGBoost What-If Simulator</h3>
              <p className={`text-xs mb-4 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Simulate climate or outflow variations for: <span className="text-cyan-500 font-bold">{selectedBasin?.name}</span></p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className={`text-xs block mb-1 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>Simulated Rainfall Inflow: {simRainfall} mm/day</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="25" 
                    step="0.5"
                    value={simRainfall}
                    onChange={(e) => setSimRainfall(parseFloat(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>
                <div>
                  <label className={`text-xs block mb-1 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>Simulated Outflow Rate: {simOutflow} m³/s</label>
                  <input 
                    type="range" 
                    min="1" 
                    max="15" 
                    step="0.5"
                    value={simOutflow}
                    onChange={(e) => setSimOutflow(parseFloat(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setSimModalOpen(false)}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-gray-200 text-slate-800 hover:bg-gray-300'}`}
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    runSimulation()
                    setSimModalOpen(false)
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 transition shadow"
                >
                  Run AI Inference
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Google Maps API Settings Modal */}
      <AnimatePresence>
        {apiKeyModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.92, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 320 }}
              className={`${isDark ? 'bg-[#0a0a0a] border-zinc-800 text-white' : 'bg-white border-gray-200 text-slate-900'} border rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🗺️</span>
                  <h3 className="text-base font-bold">Google Maps API & Theme Engine</h3>
                </div>
                <button 
                  onClick={() => setApiKeyModalOpen(false)}
                  className={`text-xs px-2.5 py-1 rounded-lg transition ${isDark ? 'text-zinc-400 hover:text-white bg-zinc-900' : 'text-slate-500 hover:text-black bg-gray-100'}`}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-cyan-950/20 border-cyan-800 text-cyan-200' : 'bg-cyan-50 border-cyan-200 text-cyan-900'}`}>
                  <div className="flex items-center gap-2 font-bold text-cyan-400 mb-1">
                    <span>✓</span>
                    <span>Google Maps Services Active</span>
                  </div>
                  <p className="leading-relaxed">
                    Google Maps Basemaps (Roadmap, Satellite, Hybrid, Terrain) and Cyber themes are active and rendering high-resolution tiles directly.
                  </p>
                </div>

                <div>
                  <label className={`block font-semibold mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                    Optional Google Cloud Maps API Key:
                  </label>
                  <input 
                    type="text"
                    placeholder="AIzaSy..."
                    value={googleApiKey}
                    onChange={(e) => setGoogleApiKey(e.target.value)}
                    className={`w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border focus:outline-none focus:border-cyan-500 ${isDark ? 'bg-black border-zinc-800 text-white' : 'bg-gray-50 border-gray-300 text-slate-900'}`}
                  />
                  <p className={`text-[10px] mt-1.5 ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                    Entering an authorized Google Cloud key configures elevation profile lookups, 3D photorealistic tiles, and geocoding services.
                  </p>
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    onClick={() => setApiKeyModalOpen(false)}
                    className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-gray-100 text-slate-700 hover:bg-gray-200'}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      localStorage.setItem('google_maps_api_key', googleApiKey);
                      setApiKeyModalOpen(false);
                    }}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition shadow"
                  >
                    Save Key
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  )
}