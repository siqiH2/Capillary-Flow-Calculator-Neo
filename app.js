"use strict";

const PI = 3.14159265359;

const ELEMENT_MASS = {
  H: 1.0078246,
  C: 12.0,
  N: 14.003074,
  O: 15.994915,
  P: 30.973763,
  S: 31.972072
};

const RESIDUES_3_TO_1 = {
  Ala: "A", Arg: "R", Asn: "N", Asp: "D", Cys: "C", Gla: "U",
  Gln: "Q", Glu: "E", Gly: "G", His: "H", Ile: "I", Leu: "L",
  Lys: "K", Met: "M", Phe: "F", Pro: "P", Ser: "S", Thr: "T",
  Trp: "W", Tyr: "Y", Val: "V", Xxx: "X"
};

const RESIDUE_FORMULAS = {
  A: "C3H5NO", R: "C6H12N4O", N: "C4H6N2O2", D: "C4H5NO3",
  C: "C3H5NOS", U: "C6H7NO5", Q: "C5H8N2O2", E: "C5H7NO3",
  G: "C2H3NO", H: "C6H7N3O", I: "C6H11NO", L: "C6H11NO",
  K: "C6H12N2O", M: "C5H9NOS", F: "C9H9NO", P: "C5H7NO",
  S: "C3H5NO2", T: "C4H7NO2", W: "C11H10N2O", Y: "C9H9NO2",
  V: "C5H9NO", X: "C6H12N2O"
};

const N_TERMINI = {
  "Hydrogen (H)": "H",
  "Hydrogen + proton (HH)": "HH",
  "Acetyl (C2OH3)": "C2OH3",
  "PyroGlu (C5O2NH6)": "C5O2NH6",
  "Carbamyl (CONH2)": "CONH2",
  "PTC (C7H6NS)": "C7H6NS",
  None: ""
};

const C_TERMINI = {
  "Hydroxyl (OH)": "OH",
  "Amide (NH2)": "NH2",
  None: ""
};

const HYDROPATHY_INDEX = {
  A: 1.8, C: 2.5, D: -3.5, E: -3.5, F: 2.8, G: -0.4, H: -3.2,
  I: 4.5, K: -3.9, L: 3.8, M: 1.9, N: -3.5, P: -1.6, Q: -3.5,
  R: -4.5, S: -0.8, T: -0.7, V: 4.2, W: -0.9, Y: -1.3
};

const PRESSURE_FACTORS = {
  psi: 68947.57,
  Pascals: 10.0,
  kiloPascals: 10000.0,
  Atmospheres: 1013250.0,
  Bar: 1000000.0,
  "Torr (mm Hg)": 1333.22,
  "dynes/cm^2": 1.0
};

const LENGTH_FACTORS = {
  m: 100.0,
  cm: 1.0,
  mm: 0.1,
  um: 0.0001,
  inches: 2.54
};

const VISCOSITY_FACTORS = {
  "Poise [g/(cm-sec)]": 1.0,
  centiPoise: 0.01
};

const FLOW_FACTORS = {
  "mL/min": 1.0,
  "uL/min": 0.001,
  "nL/min": 0.000001
};

const LINEAR_VELOCITY_FACTORS = {
  "cm/hr": 1 / 60.0,
  "mm/hr": 1 / 600.0,
  "cm/min": 1.0,
  "mm/min": 0.1,
  "cm/sec": 60.0,
  "mm/sec": 6.0
};

const TIME_FACTORS = {
  hours: 60.0,
  minutes: 1.0,
  seconds: 1 / 60.0
};

const VOLUME_FACTORS = {
  mL: 1.0,
  uL: 0.001,
  nL: 0.000001,
  pL: 0.000000001
};

const CONCENTRATION_FACTORS = {
  M: 1.0,
  mM: 1e-3,
  uM: 1e-6,
  nM: 1e-9,
  pM: 1e-12,
  fM: 1e-15,
  aM: 1e-18
};

const MASS_FLOW_FACTORS = {
  "pmol/min": 1e-12,
  "fmol/min": 1e-15,
  "amol/min": 1e-18,
  "pmol/sec": 60e-12,
  "fmol/sec": 60e-15,
  "amol/sec": 60e-18,
  "moles/min": 1.0
};

const MOLES_FACTORS = {
  moles: 1.0,
  mmoles: 1e-3,
  umoles: 1e-6,
  nmoles: 1e-9,
  pmoles: 1e-12,
  fmoles: 1e-15,
  amoles: 1e-18
};

const COLUMN_PRESETS = {
  "Separation Column": {
    computeType: "Find Back Pressure",
    length: "15",
    id: "75",
    mecn: "1",
    temp: "20",
    particle: "1.7",
    porosity: "0.42",
    flow: "200"
  },
  "Trap Column": {
    computeType: "Find Back Pressure",
    length: "5",
    id: "150",
    mecn: "0",
    temp: "20",
    particle: "5",
    porosity: "0.43",
    flow: "1000"
  }
};

const SYSTEM_DEFAULTS = [
  ["LC Outlet Tubing", "Open tubular", "50", "20", "", ""],
  ["Trap Column", "Packed", "5", "150", "5", "0.43"],
  ["Transfer Line", "Open tubular", "50", "20", "", ""],
  ["LC Column", "Packed", "15", "75", "1.7", "0.42"]
];

const GRADIENT_DEFAULTS = [
  [0, 1],
  [5, 1],
  [7, 5],
  [17, 25],
  [19, 45],
  [21, 80],
  [25, 80],
  [26, 1],
  [30, 1]
];

const MODIFICATION_MASSES = {
  "*": formulaMass("HPO3"),
  "+": 14.01565,
  "@": 15.99492,
  "!": 57.02146,
  "&": 58.00548,
  "#": 71.03711,
  "$": 227.127,
  "%": 236.127,
  "~": 442.225,
  "`": 450.274
};

const RESIDUE_MASSES = Object.fromEntries(
  Object.entries(RESIDUE_FORMULAS).map(([symbol, formula]) => [symbol, formulaMass(formula)])
);

let updatingCapillary = false;
let gradientChartState = null;

function byId(id) {
  return document.getElementById(id);
}

function populateSelect(id, values, selected) {
  const select = byId(id);
  select.innerHTML = "";
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    if (value === selected) option.selected = true;
    select.appendChild(option);
  });
}

function numberFromInput(id, fallback = 0) {
  const value = parseFloat(byId(id).value);
  return Number.isFinite(value) ? value : fallback;
}

function numberFromElement(element, fallback = 0) {
  const value = parseFloat(element.value);
  return Number.isFinite(value) ? value : fallback;
}

