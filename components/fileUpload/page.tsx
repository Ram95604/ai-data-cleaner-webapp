import { ChangeEvent } from "react";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { Button } from "@mui/material";
import { Client, Worker, Task } from "@/types/entities";
type FileType = "clients" | "workers" | "tasks";

interface FileUploadProps {
  onDataLoaded: (data: Client[] | Worker[] | Task[], fileType: FileType) => void;
}

const FileUpload = ({ onDataLoaded }: FileUploadProps) => {
  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let fileType: FileType = "tasks";
    if (file.name.toLowerCase().includes("client")) fileType = "clients";
    else if (file.name.toLowerCase().includes("worker")) fileType = "workers";

    const reader = new FileReader();

    if (file.name.endsWith(".csv")) {
      reader.onload = (evt) => {
        const csv = Papa.parse(evt.target?.result as string, {
          header: true,
          skipEmptyLines: true,
        });

        onDataLoaded(csv.data as Client[] | Worker[] | Task[], fileType);
      };
      reader.readAsText(file);
    } else {
      reader.onload = (evt) => {
        const workbook = XLSX.read(evt.target?.result, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);
        onDataLoaded(data as Client[] | Worker[] | Task[], fileType);
      };
      reader.readAsBinaryString(file);
    }
  };

  return (
    <div style={{ margin: "1rem 0" }}>
      <Button variant="contained" component="label">
        Upload File
        <input type="file" accept=".csv,.xlsx" hidden onChange={handleFile} />
      </Button>
    </div>
  );
};

export default FileUpload;
