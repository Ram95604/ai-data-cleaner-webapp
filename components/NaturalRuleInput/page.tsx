"use client";

import { useState } from "react";
import { TextField, Button, Paper, Typography, CircularProgress } from "@mui/material";
import { Rule } from "@/types/entities";

interface Props {
  type: "clients" | "workers" | "tasks";
  onRulesParsed: (rules: Rule[]) => void;
}

const NaturalRuleInput = ({ type, onRulesParsed }: Props) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/naturalRules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: input, type }), 
      });

      const data = await res.json();

      if (data.rules) {
        onRulesParsed(data.rules);
      } else {
        alert("Failed to parse rules");
      }
    } catch (err) {
      console.error("Error parsing natural rule:", err);
      alert("Error parsing rule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="subtitle1">🧠 Describe Rules in Natural Language</Typography>

      <TextField
        label="e.g., Show tasks longer than 5 hours with category ML"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        fullWidth
        multiline
        rows={2}
        sx={{ mt: 1 }}
      />

      <Button
        onClick={handleSubmit}
        disabled={loading}
        variant="contained"
        sx={{ mt: 2 }}
      >
        {loading ? <CircularProgress size={20} /> : "Convert to Rules"}
      </Button>
    </Paper>
  );
};

export default NaturalRuleInput;