function displayValue(value) {
  if (!Number.isFinite(value)) return "--";
  if (Object.is(value, -0)) return "0";
  return Number(value).toPrecision(7).replace(/\.?0+($|e)/, "$1");
}

function formatFixed(value, digits) {
  return Number.isFinite(value) ? value.toFixed(digits) : "--";
}

function toBase(value, units, factors) {
  return value * factors[units];
}

function fromBase(value, units, factors) {
  return value / factors[units];
}

function psiToDynCm2(value) {
  return value * 68947.57;
}

function umToCm(value) {
  return value / 10000.0;
}

function nlMinToMlMin(value) {
  return value / 1000000.0;
}

function isOpenTubular(type) {
  return type.toLowerCase().startsWith("open");
}

function formulaMass(formula) {
  if (!formula) return 0.0;
  const re = /([A-Z][a-z]?)(\d*(?:\.\d+)?)/g;
  let index = 0;
  let total = 0.0;
  let match;
  while ((match = re.exec(formula)) !== null) {
    if (match.index !== index) {
      throw new Error(`Unsupported formula syntax near ${formula.slice(index)}`);
    }
    const symbol = match[1];
    if (!(symbol in ELEMENT_MASS)) {
      throw new Error(`Unsupported element ${symbol}`);
    }
    const count = match[2] ? parseFloat(match[2]) : 1.0;
    total += ELEMENT_MASS[symbol] * count;
    index = re.lastIndex;
  }
  if (index !== formula.length) {
    throw new Error(`Unsupported formula syntax near ${formula.slice(index)}`);
  }
  return total;
}

function parseOneLetter(sequence, stripFlanking) {
  let text = sequence.trim();
  if (stripFlanking && text.includes(".")) {
    const parts = text.split(".");
    if (parts.length >= 3) {
      text = parts.slice(1, -1).join(".");
    } else if (parts.length === 2) {
      text = parts[0].length <= 1 ? parts[1] : parts[0];
    }
  }

  const tokens = [];
  let current = null;
  for (const char of text) {
    const upper = char.toUpperCase();
    if (upper in RESIDUE_FORMULAS) {
      current = { symbol: upper, mods: [] };
      tokens.push(current);
    } else if (char in MODIFICATION_MASSES && current) {
      current.mods.push(char);
    }
  }
  return tokens;
}

function titleTriplet(text) {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

function parseThreeLetter(sequence) {
  let text = sequence.trim();
  if (text.toUpperCase().startsWith("H") && !(titleTriplet(text.slice(0, 3)) in RESIDUES_3_TO_1)) {
    text = text.slice(1);
  }
  if (text.toUpperCase().endsWith("OH")) {
    text = text.slice(0, -2);
  }

  const tokens = [];
  let index = 0;
  while (index <= text.length - 3) {
    if (!/[A-Za-z]/.test(text[index])) {
      index += 1;
      continue;
    }
    const triplet = titleTriplet(text.slice(index, index + 3));
    const symbol = RESIDUES_3_TO_1[triplet] || "X";
    index += 3;
    const mods = [];
    while (index < text.length && text[index] in MODIFICATION_MASSES) {
      mods.push(text[index]);
      index += 1;
    }
    tokens.push({ symbol, mods });
  }
  return tokens;
}

function calculateGravy(peptide) {
  if (!peptide) return null;
  let total = 0;
  for (const aa of peptide) {
    if (aa in HYDROPATHY_INDEX) total += HYDROPATHY_INDEX[aa];
  }
  return total / peptide.length;
}

function computePeptide() {
  const mode = byId("notation").value;
  const tokens = mode === "3-letter"
    ? parseThreeLetter(byId("sequence").value)
    : parseOneLetter(byId("sequence").value, byId("stripFlanking").checked);

  const residues = [];
  let total = formulaMass(N_TERMINI[byId("nTerm").value]) + formulaMass(C_TERMINI[byId("cTerm").value]);
  tokens.forEach(({ symbol, mods }) => {
    const baseMass = RESIDUE_MASSES[symbol] || RESIDUE_MASSES.X;
    const modMass = mods.reduce((sum, mod) => sum + MODIFICATION_MASSES[mod], 0);
    const mass = baseMass + modMass;
    total += mass;
    residues.push({ symbol, mods, mass });
  });

  if (residues.length === 0) total = 0.0;
  const peptide = residues.map((residue) => residue.symbol).join("");
  return {
    cleanedSequence: residues.map((residue) => residue.symbol + residue.mods.join("")).join(""),
    residueCount: residues.length,
    mass: total,
    gravyScore: calculateGravy(peptide),
    residues
  };
}

function renderPeptide() {
  try {
    const result = computePeptide();
    const digits = parseInt(byId("peptideDigits").value, 10);
    const proton = ELEMENT_MASS.H - 0.000548579909;
    byId("mwOut").textContent = `MW = ${formatFixed(result.mass, digits)}`;
    byId("mhOut").textContent = `[M+H]1+ = ${formatFixed(result.mass + proton, digits)}`;
    byId("gravyOut").textContent = result.gravyScore === null ? "GRAVY =" : `GRAVY = ${result.gravyScore.toFixed(4)}`;
    byId("peptideStatus").textContent = `Residues: ${result.residueCount}; sequence: ${result.cleanedSequence || "--"}`;

    const rows = byId("residueRows");
    rows.innerHTML = "";
    result.residues.forEach((residue, index) => {
      const row = document.createElement("tr");
      [index + 1, residue.symbol, residue.mods.join(""), formatFixed(residue.mass, digits)].forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.appendChild(cell);
      });
      rows.appendChild(row);
    });
  } catch (error) {
    byId("peptideStatus").textContent = `Error: ${error.message}`;
  }
}

function capillaryInputs() {
  const pressureDyn = toBase(numberFromInput("pressure"), byId("pressureUnit").value, PRESSURE_FACTORS);
  const pressurePsi = fromBase(pressureDyn, "psi", PRESSURE_FACTORS);
  const idCm = toBase(numberFromInput("innerDiameter"), byId("idUnit").value, LENGTH_FACTORS);
  const particleCm = toBase(numberFromInput("particle"), byId("particleUnit").value, LENGTH_FACTORS);
  const concentrationM = toBase(numberFromInput("concentration"), byId("concentrationUnit").value, CONCENTRATION_FACTORS);
  return {
    capillaryType: byId("capType").value,
    pressurePsi,
    lengthCm: toBase(numberFromInput("length"), byId("lengthUnit").value, LENGTH_FACTORS),
    innerDiameterUm: fromBase(idCm, "um", LENGTH_FACTORS),
    viscosityPoise: toBase(numberFromInput("viscosity"), byId("viscosityUnit").value, VISCOSITY_FACTORS),
    particleDiameterUm: fromBase(particleCm, "um", LENGTH_FACTORS),
    porosity: numberFromInput("porosity"),
    concentrationUm: fromBase(concentrationM, "uM", CONCENTRATION_FACTORS),
    injectionTimeMin: toBase(numberFromInput("injectionTime"), byId("injectionUnit").value, TIME_FACTORS)
  };
}

