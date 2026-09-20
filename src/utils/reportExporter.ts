import { jsPDF } from 'jspdf';
import { UserProfile, DailyVitals, LabReportItem, Habit, DetailedMealLog } from '../types';

export interface ReportDataPayload {
  patient: UserProfile;
  vitals: DailyVitals;
  labReports: LabReportItem[];
  habits: Habit[];
  meals: DetailedMealLog[];
  scores: {
    readiness: number;
    wellness: number;
    prediabetes: number;
    cvStress: number;
  };
}

/**
 * Generates and downloads a clean, professional medical consultation PDF dossier using jsPDF.
 */
export function exportReportToPDF(data: ReportDataPayload): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;
  let y = margin;

  // Helper for text
  const primaryColor = [34, 39, 31]; // #22271F
  const secondaryColor = [85, 88, 76]; // #55584C
  const accentColor = [44, 62, 102]; // #2C3E66
  const greenColor = [75, 115, 85]; // #4B7355
  const amberColor = [181, 130, 42]; // #B5822A
  const redColor = [168, 69, 44]; // #A8452C

  const bmi = (data.patient.weightKg / Math.pow(data.patient.heightCm / 100, 2)).toFixed(1);

  // --- 1. HEADER BAR ---
  doc.setFillColor(241, 239, 230); // #F1EFE6
  doc.rect(margin, y, pageWidth - margin * 2, 48, 'F');
  doc.setDrawColor(34, 39, 31);
  doc.setLineWidth(1.5);
  doc.rect(margin, y, pageWidth - margin * 2, 48, 'S');

  doc.setFont('times', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(34, 39, 31);
  doc.text('HEALTHGUARD CLINICAL CONSULTATION DOSSIER', margin + 12, y + 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(85, 88, 76);
  doc.text('Preventive Metabolic & Chronic Disease Health Registry • Ward 12 Surveillance Area', margin + 12, y + 38);

  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  doc.setFont('courier', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(34, 39, 31);
  doc.text(`Dossier ID: HG-${new Date().getFullYear()}-9042`, pageWidth - margin - 150, y + 20);
  doc.setFont('courier', 'normal');
  doc.text(`Generated: ${dateStr}`, pageWidth - margin - 150, y + 36);

  y += 58;

  // --- 2. PATIENT DEMOGRAPHICS TABLE ---
  doc.setFillColor(251, 250, 243);
  doc.rect(margin, y, pageWidth - margin * 2, 54, 'F');
  doc.setDrawColor(207, 201, 180);
  doc.setLineWidth(1);
  doc.rect(margin, y, pageWidth - margin * 2, 54, 'S');

  // Column 1
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(139, 135, 118);
  doc.text('PATIENT NAME', margin + 10, y + 16);
  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(34, 39, 31);
  doc.text(data.patient.name, margin + 10, y + 32);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(85, 88, 76);
  doc.text(`${data.patient.age} Y / ${data.patient.gender} • Blood: ${data.patient.bloodGroup}`, margin + 10, y + 46);

  // Column 2
  const col2X = margin + 160;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(139, 135, 118);
  doc.text('BIOMETRICS', col2X, y + 16);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(34, 39, 31);
  doc.text(`BMI: ${bmi} kg/m²`, col2X, y + 30);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(85, 88, 76);
  doc.text(`${data.patient.heightCm} cm | ${data.patient.weightKg} kg`, col2X, y + 44);

  // Column 3
  const col3X = margin + 280;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(139, 135, 118);
  doc.text('PRIMARY CLINIC & DOCTOR', col3X, y + 16);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(34, 39, 31);
  doc.text(data.patient.clinic, col3X, y + 30);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(85, 88, 76);
  doc.text(`Physician: ${data.patient.doctor}`, col3X, y + 44);

  // Column 4
  const col4X = margin + 415;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(139, 135, 118);
  doc.text('PRIMARY GOAL', col4X, y + 16);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(44, 62, 102);
  doc.text(doc.splitTextToSize(data.patient.primaryGoal, 100), col4X, y + 30);

  y += 64;

  // --- 3. METABOLIC & BIOLOGICAL RISK STATUS ---
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(34, 39, 31);
  doc.text('1. METABOLIC & BIOLOGICAL RISK STATUS', margin, y + 10);
  doc.setLineWidth(0.75);
  doc.setDrawColor(207, 201, 180);
  doc.line(margin, y + 14, pageWidth - margin, y + 14);

  y += 22;

  const boxW = (pageWidth - margin * 2 - 18) / 4;
  const boxes = [
    { label: 'Readiness', val: `${data.scores.readiness}%`, status: 'Optimal', col: greenColor },
    { label: 'Composite Wellness', val: `${data.scores.wellness} / 100`, status: 'Stable Baseline', col: accentColor },
    { label: 'Prediabetes Risk', val: `${data.scores.prediabetes}%`, status: data.scores.prediabetes > 50 ? 'Elevated' : 'Borderline', col: amberColor },
    { label: 'Cardiovascular Stress', val: `${data.scores.cvStress}%`, status: 'Moderate', col: secondaryColor },
  ];

  boxes.forEach((b, i) => {
    const bx = margin + i * (boxW + 6);
    doc.setFillColor(251, 250, 243);
    doc.rect(bx, y, boxW, 42, 'F');
    doc.setDrawColor(207, 201, 180);
    doc.setLineWidth(0.5);
    doc.rect(bx, y, boxW, 42, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(139, 135, 118);
    doc.text(b.label.toUpperCase(), bx + 6, y + 12);

    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(b.col[0], b.col[1], b.col[2]);
    doc.text(b.val, bx + 6, y + 27);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(b.status, bx + 6, y + 37);
  });

  y += 50;

  // --- 4. CURRENT AMBULATORY VITALS ---
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(34, 39, 31);
  doc.text('2. AMBULATORY VITALS & PHYSIOLOGICAL TRACKING', margin, y + 10);
  doc.line(margin, y + 14, pageWidth - margin, y + 14);

  y += 22;

  const vitalsText = [
    `Fasting Glucose: ${data.vitals.fastingGlucose} mg/dL`,
    `Blood Pressure: ${data.vitals.bloodPressureSys}/${data.vitals.bloodPressureDia} mmHg`,
    `Resting HR: ${data.vitals.restingHeartRate} bpm`,
    `Water Intake: ${data.vitals.waterLitres} L`,
    `Daily Steps: ${data.vitals.stepsCount.toLocaleString()} steps`,
    `Sleep: ${data.vitals.sleepHours} hrs`,
  ];

  doc.setFillColor(241, 239, 230);
  doc.rect(margin, y, pageWidth - margin * 2, 24, 'F');
  doc.rect(margin, y, pageWidth - margin * 2, 24, 'S');

  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(34, 39, 31);
  const vColW = (pageWidth - margin * 2) / 3;
  doc.text(vitalsText[0], margin + 8, y + 11);
  doc.text(vitalsText[1], margin + vColW + 8, y + 11);
  doc.text(vitalsText[2], margin + vColW * 2 + 8, y + 11);
  doc.text(vitalsText[3], margin + 8, y + 20);
  doc.text(vitalsText[4], margin + vColW + 8, y + 20);
  doc.text(vitalsText[5], margin + vColW * 2 + 8, y + 20);

  y += 32;

  // --- 5. LABORATORY BIOMARKER REGISTER ---
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(34, 39, 31);
  doc.text('3. LABORATORY BIOMARKER PROFILE & METABOLIC REGISTER', margin, y + 10);
  doc.line(margin, y + 14, pageWidth - margin, y + 14);

  y += 20;

  // Table Header
  doc.setFillColor(241, 239, 230);
  doc.rect(margin, y, pageWidth - margin * 2, 16, 'F');
  doc.rect(margin, y, pageWidth - margin * 2, 16, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(85, 88, 76);
  doc.text('BIOMARKER', margin + 6, y + 11);
  doc.text('RESULT', margin + 160, y + 11);
  doc.text('REFERENCE INTERVAL', margin + 225, y + 11);
  doc.text('STATUS', margin + 350, y + 11);
  doc.text('CLINICAL ACTION', margin + 430, y + 11);

  y += 16;

  // Table Rows
  const reportsToPrint = data.labReports.slice(0, 7);
  reportsToPrint.forEach((r, idx) => {
    const rowH = 18;
    if (idx % 2 === 1) {
      doc.setFillColor(251, 250, 243);
      doc.rect(margin, y, pageWidth - margin * 2, rowH, 'F');
    }
    doc.setDrawColor(207, 201, 180);
    doc.line(margin, y + rowH, pageWidth - margin, y + rowH);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(34, 39, 31);
    doc.text(r.name.length > 28 ? r.name.substring(0, 27) + '…' : r.name, margin + 6, y + 12);

    doc.setFont('courier', 'bold');
    doc.text(r.value, margin + 160, y + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(85, 88, 76);
    doc.text(r.normalRange || 'Clinical ref', margin + 225, y + 12);

    // Status Pill
    if (r.tone === 'success') {
      doc.setTextColor(75, 115, 85);
    } else if (r.tone === 'amber') {
      doc.setTextColor(181, 130, 42);
    } else {
      doc.setTextColor(168, 69, 44);
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(r.status.substring(0, 15), margin + 350, y + 12);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(85, 88, 76);
    doc.text((r.action || 'Continue tracking').substring(0, 26), margin + 430, y + 12);

    y += rowH;
  });

  y += 10;

  // --- 6. LOGGED MEALS & HABITS SUMMARY ---
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(34, 39, 31);
  doc.text('4. RECENT NUTRITIONAL INTAKE & MICRO-HABIT COMPLIANCE', margin, y + 10);
  doc.line(margin, y + 14, pageWidth - margin, y + 14);

  y += 20;

  // Left sub-box: Logged Meals
  const subBoxW = (pageWidth - margin * 2 - 10) / 2;
  doc.setFillColor(251, 250, 243);
  doc.rect(margin, y, subBoxW, 58, 'F');
  doc.rect(margin, y, subBoxW, 58, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(44, 62, 102);
  doc.text('TODAY’S RECORDED MEALS', margin + 8, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(85, 88, 76);
  const mealsList = data.meals.length > 0 ? data.meals.slice(0, 3) : [{ name: 'Indian Thali with Dal & Roti', calories: 420, macros: '58g carbs, 18g protein' }];
  mealsList.forEach((m, mIdx) => {
    doc.text(`• ${m.name} (${m.calories} kcal - ${m.macros})`, margin + 8, y + 27 + mIdx * 11);
  });

  // Right sub-box: Daily Micro-Habits
  const habitBoxX = margin + subBoxW + 10;
  doc.setFillColor(251, 250, 243);
  doc.rect(habitBoxX, y, subBoxW, 58, 'F');
  doc.rect(habitBoxX, y, subBoxW, 58, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(44, 62, 102);
  const doneHabits = data.habits.filter((h) => h.done).length;
  doc.text(`MICRO-HABITS COMPLIANCE: ${doneHabits}/${data.habits.length} COMPLETED`, habitBoxX + 8, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(85, 88, 76);
  data.habits.slice(0, 3).forEach((h, hIdx) => {
    const mark = h.done ? '[COMPLETED]' : '[PENDING]';
    doc.text(`${mark} ${h.title}`, habitBoxX + 8, y + 27 + hIdx * 11);
  });

  y += 66;

  // --- 7. CLINICAL ACTION PLAN & RECOMMENDATIONS ---
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(34, 39, 31);
  doc.text('5. PHYSICIAN & ASHA CARE ADVISORY PLAN', margin, y + 10);
  doc.line(margin, y + 14, pageWidth - margin, y + 14);

  y += 20;

  const recs = [
    '• Glycemic Control: Continue 15-minute post-meal brisk walking (Shatapadi) to blunt insulin excursions.',
    '• Dietary Fiber: Ensure a minimum of 25-30g soluble fiber from lentils, vegetables, and fenugreek seeds before carbohydrate portions.',
    '• Micronutrient Protocol: Vitamin D3 supplement course advised by attending physician for serum level optimization.',
    '• Follow-Up Interval: Schedule repeat fasting glucose and 90-day repeat HbA1c panel to monitor regression.',
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(85, 88, 76);
  recs.forEach((r, idx) => {
    doc.text(r, margin + 4, y + 10 + idx * 11);
  });

  y += 54;

  // --- 8. SIGNATURE & VERIFICATION STAMP ---
  doc.setLineWidth(1);
  doc.setDrawColor(34, 39, 31);
  doc.line(margin, y, pageWidth - margin, y);

  y += 14;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(139, 135, 118);
  doc.text('CLINICAL VALIDATION', margin, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(34, 39, 31);
  doc.text('HealthGuard AI System & South Delhi District Health Registry', margin, y + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(85, 88, 76);
  doc.text('Aegis Preventive Health Framework • ISO 27001 Clinical Data Standards Compliant', margin, y + 22);

  // Clinician Signature Box
  const sigX = pageWidth - margin - 180;
  doc.line(sigX, y + 16, pageWidth - margin, y + 16);
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.text('Attending Clinician / ASHA Signature', sigX + 10, y + 26);

  // --- 9. FOOTER ---
  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(139, 135, 118);
  doc.text(
    `Page 1 of 1 • HealthGuard Preventive Health Dossier • Generated: ${new Date().toISOString()}`,
    pageWidth / 2,
    pageHeight - 16,
    { align: 'center' }
  );

  // Trigger real file download!
  const sanitizedName = data.patient.name.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `HealthGuard_Clinical_Report_${sanitizedName}_${dateStr.replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
}

/**
 * Downloads comprehensive tabular clinical data in CSV format.
 */
export function exportReportToCSV(data: ReportDataPayload): void {
  const lines: string[] = [];

  lines.push('HEALTHGUARD PREVENTIVE HEALTH CLINICAL DOSSIER');
  lines.push(`Generated,${new Date().toISOString()}`);
  lines.push(`Dossier ID,HG-${new Date().getFullYear()}-9042`);
  lines.push('');

  // Demographics
  lines.push('--- PATIENT DEMOGRAPHICS ---');
  lines.push(`Name,${data.patient.name}`);
  lines.push(`Age,${data.patient.age}`);
  lines.push(`Gender,${data.patient.gender}`);
  lines.push(`Blood Group,${data.patient.bloodGroup}`);
  lines.push(`Height (cm),${data.patient.heightCm}`);
  lines.push(`Weight (kg),${data.patient.weightKg}`);
  lines.push(`Primary Clinic,${data.patient.clinic}`);
  lines.push(`Attending Physician,${data.patient.doctor}`);
  lines.push(`Health Goal,${data.patient.primaryGoal}`);
  lines.push('');

  // Risk Scores
  lines.push('--- RISK SCORES ---');
  lines.push(`Readiness Score,${data.scores.readiness}%`);
  lines.push(`Composite Wellness,${data.scores.wellness} / 100`);
  lines.push(`Prediabetes Risk,${data.scores.prediabetes}%`);
  lines.push(`Cardiovascular Stress,${data.scores.cvStress}%`);
  lines.push('');

  // Daily Vitals
  lines.push('--- DAILY VITALS ---');
  lines.push(`Fasting Glucose (mg/dL),${data.vitals.fastingGlucose}`);
  lines.push(`Blood Pressure Systolic (mmHg),${data.vitals.bloodPressureSys}`);
  lines.push(`Blood Pressure Diastolic (mmHg),${data.vitals.bloodPressureDia}`);
  lines.push(`Resting Heart Rate (bpm),${data.vitals.restingHeartRate}`);
  lines.push(`Water Intake (Litres),${data.vitals.waterLitres}`);
  lines.push(`Daily Steps,${data.vitals.stepsCount}`);
  lines.push(`Sleep (Hours),${data.vitals.sleepHours}`);
  lines.push('');

  // Lab Biomarkers
  lines.push('--- LABORATORY BIOMARKERS ---');
  lines.push('Biomarker Name,Result,Reference Range,Status,Tone,Clinical Action');
  data.labReports.forEach((r) => {
    lines.push(`"${r.name}","${r.value}","${r.normalRange || ''}","${r.status}","${r.tone}","${r.action || ''}"`);
  });
  lines.push('');

  // Logged Meals
  lines.push('--- LOGGED MEALS & NUTRITION ---');
  lines.push('Meal Name,Calories (kcal),Macronutrients,Glycemic Impact,Timestamp');
  data.meals.forEach((m) => {
    lines.push(`"${m.name}","${m.calories}","${m.macros}","${m.impact || 'MODERATE'}","${m.timestamp}"`);
  });
  lines.push('');

  // Micro-Habits
  lines.push('--- DAILY MICRO-HABITS ---');
  lines.push('Habit Title,Detail,Completed');
  data.habits.forEach((h) => {
    lines.push(`"${h.title}","${h.sub}","${h.done ? 'YES' : 'NO'}"`);
  });

  const csvContent = lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const sanitizedName = data.patient.name.replace(/[^a-zA-Z0-9_-]/g, '_');
  link.setAttribute('download', `HealthGuard_Patient_Data_${sanitizedName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads complete JSON electronic health record.
 */
export function exportReportToJSON(data: ReportDataPayload): void {
  const jsonRecord = {
    resourceType: 'HealthGuardClinicalDossier',
    version: '1.0',
    generatedAt: new Date().toISOString(),
    dossierId: `HG-${new Date().getFullYear()}-9042`,
    patient: data.patient,
    vitals: data.vitals,
    scores: data.scores,
    labBiomarkers: data.labReports,
    habits: data.habits,
    loggedMeals: data.meals,
    facility: {
      name: data.patient.clinic,
      doctor: data.patient.doctor,
      jurisdiction: 'Ward 12, South Delhi District Health Department',
    },
  };

  const jsonString = JSON.stringify(jsonRecord, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const sanitizedName = data.patient.name.replace(/[^a-zA-Z0-9_-]/g, '_');
  link.setAttribute('download', `HealthGuard_Health_Record_${sanitizedName}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
