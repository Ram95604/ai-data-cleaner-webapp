"use client";

import { useState } from "react";
import {
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
} from "@mui/material";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import NaturalRuleInput from "../NaturalRuleInput/page";
type Operator = "=" | ">" | "<" | "includes" | "contains";

interface Rule {
  field: string;
  operator: Operator;
  value: string;
  weight?: number;
}

interface Props {
  type: "clients" | "workers" | "tasks";
  fields: string[];
  onRulesChange: (rules: Rule[]) => void;
}

const RuleBuilder = ({ type, fields, onRulesChange }: Props) => {
  const [rules, setRules] = useState<Rule[]>([]);

  const handleAddRule = () => {
    const newRules = [
      ...rules,
      { field: "", operator: "=" as Operator, value: "", weight: 1 },
    ];
    setRules(newRules);
    onRulesChange(newRules);
  };

  const handleRuleChange = <K extends keyof Rule>(
    index: number,
    key: K,
    value: Rule[K]
  ) => {
    const updated = [...rules];
    updated[index] = { ...updated[index], [key]: value };
    setRules(updated);
    onRulesChange(updated);
  };

  const handleRemoveRule = (indexToRemove: number) => {
    const updatedRules = rules.filter((_, index) => index !== indexToRemove);
    setRules(updatedRules);
    onRulesChange(updatedRules);
  };

  return (
    <Paper style={{ padding: "1rem", marginTop: "2rem" }}>
      <Typography variant="h6">🧠 Rule Builder ({type})</Typography>

      {rules.map((rule, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: "1rem",
            marginTop: "1rem",
            alignItems: "center",
          }}
        >
          <FormControl style={{ minWidth: 120 }}>
            <InputLabel>Field</InputLabel>
            <Select
              value={rule.field}
              label="Field"
              onChange={(e) =>
                handleRuleChange(i, "field", e.target.value as string)
              }
            >
              {fields.map((field) => (
                <MenuItem key={field} value={field}>
                  {field}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl style={{ minWidth: 100 }}>
            <InputLabel>Operator</InputLabel>
            <Select
              value={rule.operator}
              label="Operator"
              onChange={(e) =>
                handleRuleChange(i, "operator", e.target.value as Operator)
              }
            >
              <MenuItem value="=">=</MenuItem>
              <MenuItem value=">">{">"}</MenuItem>
              <MenuItem value="<">{"<"}</MenuItem>
              <MenuItem value="includes">includes</MenuItem>
              <MenuItem value="contains">contains</MenuItem>
            </Select>
          </FormControl>

          {/* Value */}
          <TextField
            label="Value"
            value={rule.value}
            onChange={(e) =>
              handleRuleChange(i, "value", e.target.value as string)
            }
          />

          <TextField
            label="Weight"
            type="number"
            value={rule.weight ?? ""}
            onChange={(e) =>
              handleRuleChange(i, "weight", Number(e.target.value) as number)
            }
            inputProps={{ min: 0 }}
          />

          <IconButton
            onClick={() => handleRemoveRule(i)}
            color="error"
            aria-label="remove rule"
          >
            <RemoveCircleOutlineIcon />
          </IconButton>
        </div>
      ))}

      <Button onClick={handleAddRule} variant="outlined" sx={{ mt: 2 }}>
        ➕ Add Rule
      </Button>
      <NaturalRuleInput
        type={type}
        onRulesParsed={(parsedRules) => {
          const combined = [...rules, ...parsedRules];
          setRules(combined);
          onRulesChange(combined);
        }}
      />
    </Paper>
  );
};

export default RuleBuilder;