function buildResults(inputs, flowMlMin, pressureDyn) {
  const radius = umToCm(inputs.innerDiameterUm) / 2.0;
  let linearVelocityCmMin = 0.0;
  if (radius > 0) {
    linearVelocityCmMin = flowMlMin / (PI * radius ** 2);
    if (!isOpenTubular(inputs.capillaryType) && inputs.porosity) {
      linearVelocityCmMin /= inputs.porosity;
    }
  }

  const deadTimeMin = linearVelocityCmMin ? inputs.lengthCm / linearVelocityCmMin : 0.0;
  let columnVolumeMl = inputs.lengthCm * PI * radius ** 2;
  if (!isOpenTubular(inputs.capillaryType)) {
    columnVolumeMl *= inputs.porosity;
  }

  const concentrationM = inputs.concentrationUm / 1000000.0;
  const massFlowMolMin = concentrationM * flowMlMin / 1000.0;
  const molesInjectedMol = massFlowMolMin * inputs.injectionTimeMin;

  return {
    flowMlMin,
    pressureDynCm2: pressureDyn,
    lengthCm: inputs.lengthCm,
    innerDiameterCm: umToCm(inputs.innerDiameterUm),
    linearVelocityCmMin,
    deadTimeMin,
    columnVolumeMl,
    massFlowMolMin,
    molesInjectedMol
  };
}

function backPressure(inputs, flowMlMin) {
  const length = inputs.lengthCm;
  const radius = umToCm(inputs.innerDiameterUm) / 2.0;
  const viscosity = inputs.viscosityPoise;
  const particle = umToCm(inputs.particleDiameterUm);
  const porosity = inputs.porosity;

  if (radius <= 0) return 0.0;
  if (isOpenTubular(inputs.capillaryType)) {
    return (flowMlMin * 8 * viscosity * length) / (radius ** 4 * PI * 60);
  }
  if (particle <= 0 || porosity <= 0) return 0.0;
  return (
    flowMlMin * 180 * viscosity * length * (1 - porosity) ** 2
    / (particle ** 2 * porosity ** 2 * PI * radius ** 2 * 60)
    / porosity
  );
}

function computeFromPressure(inputs) {
  const pressure = psiToDynCm2(inputs.pressurePsi);
  const length = inputs.lengthCm;
  const radius = umToCm(inputs.innerDiameterUm) / 2.0;
  const viscosity = inputs.viscosityPoise;
  const particle = umToCm(inputs.particleDiameterUm);
  const porosity = inputs.porosity;
  let flowMlMin = 0.0;

  if (radius <= 0 || viscosity <= 0 || length <= 0) {
    flowMlMin = 0.0;
  } else if (isOpenTubular(inputs.capillaryType)) {
    flowMlMin = ((pressure * radius ** 4 * PI) / (8 * viscosity * length)) * 60.0;
  } else if (particle > 0 && porosity > 0 && porosity < 1) {
    flowMlMin = (
      pressure * particle ** 2 * porosity ** 2 * PI * radius ** 2 * porosity
      / (180 * viscosity * length * (1 - porosity) ** 2)
    ) * 60.0;
  }

  return buildResults(inputs, flowMlMin, pressure);
}

function computeFromFlow(inputs, flowNlMin) {
  const flowMlMin = nlMinToMlMin(flowNlMin);
  return buildResults(inputs, flowMlMin, backPressure(inputs, flowMlMin));
}

function computeColumnLength(inputs, flowNlMin) {
  const pressure = psiToDynCm2(inputs.pressurePsi);
  const flowMlMin = nlMinToMlMin(flowNlMin);
  const radius = umToCm(inputs.innerDiameterUm) / 2.0;
  const viscosity = inputs.viscosityPoise;
  const particle = umToCm(inputs.particleDiameterUm);
  const porosity = inputs.porosity;
  let length = 0.0;

  if (viscosity <= 0 || flowMlMin <= 0) {
    length = 0.0;
  } else if (isOpenTubular(inputs.capillaryType)) {
    length = (pressure * radius ** 4 * PI * 60) / (8 * viscosity * flowMlMin);
  } else if (porosity !== 1) {
    length = (
      pressure * particle ** 2 * porosity ** 2 * PI * radius ** 2 * 60 * porosity
      / (180 * viscosity * flowMlMin * (1 - porosity) ** 2)
    );
  }

  return buildResults({ ...inputs, lengthCm: length }, flowMlMin, pressure);
}

function computeInnerDiameter(inputs, flowNlMin) {
  const pressure = psiToDynCm2(inputs.pressurePsi);
  const flowMlMin = nlMinToMlMin(flowNlMin);
  const viscosity = inputs.viscosityPoise;
  const length = inputs.lengthCm;
  const particle = umToCm(inputs.particleDiameterUm);
  const porosity = inputs.porosity;
  let radius = 0.0;

  if (pressure <= 0) {
    radius = 0.0;
  } else if (isOpenTubular(inputs.capillaryType)) {
    radius = ((flowMlMin * 8 * viscosity * length) / (pressure * PI * 60)) ** 0.25;
  } else if (particle > 0 && porosity !== 0 && porosity !== 1) {
    radius = (
      flowMlMin * 180 * viscosity * length * (1 - porosity) ** 2
      / (pressure * particle ** 2 * porosity ** 2 * PI * 60)
      / porosity
    ) ** 0.5;
  }

  return buildResults({ ...inputs, innerDiameterUm: radius * 2.0 * 10000.0 }, flowMlMin, pressure);
}

function computeFlowUsingDeadTime(inputs, deadTimeMin) {
  const radius = umToCm(inputs.innerDiameterUm) / 2.0;
  let flowMlMin = 0.0;
  if (deadTimeMin > 0) {
    flowMlMin = inputs.lengthCm * (PI * radius ** 2) / deadTimeMin;
    if (!isOpenTubular(inputs.capillaryType)) {
      flowMlMin *= inputs.porosity;
    }
  }
  return buildResults(inputs, flowMlMin, backPressure(inputs, flowMlMin));
}

