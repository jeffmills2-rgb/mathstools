/*
  CHHS Exam Builder — Marking Criteria
  ------------------------------------
  Generates HSC-style banded marking criteria from the standard question schema.

  The criteria are intentionally arranged from full marks down to partial
  credit, rather than splitting every mark into a separate 1-mark row.
*/

const TYPE_FULL_SOLUTION = {
  "area-triangles": "Uses the triangle area formula correctly and calculates the area with square units",
  "area-parallelograms": "Uses base × perpendicular height correctly and calculates the area with square units",
  "area-trapeziums": "Uses the trapezium area formula correctly and calculates the area with square units",
  "area-rhombuses": "Uses the kite/rhombus diagonal area formula correctly and calculates the area with square units",
  "area-kites": "Uses the kite/rhombus diagonal area formula correctly and calculates the area with square units",
  "area-circles-radius": "Uses the circle area formula correctly and gives the required form of answer",
  "area-circles-diameter": "Finds the radius from the diameter, uses the circle area formula correctly and gives the required form of answer",
  "area-sectors": "Uses the sector area formula correctly and gives the required form of answer",
  "area-semicircles": "Uses half the area of a circle correctly and gives the required form of answer",
  "area-quadrants": "Uses one-quarter of the area of a circle correctly and gives the required form of answer",
  "curved-composite-area": "Splits the figure into appropriate parts, calculates each area and combines the parts correctly",
  "perimeter-composite": "Identifies the outside edges of the composite figure and calculates the perimeter correctly with units",
  "missing-side-perimeter": "Finds the missing side length and calculates the perimeter correctly with units",
  "sector-perimeter": "Finds the arc length and adds the two radii to calculate the sector perimeter correctly",
  "semicircle-perimeter": "Finds the curved part and adds the diameter to calculate the semicircle perimeter correctly",
  "quadrant-perimeter": "Finds the curved part and adds the two radii to calculate the quadrant perimeter correctly",
  "arc-length": "Uses the arc length as a fraction of the circumference and calculates the arc length correctly",
  "distance-time-read": "Reads the required value accurately from the distance-time graph",
  "distance-time-speed": "Identifies the change in distance and change in time and calculates the average speed correctly",
  "distance-time-construct": "Constructs a distance-time graph that matches the described journey",
  "factor-tree": "Uses the factor tree to identify prime factors and writes the prime factorisation using index notation",
  "shaded-fractions": "Correctly identifies or represents the shaded fraction",
  "plot-coordinates": "Correctly plots and labels the required point on the Cartesian plane",
  "complete-table-rule": "Completes the table of values correctly",
  "graph-from-table": "Plots the points from the table and draws the correct straight line",
  "graph-from-equation": "Graphs the linear relationship correctly",
  "intersecting-lines": "Graphs both lines and identifies the correct point of intersection"
};

const TYPE_PARTIAL_CREDIT = {
  "area-triangles": "Uses the triangle area formula or substitutes values correctly",
  "area-parallelograms": "Uses base × perpendicular height or substitutes values correctly",
  "area-trapeziums": "Uses an appropriate trapezium formula or identifies the parallel sides and perpendicular height",
  "area-rhombuses": "Uses an appropriate diagonal area formula or identifies the required diagonals",
  "area-kites": "Uses an appropriate diagonal area formula or identifies the required diagonals",
  "area-circles-radius": "Uses a circle area formula or substitutes the radius correctly",
  "area-circles-diameter": "Finds the radius from the diameter or uses a circle area formula",
  "area-sectors": "Identifies the correct fraction of the circle or uses the sector area formula",
  "area-semicircles": "Identifies that a semicircle is half of a circle",
  "area-quadrants": "Identifies that a quadrant is one-quarter of a circle",
  "curved-composite-area": "Correctly finds at least one relevant component area",
  "perimeter-composite": "Adds relevant outside edges or shows a valid perimeter strategy",
  "missing-side-perimeter": "Finds the missing side length or shows a valid perimeter strategy",
  "sector-perimeter": "Finds the arc length or recognises that the two radii must be included",
  "semicircle-perimeter": "Finds the curved part or recognises that the diameter must be included",
  "quadrant-perimeter": "Finds the curved part or recognises that the two radii must be included",
  "arc-length": "Identifies the correct fraction of the circumference",
  "distance-time-read": "Uses the graph appropriately but with a minor reading error",
  "distance-time-speed": "Identifies change in distance or change in time correctly",
  "distance-time-construct": "Plots some key points from the journey correctly",
  "factor-tree": "Identifies some prime factors from the factor tree",
  "shaded-fractions": "Identifies the number of shaded parts and total parts",
  "plot-coordinates": "Uses the x- and y-coordinates in the correct order",
  "complete-table-rule": "Finds at least one correct missing table value",
  "graph-from-table": "Plots at least two points correctly",
  "graph-from-equation": "Finds correct coordinate pairs for the relationship",
  "intersecting-lines": "Graphs at least one of the two lines correctly"
};

