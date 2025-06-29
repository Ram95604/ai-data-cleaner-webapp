"use client";

import {
  DataGrid,
  GridColDef,
  GridRowModel,
} from "@mui/x-data-grid";
import { Paper, Typography, Button } from "@mui/material";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import NaturalDataModifier from "../NaturalDataModifier/page";

interface Modification {
  filter: {
    field: string;
    operator: string;
    value: string;
  };
  update: {
    field: string;
    value: string;
  };
}
// Rule interface
interface Rule {
  field: string;
  operator: string;
  value: string;
  weight?: number;
}

interface Props<T extends Record<string, unknown>> {
  data: T[];
  type: "clients" | "workers" | "tasks";
  onUpdate: (updated: T[]) => void;
  rules?: Rule[];
}

type DataGridRow<T> = T & { id: number };

const validateRow = <T extends Record<string, unknown>>(row: T): boolean => {
  for (const [key, val] of Object.entries(row)) {
    if (val === null || val === "") return false;

    if (
      key.toLowerCase().includes("duration") ||
      key.toLowerCase().includes("level") ||
      key.toLowerCase().includes("priority") ||
      key.toLowerCase().includes("max")
    ) {
      if (isNaN(Number(val))) return false;
    }
  }
  return true;
};

const applyRules = <T extends Record<string, unknown>>(data: T[], rules: Rule[]): T[] => {
  if (!rules || rules.length === 0) return data;

  const groupedRules: Record<string, Rule[]> = rules.reduce((acc, rule) => {
    const key = rule.field.toLowerCase();
    (acc[key] = acc[key] || []).push(rule);
    return acc;
  }, {} as Record<string, Rule[]>);

  const fieldsWithRules = Object.keys(groupedRules);

  return data.filter((item) => {
    const itemKeyMap: Record<string, string> = {};
    for (const key in item) itemKeyMap[key.toLowerCase()] = key;

    return fieldsWithRules.every((fieldLoweCase) => {
      const rulesForField = groupedRules[fieldLoweCase];
      const originalKey = itemKeyMap[fieldLoweCase];
      if (!originalKey) return false;
      const fieldValue = item[originalKey];

      return rulesForField.some((rule) => {
        const ruleValue = rule.value;
        switch (rule.operator) {
          case "=":
            return String(fieldValue).toLowerCase().trim() === ruleValue.toLowerCase().trim();
          case ">":
            return Number(fieldValue) > Number(ruleValue);
          case "<":
            return Number(fieldValue) < Number(ruleValue);
          case "includes":
            return String(fieldValue).toLowerCase().split(",").map((s) => s.trim()).includes(ruleValue.toLowerCase().trim());
          
          default:
            return false;
        }
      });
    });
  });
};