function computeSystemPressure(segments, flowNlMin, viscosityPoise, concentrationUm, injectionTimeMin) {
  const results = [];
  let totalPressure = 0.0;
  let totalDeadTime = 0.0;
  let totalDeadVolume = 0.0;

  segments.forEach((segment) => {
    const result = computeFromFlow({
      capillaryType: segment.capillaryType,
      pressurePsi: 0,
      lengthCm: segment.lengthCm,
      innerDiameterUm: segment.innerDiameterUm,
      viscosityPoise,
      particleDiameterUm: segment.particleDiameterUm,
      porosity: segment.porosity,
      concentrationUm,
      injectionTimeMin
    }, flowNlMin);
    results.push({ segment, result });
    totalPressure += result.pressureDynCm2;
    totalDeadTime += result.deadTimeMin;
    totalDeadVolume += result.columnVolumeMl;
  });

  return { segments: results, totalPressure, totalDeadTime, totalDeadVolume };
}

function computeMecnViscosityCp(percentAcetonitrile, temperatureC) {
  const phi = Math.min(Math.max(percentAcetonitrile / 100.0, 0.0), 1.0);
  const kelvin = temperatureC + 273.0;
  if (kelvin <= 0) return 0.0;
  return Math.exp(
    phi * (-3.476 + 726 / kelvin)
    + (1 - phi) * (-5.414 + 1566 / kelvin)
    + phi * (1 - phi) * (-1.762 + 929 / kelvin)
  );
}

