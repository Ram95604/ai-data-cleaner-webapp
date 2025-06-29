// components/NaturalDataModifier.tsx
"use client";

import { useState } from "react";
import {
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress,
} from "@mui/material";

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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Props<T> {
  type: "clients" | "workers" | "tasks";
  onModify: (modifications: Modification[]) => void;
}

const NaturalDataModifier = ({ type, onModify }: Props<unknown>) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/naturalModify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: input, type }),
      });

      const data = await res.json();
      if (data.modifications) {
        onModify(data.modifications);
        setInput("");
      } else {
        alert("Failed to parse modifications");
      }
    } catch (err) {
      console.error("Error modifying data:", err);
      alert("Error processing instruction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="subtitle1">
        ✏️ Modify Data using Natural Language
      </Typography>
      <TextField
        label="e.g., Change duration to 6 for all ML tasks"
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
        {loading ? <CircularProgress size={20} /> : "Apply Changes"}
      </Button>
    </Paper>
  );
};

export default NaturalDataModifier;