export function buildCriteriaForQuestion(question) {
  const marks = Math.max(1, Number(question?.marks || 1));
  const kind = String(question?.kind || "");

  if (kind === "multiple-choice") {
    return [
      { marks: 1, text: "Selects the correct alternative" }
    ];
  }

  return buildBandedCriteria(question, marks);
}

function buildBandedCriteria(question, marks) {
  const type = String(question?.type || "");
  const full = TYPE_FULL_SOLUTION[type] || fullSolutionText(question);
  const partial = TYPE_PARTIAL_CREDIT[type] || partialCreditText(question);
  const limited = limitedCreditText(question);

  if (marks <= 1) {
    return [
      { marks: 1, text: full || "Provides the correct answer" }
    ];
  }

  if (marks === 2) {
    return [
      { marks: 2, text: full },
      { marks: 1, text: partial }
    ];
  }

  const rows = [
    { marks, text: full },
    { marks: marks - 1, text: `Provides a substantially correct solution with a minor error or omission` }
  ];

  if (marks > 3) {
    rows.push({ marks: Math.max(2, marks - 2), text: partial });
  }

  rows.push({ marks: 1, text: limited });
  return rows;
}

function fullSolutionText(question) {
  const type = String(question?.type || "");
  const topic = String(question?.topic || "").toLowerCase();

  if (topic.includes("angle")) return "Calculates the correct angle and gives an appropriate reason";
  if (topic.includes("pythagoras")) return "Uses Pythagoras' theorem correctly and calculates the required length";
  if (topic.includes("linear")) return "Uses the correct relationship, graph or table and provides the correct answer";
  if (topic.includes("ratio") || topic.includes("rates")) return "Uses an appropriate ratio or rate method and provides the correct answer";
  if (topic.includes("indices")) return "Applies the appropriate index or prime factorisation method and provides the correct answer";

  if (type.includes("convert")) return "Converts the measurement correctly using the appropriate scale factor";
  if (type.includes("compare")) return "Compares the quantities correctly and gives the correct answer";

  return "Provides correct solution";
}

function partialCreditText(question) {
  const topic = String(question?.topic || "").toLowerCase();

  if (topic.includes("angle")) return "Identifies an appropriate angle relationship or shows a valid calculation";
  if (topic.includes("pythagoras")) return "Substitutes values into Pythagoras' theorem or shows a valid calculation";
  if (topic.includes("linear")) return "Shows an appropriate graphical, tabular or algebraic method";
  if (topic.includes("ratio") || topic.includes("rates")) return "Shows an appropriate ratio or rate method";
  if (topic.includes("indices")) return "Shows a relevant index or factorisation method";

  return "Shows appropriate method or equivalent merit";
}

function limitedCreditText(question) {
  const topic = String(question?.topic || "").toLowerCase();

  if (topic.includes("angle")) return "Shows some relevant angle information";
  if (topic.includes("pythagoras")) return "Identifies relevant side lengths or the correct theorem";
  if (topic.includes("linear")) return "Shows some relevant table, graph or coordinate information";
  if (topic.includes("ratio") || topic.includes("rates")) return "Shows some relevant ratio or rate information";

  return "Shows some relevant working or identifies a useful relationship";
}