function drawViscosityChart() {
  const canvas = byId("viscosityChart");
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  const cssWidth = Math.max(320, Math.round(rect.width || 720));
  const cssHeight = Math.max(190, Math.round(rect.height || 210));
  canvas.width = Math.round(cssWidth * scale);
  canvas.height = Math.round(cssHeight * scale);

  const ctx = canvas.getContext("2d");
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const temperature = numberFromInput("temperature", 20);
  const points = [];
  for (let percent = 0; percent <= 100; percent += 1) {
    points.push({ x: percent, y: computeMecnViscosityCp(percent, temperature) });
  }

  const yValues = points.map((point) => point.y);
  const yMinRaw = Math.min(...yValues);
  const yMaxRaw = Math.max(...yValues);
  const yPadding = Math.max((yMaxRaw - yMinRaw) * 0.12, 0.02);
  const yMin = Math.max(0, yMinRaw - yPadding);
  const yMax = yMaxRaw + yPadding;
  const margin = { top: 18, right: 16, bottom: 34, left: 34 };
  const plotWidth = cssWidth - margin.left - margin.right;
  const plotHeight = cssHeight - margin.top - margin.bottom;
  const xToPx = (value) => margin.left + (value / 100) * plotWidth;
  const yToPx = (value) => margin.top + (1 - (value - yMin) / (yMax - yMin || 1)) * plotHeight;

  ctx.lineWidth = 1;
  ctx.strokeStyle = "#d6dee5";
  ctx.beginPath();
  ctx.moveTo(margin.left, margin.top);
  ctx.lineTo(margin.left, margin.top + plotHeight);
  ctx.lineTo(margin.left + plotWidth, margin.top + plotHeight);
  ctx.stroke();

  ctx.strokeStyle = "#9aabb8";
  ctx.fillStyle = "#516273";
  ctx.font = "11px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  for (let percent = 0; percent <= 100; percent += 5) {
    const x = xToPx(percent);
    const tick = percent % 20 === 0 ? 7 : 4;
    ctx.beginPath();
    ctx.moveTo(x, margin.top + plotHeight);
    ctx.lineTo(x, margin.top + plotHeight + tick);
    ctx.stroke();
    if (percent % 20 === 0) {
      ctx.fillText(String(percent), x, margin.top + plotHeight + 11);
    }
  }

  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (let index = 0; index <= 5; index += 1) {
    const y = margin.top + (index / 5) * plotHeight;
    ctx.beginPath();
    ctx.moveTo(margin.left - 6, y);
    ctx.lineTo(margin.left, y);
    ctx.stroke();
  }

  ctx.strokeStyle = "#c9252d";
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  points.forEach((point, index) => {
    const x = xToPx(point.x);
    const y = yToPx(point.y);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  const currentPercent = Math.min(Math.max(numberFromInput("mecn", 0), 0), 100);
  const currentViscosity = computeMecnViscosityCp(currentPercent, temperature);
  const currentX = xToPx(currentPercent);
  const currentY = yToPx(currentViscosity);
  ctx.fillStyle = "#c9252d";
  ctx.beginPath();
  ctx.arc(currentX, currentY, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#516273";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.font = "12px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
  ctx.fillText("MeCN %", margin.left + plotWidth / 2, cssHeight - 16);
}

function renderGradientRows() {
  const tbody = byId("gradientRows");
  tbody.innerHTML = "";
  GRADIENT_DEFAULTS.forEach(([time, percent], index) => addGradientRow(time, percent, index === 0));
}

function addGradientRow(time = null, percent = null, locked = false) {
  const tbody = byId("gradientRows");
  const rowCount = tbody.children.length;
  const previousRow = tbody.lastElementChild;
  const previousTime = previousRow ? numberFromElement(previousRow.querySelector("[data-field='time']")) : 0;
  const previousPercent = previousRow ? numberFromElement(previousRow.querySelector("[data-field='percent']")) : numberFromInput("mecn", 5);
  const row = document.createElement("tr");
  const timeValue = time ?? (rowCount === 0 ? 0 : previousTime + 1);
  const percentValue = percent ?? previousPercent;

  [
    ["time", timeValue, locked],
    ["percent", percentValue, false]
  ].forEach(([field, value, disabled]) => {
    const cell = document.createElement("td");
    const input = document.createElement("input");
    input.type = "number";
    input.step = field === "time" ? "0.1" : "1";
    input.min = field === "percent" ? "0" : "0";
    input.max = field === "percent" ? "100" : "";
    input.value = String(value);
    input.disabled = Boolean(disabled);
    input.dataset.field = field;
    input.addEventListener("input", drawGradientPressureChart);
    input.addEventListener("change", drawGradientPressureChart);
    cell.appendChild(input);
    row.appendChild(cell);
  });

  tbody.appendChild(row);
}

function removeGradientRow() {
  const tbody = byId("gradientRows");
  if (tbody.children.length <= 1) return;
  tbody.lastElementChild.remove();
  drawGradientPressureChart();
}

function gradientProfile() {
  const rows = [...byId("gradientRows").querySelectorAll("tr")];
  const profile = rows.map((row, index) => {
    const timeInput = row.querySelector("[data-field='time']");
    const percentInput = row.querySelector("[data-field='percent']");
    return {
      time: index === 0 ? 0 : numberFromElement(timeInput, index),
      percent: Math.min(Math.max(numberFromElement(percentInput, 0), 0), 100)
    };
  });

  for (let index = 1; index < profile.length; index += 1) {
    if (profile[index].time <= profile[index - 1].time) {
      profile[index].time = profile[index - 1].time + 0.01;
    }
  }
  return profile.length ? profile : [{ time: 0, percent: 0 }];
}

function interpolateGradientPercent(profile, time) {
  if (time <= profile[0].time) return profile[0].percent;
  for (let index = 1; index < profile.length; index += 1) {
    const previous = profile[index - 1];
    const next = profile[index];
    if (time <= next.time) {
      const span = next.time - previous.time || 1;
      const fraction = (time - previous.time) / span;
      return previous.percent + (next.percent - previous.percent) * fraction;
    }
  }
  return profile[profile.length - 1].percent;
}

function columnHoldUpVolumeMl(inputs) {
  const radius = umToCm(inputs.innerDiameterUm) / 2.0;
  let volume = inputs.lengthCm * PI * radius ** 2;
  if (!isOpenTubular(inputs.capillaryType)) {
    volume *= inputs.porosity;
  }
  return Math.max(volume, 0);
}

function pressureForViscositySegment(inputs, flowMlMin, segmentLengthCm, viscosityPoise) {
  const segmentInputs = {
    ...inputs,
    lengthCm: segmentLengthCm,
    viscosityPoise
  };
  return backPressure(segmentInputs, flowMlMin);
}

function gradientPressureAtTime(inputs, profile, time, flowMlMin, segmentCount, temperature, dwellTimeMin) {
  if (flowMlMin <= 0 || inputs.lengthCm <= 0 || segmentCount <= 0) return 0.0;

  const holdUpVolume = columnHoldUpVolumeMl(inputs);
  const segmentLength = inputs.lengthCm / segmentCount;
  const segmentHoldUpTime = holdUpVolume > 0 ? (holdUpVolume / flowMlMin) / segmentCount : 0;
  let totalPressure = 0.0;

  for (let segment = 0; segment < segmentCount; segment += 1) {
    const centerDelay = (segment + 0.5) * segmentHoldUpTime;
    const inletTimeForSegment = time - dwellTimeMin - centerDelay;
    const percent = interpolateGradientPercent(profile, inletTimeForSegment);
    const viscosityPoise = computeMecnViscosityCp(percent, temperature) * VISCOSITY_FACTORS.centiPoise;
    totalPressure += pressureForViscositySegment(inputs, flowMlMin, segmentLength, viscosityPoise);
  }

  return totalPressure;
}

function drawGradientPressureChart() {
  const canvas = byId("gradientPressureChart");
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  const cssWidth = Math.max(340, Math.round(rect.width || 720));
  const cssHeight = Math.max(210, Math.round(rect.height || 240));
  canvas.width = Math.round(cssWidth * scale);
  canvas.height = Math.round(cssHeight * scale);

  const ctx = canvas.getContext("2d");
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const profile = gradientProfile();
  const dwellTimeMin = Math.max(numberFromInput("dwellTime", 0), 0);
  const endTime = Math.max(profile[profile.length - 1].time + dwellTimeMin, 0.1);
  const pressureUnit = byId("pressureResultUnit").value;
  const inputs = capillaryInputs();
  const flowMlMin = toBase(numberFromInput("flow"), byId("flowUnit").value, FLOW_FACTORS);
  const temperature = numberFromInput("temperature", 20);
  const sampleCount = Math.max(160, Math.round(endTime * 14));
  const segmentCount = 240;
  const points = [];

  for (let index = 0; index <= sampleCount; index += 1) {
    const time = (index / sampleCount) * endTime;
    const pressureDyn = gradientPressureAtTime(inputs, profile, time, flowMlMin, segmentCount, temperature, dwellTimeMin);
    points.push({
      x: time,
      y: fromBase(pressureDyn, pressureUnit, PRESSURE_FACTORS)
    });
  }

  const yValues = points.map((point) => point.y);
  const yMaxRaw = Math.max(...yValues, 0);
  const yMin = 0;
  const yMax = Math.max(50, Math.ceil(yMaxRaw / 50) * 50);
  const margin = { top: 18, right: 18, bottom: 36, left: 62 };
  const plotWidth = cssWidth - margin.left - margin.right;
  const plotHeight = cssHeight - margin.top - margin.bottom;
  const xToPx = (value) => margin.left + (value / endTime) * plotWidth;
  const yToPx = (value) => margin.top + (1 - (value - yMin) / (yMax - yMin || 1)) * plotHeight;

  ctx.lineWidth = 1;
  ctx.strokeStyle = "#d6dee5";
  ctx.beginPath();
  ctx.moveTo(margin.left, margin.top);
  ctx.lineTo(margin.left, margin.top + plotHeight);
  ctx.lineTo(margin.left + plotWidth, margin.top + plotHeight);
  ctx.stroke();

  ctx.strokeStyle = "#9aabb8";
  ctx.fillStyle = "#516273";
  ctx.font = "11px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const xTickCount = Math.min(8, Math.max(2, Math.ceil(endTime)));
  for (let index = 0; index <= xTickCount; index += 1) {
    const value = (index / xTickCount) * endTime;
    const x = xToPx(value);
    ctx.beginPath();
    ctx.moveTo(x, margin.top + plotHeight);
    ctx.lineTo(x, margin.top + plotHeight + 6);
    ctx.stroke();
    ctx.fillText(displayValue(value), x, margin.top + plotHeight + 10);
  }

  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (let value = 0; value <= yMax; value += 50) {
    const y = yToPx(value);
    ctx.beginPath();
    ctx.moveTo(margin.left - 6, y);
    ctx.lineTo(margin.left, y);
    ctx.stroke();
    ctx.fillText(String(value), margin.left - 9, y);
  }

  ctx.strokeStyle = "#133d73";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  points.forEach((point, index) => {
    const x = xToPx(point.x);
    const y = yToPx(point.y);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  ctx.fillStyle = "#516273";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.font = "12px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
  ctx.fillText("Time (min)", margin.left + plotWidth / 2, cssHeight - 16);
  ctx.textAlign = "left";
  ctx.fillText(`Pressure (${pressureUnit})`, margin.left, 2);

  gradientChartState = {
    points: points.map((point) => ({
      ...point,
      px: xToPx(point.x),
      py: yToPx(point.y)
    })),
    pressureUnit
  };
}

function hideGradientTooltip() {
  const tooltip = byId("gradientTooltip");
  if (tooltip) tooltip.classList.add("hidden");
}

function showGradientTooltip(event) {
  if (!gradientChartState || !gradientChartState.points.length) return;
  const canvas = byId("gradientPressureChart");
  const tooltip = byId("gradientTooltip");
  if (!canvas || !tooltip) return;

  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  let nearest = gradientChartState.points[0];
  let nearestDistance = Infinity;
  gradientChartState.points.forEach((point) => {
    const distance = Math.hypot(point.px - x, point.py - y);
    if (distance < nearestDistance) {
      nearest = point;
      nearestDistance = distance;
    }
  });

  if (nearestDistance > 24) {
    hideGradientTooltip();
    return;
  }

  tooltip.textContent = `${nearest.x.toFixed(2)}, ${nearest.y.toFixed(1)}`;
  tooltip.style.left = `${nearest.px + 12}px`;
  tooltip.style.top = `${nearest.py + 2}px`;
  tooltip.classList.remove("hidden");
}

function setVarFromBase(inputId, baseValue, unitId, factors) {
  byId(inputId).value = displayValue(fromBase(baseValue, byId(unitId).value, factors));
}

function pressureClass(pressureDynCm2) {
  const pressureBar = fromBase(pressureDynCm2, "Bar", PRESSURE_FACTORS);
  if (pressureBar >= 600) return "danger";
  if (pressureBar >= 500) return "warn";
  return "";
}

function setPressureColors(pressureDynCm2) {
  const input = byId("pressure");
  const output = byId("pressureOut");
  input.classList.remove("warn", "danger");
  output.classList.remove("warn", "danger");
  const inputDyn = pressureDynCm2 ?? toBase(numberFromInput("pressure"), byId("pressureUnit").value, PRESSURE_FACTORS);
  const inputClass = pressureClass(inputDyn);
  if (inputClass) input.classList.add(inputClass);

  const outputValue = parseFloat(output.textContent);
  if (Number.isFinite(outputValue)) {
    const outputDyn = toBase(outputValue, byId("pressureResultUnit").value, PRESSURE_FACTORS);
    const outputClass = pressureClass(outputDyn);
    if (outputClass) output.classList.add(outputClass);
  }
}

function systemSegments() {
  return [...byId("systemRows").querySelectorAll("tr")].map((row) => {
    const type = row.querySelector("[data-field='type']").value;
    return {
      name: row.querySelector("[data-field='name']").value.trim() || "Unnamed",
      capillaryType: type,
      lengthCm: numberFromElement(row.querySelector("[data-field='length']")),
      innerDiameterUm: numberFromElement(row.querySelector("[data-field='id']")),
      particleDiameterUm: type === "Packed" ? numberFromElement(row.querySelector("[data-field='particle']")) : 0.0,
      porosity: type === "Packed" ? numberFromElement(row.querySelector("[data-field='porosity']")) : 0.0
    };
  });
}

function renderSystemRows() {
  const tbody = byId("systemRows");
  tbody.innerHTML = "";
  SYSTEM_DEFAULTS.forEach((defaults) => addSystemRow(defaults));
}

function addSystemRow(defaults = null) {
  const values = defaults || [`Unit ${byId("systemRows").children.length + 1}`, "Open tubular", "10", "50", "", ""];
  const row = document.createElement("tr");
  const fields = [
    ["name", "input", values[0]],
    ["type", "select", values[1]],
    ["length", "input", values[2]],
    ["id", "input", values[3]],
    ["particle", "input", values[4]],
    ["porosity", "input", values[5]]
  ];

  fields.forEach(([field, kind, value]) => {
    const cell = document.createElement("td");
    let control;
    if (kind === "select") {
      control = document.createElement("select");
      ["Open tubular", "Packed"].forEach((optionValue) => {
        const option = document.createElement("option");
        option.value = optionValue;
        option.textContent = optionValue;
        if (optionValue === value) option.selected = true;
        control.appendChild(option);
      });
    } else {
      control = document.createElement("input");
      control.value = value;
      control.inputMode = "decimal";
    }
    control.dataset.field = field;
    control.addEventListener("input", calculateCapillary);
    control.addEventListener("change", () => {
      syncSystemRowState(row);
      calculateCapillary();
    });
    cell.appendChild(control);
    row.appendChild(cell);
  });

  const actionCell = document.createElement("td");
  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.textContent = "Remove";
  removeButton.addEventListener("click", () => {
    row.remove();
    calculateCapillary();
  });
  actionCell.appendChild(removeButton);
  row.appendChild(actionCell);
  byId("systemRows").appendChild(row);
  syncSystemRowState(row);
}

function syncSystemRowState(row) {
  const isPacked = row.querySelector("[data-field='type']").value === "Packed";
  row.querySelector("[data-field='particle']").disabled = !isPacked;
  row.querySelector("[data-field='porosity']").disabled = !isPacked;
}

function refreshCapillaryLayout() {
  const mode = byId("computeType").value;
  const systemMode = mode === "System Pressure";
  const open = isOpenTubular(byId("capType").value);
  const visibleForSystem = new Set(["viscosity", "flow"]);

  byId("capillaryInputs").querySelectorAll("[data-row]").forEach((row) => {
    const key = row.dataset.row;
    let show = true;
    if (systemMode) show = visibleForSystem.has(key);
    else if (open && (key === "particle" || key === "porosity")) show = false;
    row.classList.toggle("hidden", !show);
  });

  byId("systemPanel").classList.toggle("hidden", !systemMode);
  byId("systemDetail").classList.toggle("hidden", !systemMode);
}

function updateResultOutputs(result) {
  byId("linearOut").textContent = displayValue(fromBase(result.linearVelocityCmMin, byId("linearUnit").value, LINEAR_VELOCITY_FACTORS));
  byId("deadOut").textContent = displayValue(fromBase(result.deadTimeMin, byId("deadResultUnit").value, TIME_FACTORS));
  byId("volumeOut").textContent = displayValue(fromBase(result.columnVolumeMl, byId("volumeUnit").value, VOLUME_FACTORS));
  byId("flowOut").textContent = displayValue(fromBase(result.flowMlMin, byId("flowResultUnit").value, FLOW_FACTORS));
  byId("pressureOut").textContent = displayValue(fromBase(result.pressureDynCm2, byId("pressureResultUnit").value, PRESSURE_FACTORS));
  byId("lengthOut").textContent = displayValue(fromBase(result.lengthCm, byId("lengthResultUnit").value, LENGTH_FACTORS));
  byId("idOut").textContent = displayValue(fromBase(result.innerDiameterCm, byId("idResultUnit").value, LENGTH_FACTORS));
  byId("massFlowOut").textContent = displayValue(fromBase(result.massFlowMolMin, byId("massFlowUnit").value, MASS_FLOW_FACTORS));
  byId("injectedOut").textContent = displayValue(fromBase(result.molesInjectedMol, byId("injectedUnit").value, MOLES_FACTORS));
}

function calculateCapillary() {
  if (updatingCapillary) return;
  drawViscosityChart();
  drawGradientPressureChart();
  refreshCapillaryLayout();
  try {
    const inputs = capillaryInputs();
    const flowMlMin = toBase(numberFromInput("flow"), byId("flowUnit").value, FLOW_FACTORS);
    const flowNlMin = fromBase(flowMlMin, "nL/min", FLOW_FACTORS);
    const deadTimeMin = toBase(numberFromInput("deadTime"), byId("deadTimeUnit").value, TIME_FACTORS);
    const mode = byId("computeType").value;
    let result;

    updatingCapillary = true;
    try {
      if (mode === "System Pressure") {
        const system = computeSystemPressure(
          systemSegments(),
          flowNlMin,
          inputs.viscosityPoise,
          inputs.concentrationUm,
          inputs.injectionTimeMin
        );
        const pressureUnit = byId("pressureResultUnit").value;
        const deadUnit = byId("deadResultUnit").value;
        const volumeUnit = byId("volumeUnit").value;
        const flowUnit = byId("flowResultUnit").value;
        byId("linearOut").textContent = "--";
        byId("deadOut").textContent = displayValue(fromBase(system.totalDeadTime, deadUnit, TIME_FACTORS));
        byId("volumeOut").textContent = displayValue(fromBase(system.totalDeadVolume, volumeUnit, VOLUME_FACTORS));
        byId("flowOut").textContent = displayValue(fromBase(flowMlMin, flowUnit, FLOW_FACTORS));
        byId("pressureOut").textContent = displayValue(fromBase(system.totalPressure, pressureUnit, PRESSURE_FACTORS));
        byId("lengthOut").textContent = "--";
        byId("idOut").textContent = "--";
        if (system.segments.length) {
          const first = system.segments[0].result;
          byId("massFlowOut").textContent = displayValue(fromBase(first.massFlowMolMin, byId("massFlowUnit").value, MASS_FLOW_FACTORS));
          byId("injectedOut").textContent = displayValue(fromBase(first.molesInjectedMol, byId("injectedUnit").value, MOLES_FACTORS));
        }
        const lines = [`${"Component".padEnd(22)} ${"Pressure".padStart(12)} ${"Dead time".padStart(12)} ${"Dead volume".padStart(13)}`];
        system.segments.forEach(({ segment, result: segmentResult }) => {
          const pressure = fromBase(segmentResult.pressureDynCm2, pressureUnit, PRESSURE_FACTORS);
          const dead = fromBase(segmentResult.deadTimeMin, deadUnit, TIME_FACTORS);
          const volume = fromBase(segmentResult.columnVolumeMl, volumeUnit, VOLUME_FACTORS);
          lines.push(`${segment.name.slice(0, 22).padEnd(22)} ${displayValue(pressure).padStart(12)} ${displayValue(dead).padStart(12)} ${displayValue(volume).padStart(13)}`);
        });
        lines.push("");
        lines.push(`${"Total".padEnd(22)} ${displayValue(fromBase(system.totalPressure, pressureUnit, PRESSURE_FACTORS)).padStart(12)} ${displayValue(fromBase(system.totalDeadTime, deadUnit, TIME_FACTORS)).padStart(12)} ${displayValue(fromBase(system.totalDeadVolume, volumeUnit, VOLUME_FACTORS)).padStart(13)}`);
        byId("systemDetail").textContent = lines.join("\n");
        setPressureColors(system.totalPressure);
        byId("capillaryStatus").textContent = `Capillary values calculated: ${mode}`;
        drawGradientPressureChart();
        return;
      }

      if (mode === "Find Back Pressure") result = computeFromFlow(inputs, flowNlMin);
      else if (mode === "Find Column Length") result = computeColumnLength(inputs, flowNlMin);
      else if (mode === "Find Inner Diameter") result = computeInnerDiameter(inputs, flowNlMin);
      else if (mode === "Find Flow Rate using Dead Time") result = computeFlowUsingDeadTime(inputs, deadTimeMin);
      else result = computeFromPressure(inputs);

      byId("systemDetail").textContent = "System Pressure results appear here when selected.";
      if (mode === "Find Back Pressure" || mode === "Find Flow Rate using Dead Time") {
        setVarFromBase("pressure", result.pressureDynCm2, "pressureUnit", PRESSURE_FACTORS);
      }
      if (mode === "Find Column Length") setVarFromBase("length", result.lengthCm, "lengthUnit", LENGTH_FACTORS);
      if (mode === "Find Inner Diameter") setVarFromBase("innerDiameter", result.innerDiameterCm, "idUnit", LENGTH_FACTORS);
      if (mode === "Find Volumetric Flow rate" || mode === "Find Flow Rate using Dead Time") {
        setVarFromBase("flow", result.flowMlMin, "flowUnit", FLOW_FACTORS);
      }
      if (mode !== "Find Flow Rate using Dead Time") {
        setVarFromBase("deadTime", result.deadTimeMin, "deadTimeUnit", TIME_FACTORS);
      }
      updateResultOutputs(result);
      setPressureColors(result.pressureDynCm2);
      byId("capillaryStatus").textContent = `Capillary values calculated: ${mode}`;
      drawGradientPressureChart();
    } finally {
      updatingCapillary = false;
    }
  } catch (error) {
    updatingCapillary = false;
    byId("capillaryStatus").textContent = `Error: ${error.message}`;
  }
}

function applyColumnPreset() {
  if (updatingCapillary) return;
  const preset = COLUMN_PRESETS[byId("capType").value];
  if (!preset) {
    calculateCapillary();
    return;
  }
  updatingCapillary = true;
  try {
    byId("computeType").value = preset.computeType;
    byId("length").value = preset.length;
    byId("lengthUnit").value = "cm";
    byId("innerDiameter").value = preset.id;
    byId("idUnit").value = "um";
    byId("mecn").value = preset.mecn;
    byId("temperature").value = preset.temp;
    const cp = computeMecnViscosityCp(parseFloat(preset.mecn), parseFloat(preset.temp));
    byId("viscosityUnit").value = "Poise [g/(cm-sec)]";
    byId("viscosity").value = displayValue(cp * 0.01);
    byId("particle").value = preset.particle;
    byId("particleUnit").value = "um";
    byId("porosity").value = preset.porosity;
    byId("flow").value = preset.flow;
    byId("flowUnit").value = "nL/min";
  } finally {
    updatingCapillary = false;
  }
  calculateCapillary();
}

function resetCapillary() {
  updatingCapillary = true;
  try {
    byId("pressure").value = "206.8427";
    byId("deadTime").value = "40.5374";
    byId("pressureUnit").value = "Bar";
    byId("deadTimeUnit").value = "minutes";
    byId("concentration").value = "1";
    byId("injectionTime").value = "5";
    byId("concentrationUnit").value = "uM";
    byId("injectionUnit").value = "minutes";
    byId("capType").value = "Separation Column";
  } finally {
    updatingCapillary = false;
  }
  applyColumnPreset();
}

function useViscosity() {
  const cp = computeMecnViscosityCp(numberFromInput("mecn"), numberFromInput("temperature"));
  const basePoise = cp * VISCOSITY_FACTORS.centiPoise;
  byId("viscosity").value = displayValue(fromBase(basePoise, byId("viscosityUnit").value, VISCOSITY_FACTORS));
  drawViscosityChart();
  drawGradientPressureChart();
  calculateCapillary();
}

function renderModificationList() {
  const list = byId("modList");
  list.innerHTML = "";
  Object.entries(MODIFICATION_MASSES).forEach(([symbol, mass]) => {
    const item = document.createElement("div");
    const left = document.createElement("strong");
    const right = document.createElement("span");
    left.textContent = symbol;
    right.textContent = mass.toFixed(5);
    item.append(left, right);
    list.appendChild(item);
  });
}

function bindTabs() {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".tab-button").forEach((item) => item.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach((panel) => panel.classList.remove("active"));
      button.classList.add("active");
      byId(`${button.dataset.tab}-panel`).classList.add("active");
    });
  });
}