const DataGridDisplay = <T extends Record<string, unknown>>({
  data,
  type,
  onUpdate,
  rules = [],
}: Props<T>) => {
  const [rows, setRows] = useState<DataGridRow<T>[]>([]);
  const [errorRows, setErrorRows] = useState<Set<number>>(new Set());
  const [modifications, setModifications] = useState<Modification[]>([]);

  useEffect(() => {
    const initialRows = data.map((item, index) => ({ id: index, ...item }));
    setRows(initialRows);
    const initialErrorRows = initialRows.filter(r => !validateRow(r)).map(r => r.id);
    setErrorRows(new Set(initialErrorRows));
  }, [data]);

  const handleModify = (
  modifications: {
    filter: Rule;
    update: { field: string; value: string };
  }[]
) => {
  const updated = rows.map((row) => {
    let modifiedRow = { ...row };

    const rowKeyMap: Record<string, string> = {};
    for (const key in row) {
      rowKeyMap[key.toLowerCase()] = key;
    }

    for (const mod of modifications) {
      const filterKey = rowKeyMap[mod.filter.field.toLowerCase()];
      const updateKey = rowKeyMap[mod.update.field.toLowerCase()];

      if (!filterKey || !updateKey) continue;

      let targetVal = row[filterKey];
const { operator, value } = mod.filter;
let match = false;

// parsing targetVal if it's a JSON string (like AttributesJSON which is like key:value)
if (typeof targetVal === "string" && targetVal.trim().startsWith("{")) {
  try {
    targetVal = JSON.parse(targetVal);
  } catch (e) {
    console.warn(`Failed to parse JSON field: ${filterKey}`, targetVal);
  }
}

if (operator === "includes" && typeof targetVal === "object" && targetVal !== null) {
  if (value.includes(":")) {
    const [key, val] = value.split(":").map((s) => s.trim().toLowerCase());
    const actualVal = (targetVal as Record<string, any>)[key];
    match = actualVal && String(actualVal).toLowerCase() === val;
  } else {
    
    match = Object.values(targetVal)
      .map((v) => String(v).toLowerCase())
      .includes(value.toLowerCase());
  }
} else {
  switch (operator) {
    case "=":
      match = String(targetVal).toLowerCase().trim() === value.toLowerCase().trim();
      break;
    case ">":
      match = Number(targetVal) > Number(value);
      break;
    case "<":
      match = Number(targetVal) < Number(value);
      break;
    case "includes":
      match = String(targetVal).toLowerCase().split(",").includes(value.toLowerCase());
      break;
    case "contains":
      match = String(targetVal).toLowerCase().includes(value.toLowerCase());
      break;
  }
}


      if (match) {
        modifiedRow = { ...modifiedRow, [updateKey]: mod.update.value };
      }
    }

    return modifiedRow;
  });

  setRows(updated);
  alert("Changes made Successfully");
  setModifications((prev) => [...prev, ...modifications]);
  onUpdate(updated.map(({ id, ...rest }) => rest as unknown as T));
};
  
  const handleSuggestRules = async () => {
    alert("Feature arriving soon");
};
  const processRowUpdate = (newRow: GridRowModel): GridRowModel => {
    const updatedRows = rows.map((r) => r.id === newRow.id ? (newRow as DataGridRow<T>) : r);
    const updatedData: T[] = updatedRows.map(({ id, ...rest }) => rest as unknown as T);
    setRows(updatedRows);
    onUpdate(updatedData);
    const newErrorRows = new Set(updatedRows.filter((r) => !validateRow(r)).map((r) => r.id));
    setErrorRows(newErrorRows);
    return newRow;
  };

  const columns: GridColDef[] = Object.keys(data[0] || {}).map((key) => ({
    field: key,
    headerName: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
    width: 150,
    editable: true,
    cellClassName: (params) => (errorRows.has(params.id as number) ? "error-cell" : ""),
  }));

  const downloadCSV = () => {
  const cleanRows = rows.filter((r) => !errorRows.has(r.id)).map(({ id, ...rest }) => rest);
  const worksheet = XLSX.utils.json_to_sheet(cleanRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `${type}_cleaned`);
  XLSX.writeFile(workbook, `${type}_cleaned.xlsx`);
};

  const downloadRules = () => {
  const combinedRules = [
    ...rules.map((r) => ({
      filter: { field: r.field, operator: r.operator, value: r.value },
      update: { field: "", value: "" }  // Placeholder for static rules with no update
    })),
    ...modifications, //  modifications done by my LLM
  ];

  const ruleObj = { type, rules: combinedRules };

  const blob = new Blob([JSON.stringify(ruleObj, null, 2)], {
    type: "application/json",
  });


  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${type}_rules.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  const validCount = rows.length - errorRows.size;
  const invalidCount = errorRows.size;

  return (
    <Paper style={{ marginTop: "2rem", padding: "1rem" }}>
      <Typography variant="h6">{type.toUpperCase()} Table</Typography>

      <div style={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          processRowUpdate={processRowUpdate}
          checkboxSelection
        />
      </div>

      <NaturalDataModifier type={type} onModify={handleModify} />

      <div style={{ marginTop: "1rem" }}>
        <Typography>
          ✅ Valid Rows: {validCount} / {rows.length} | ❌ Invalid: {invalidCount}
        </Typography>
        <Button onClick={downloadCSV} variant="outlined" sx={{ mt: 1, mr: 1 }}>
          Download Cleaned XLSX
        </Button>
        <Button onClick={downloadRules} variant="outlined" sx={{ mt: 1 }}>
          Download Rules JSON
        </Button>
        <Button onClick={handleSuggestRules} variant="outlined" sx={{ mt: 1, ml: 1 }}>
          Suggest Rules (AI)
        </Button>
      </div>
    </Paper>
  );
};

export default DataGridDisplay;
