# Capillary Flow Calculator Neo

This folder contains a pure HTML, CSS, and JavaScript version of the peptide
molecular weight and capillary flow calculator. It runs entirely in the
browser and does not require Python, Tkinter, a local server, or macOS-specific
packaging.

## New Features in This Version

- Browser-based cross-platform implementation
- System pressure summation
- Gradient pressure simulation
- No Python or local installation required
- Fast peptide GRAVY Score calculation


## Authorship and Attribution

This browser-based JavaScript implementation was developed by Siqi Huang
and is derived from selected workflows of the PNNL Molecular Weight Calculator
VB6 project, and is not the original PNNL software.

The original Molecular Weight Calculator was written by Matthew Monroe for the
Department of Energy / Pacific Northwest National Laboratory (PNNL).

## Run

Open `index.html` in any modern browser.

The Capillary Flow Calculator tab is shown first by default. Use the Peptide
MW tab to switch to peptide sequence mass calculations.

For GitHub Pages, publish this folder as the site root or copy these files into
the Pages branch/folder:

- `index.html`
- `style.css`
- `app.js`
- `NOTICE.md`

## Included Modules

- Peptide molecular weight calculation
- One-letter and three-letter peptide parsing
- Selected modification symbols from the VB6 workflow
- GRAVY score calculation
- Capillary flow, pressure, length, inner diameter, dead time, and system
  pressure calculations
- MeCN/water viscosity helper
- Gradient vs pressure simulation using a column-segment integration model.
  The column is divided into small segments; each segment receives the MeCN
  composition expected at that position and time based on gradient timing,
  column hold-up volume, and volumetric flow rate. Segment pressures are
  computed with the same back-pressure equation and summed. The optional dwell
  time shifts the programmed gradient before it reaches the column inlet.

## License and Attribution

This JavaScript version is a modified derivative of work based on PNNL's
Molecular Weight Calculator VB6 project:

https://github.com/PNNL-Comp-Mass-Spec/Molecular-Weight-Calculator-VB6.git

The original source code is licensed under the Apache License, Version 2.0.
Keep the required copyright, license, disclaimer, and attribution notices when
redistributing this version. Modified files should clearly state that they have
been changed from the original VB6 implementation. See `NOTICE.md` for
attribution text.