function bindEvents() {
  ["sequence", "notation", "nTerm", "cTerm", "stripFlanking", "peptideDigits"].forEach((id) => {
    byId(id).addEventListener("input", renderPeptide);
    byId(id).addEventListener("change", renderPeptide);
  });

  [
    "computeType", "pressure", "pressureUnit", "length", "lengthUnit", "innerDiameter",
    "idUnit", "viscosity", "viscosityUnit", "particle", "particleUnit", "porosity",
    "flow", "flowUnit", "deadTime", "deadTimeUnit", "concentration", "concentrationUnit",
    "injectionTime", "injectionUnit", "massFlowUnit", "injectedUnit", "linearUnit",
    "deadResultUnit", "volumeUnit", "flowResultUnit", "pressureResultUnit",
    "lengthResultUnit", "idResultUnit"
  ].forEach((id) => {
    byId(id).addEventListener("input", calculateCapillary);
    byId(id).addEventListener("change", calculateCapillary);
  });

  byId("capType").addEventListener("change", applyColumnPreset);
  byId("calculateCapillary").addEventListener("click", calculateCapillary);
  byId("resetCapillary").addEventListener("click", resetCapillary);
  byId("useViscosity").addEventListener("click", useViscosity);
  byId("mecn").addEventListener("input", drawViscosityChart);
  byId("mecn").addEventListener("change", drawViscosityChart);
  byId("temperature").addEventListener("input", drawViscosityChart);
  byId("temperature").addEventListener("change", drawViscosityChart);
  byId("mecn").addEventListener("input", drawGradientPressureChart);
  byId("mecn").addEventListener("change", drawGradientPressureChart);
  byId("temperature").addEventListener("input", drawGradientPressureChart);
  byId("temperature").addEventListener("change", drawGradientPressureChart);
  byId("dwellTime").addEventListener("input", drawGradientPressureChart);
  byId("dwellTime").addEventListener("change", drawGradientPressureChart);
  byId("addGradientRow").addEventListener("click", () => {
    addGradientRow();
    drawGradientPressureChart();
  });
  byId("removeGradientRow").addEventListener("click", removeGradientRow);
  byId("gradientPressureChart").addEventListener("mousemove", showGradientTooltip);
  byId("gradientPressureChart").addEventListener("mouseleave", hideGradientTooltip);
  window.addEventListener("resize", () => {
    drawViscosityChart();
    drawGradientPressureChart();
  });
  byId("addSystemRow").addEventListener("click", () => {
    addSystemRow();
    calculateCapillary();
  });
}

function initialize() {
  populateSelect("nTerm", Object.keys(N_TERMINI), "Hydrogen (H)");
  populateSelect("cTerm", Object.keys(C_TERMINI), "Hydroxyl (OH)");
  populateSelect("pressureUnit", Object.keys(PRESSURE_FACTORS), "Bar");
  populateSelect("lengthUnit", Object.keys(LENGTH_FACTORS), "cm");
  populateSelect("idUnit", Object.keys(LENGTH_FACTORS), "um");
  populateSelect("viscosityUnit", Object.keys(VISCOSITY_FACTORS), "Poise [g/(cm-sec)]");
  populateSelect("particleUnit", Object.keys(LENGTH_FACTORS), "um");
  populateSelect("flowUnit", Object.keys(FLOW_FACTORS), "nL/min");
  populateSelect("deadTimeUnit", Object.keys(TIME_FACTORS), "minutes");
  populateSelect("concentrationUnit", Object.keys(CONCENTRATION_FACTORS), "uM");
  populateSelect("injectionUnit", Object.keys(TIME_FACTORS), "minutes");
  populateSelect("massFlowUnit", Object.keys(MASS_FLOW_FACTORS), "fmol/sec");
  populateSelect("injectedUnit", Object.keys(MOLES_FACTORS), "fmoles");
  populateSelect("linearUnit", Object.keys(LINEAR_VELOCITY_FACTORS), "cm/sec");
  populateSelect("deadResultUnit", Object.keys(TIME_FACTORS), "minutes");
  populateSelect("volumeUnit", Object.keys(VOLUME_FACTORS), "nL");
  populateSelect("flowResultUnit", Object.keys(FLOW_FACTORS), "nL/min");
  populateSelect("pressureResultUnit", Object.keys(PRESSURE_FACTORS), "Bar");
  populateSelect("lengthResultUnit", Object.keys(LENGTH_FACTORS), "cm");
  populateSelect("idResultUnit", Object.keys(LENGTH_FACTORS), "um");

  renderModificationList();
  renderSystemRows();
  renderGradientRows();
  bindTabs();
  bindEvents();
  applyColumnPreset();
  drawViscosityChart();
  drawGradientPressureChart();
  renderPeptide();
}

document.addEventListener("DOMContentLoaded", initialize);

window.PeptideCapillaryCalculators = {
  formulaMass,
  computePeptide,
  computeFromPressure,
  computeFromFlow,
  computeColumnLength,
  computeInnerDiameter,
  computeFlowUsingDeadTime,
  computeSystemPressure,
  computeMecnViscosityCp,
  drawViscosityChart,
  drawGradientPressureChart
};
