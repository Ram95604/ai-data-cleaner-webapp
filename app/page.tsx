"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Client, Worker, Task, Rule } from "@/types/entities";
import DataGridDisplay from "@/components/Datagrid/page";
import RuleBuilder from "@/components/Rulebuilder/page";

const FileUpload = dynamic(() => import("@/components/fileUpload/page"), {
  ssr: false,
});

export default function Home() {
  const [clients, setClients] = useState<Client[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clientRules, setClientRules] = useState<Rule[]>([]);
  const [workerRules, setWorkerRules] = useState<Rule[]>([]);
  const [taskRules, setTaskRules] = useState<Rule[]>([]);
  const handleData = (
    data: Client[] | Worker[] | Task[],
    type: "clients" | "workers" | "tasks"
  ) => {
    if (type === "clients") setClients(data as Client[]);
    if (type === "workers") setWorkers(data as Worker[]);
    if (type === "tasks") setTasks(data as Task[]);
  };
  const applyRules = <T extends Record<string, unknown>>(data: T[], rules: Rule[]): T[] => {
  return data.filter((item) =>
    rules.every((rule) => {
      const fieldValue = item[rule.field];
      const ruleValue = rule.value;

      switch (rule.operator) {
        case "=":
          return fieldValue == ruleValue;
        case ">":
          return Number(fieldValue) > Number(ruleValue);
        case "<":
          return Number(fieldValue) < Number(ruleValue);
        case "includes":
          return Array.isArray(fieldValue)
            ? fieldValue.includes(ruleValue)
            : String(fieldValue).includes(ruleValue);
        case "contains":
          return String(fieldValue).toLowerCase().includes(ruleValue.toLowerCase());
        default:
          return true;
      }
    })
  );
};

  return (
    <main style={{ padding: "2rem" }}>
    <h1>📊 Data Alchemist</h1>
    <p>Upload your CSV/XLSX files</p>

    <FileUpload onDataLoaded={handleData} />
    <FileUpload onDataLoaded={handleData} />
    <FileUpload onDataLoaded={handleData} />

    <p>Clients Loaded: {clients.length}</p>
    <p>Workers Loaded: {workers.length}</p>
    <p>Tasks Loaded: {tasks.length}</p>

    {/* RuleBuilder + Table per type */}
    {clients.length > 0 && (
      <>
        <RuleBuilder
          type="clients"
          fields={Object.keys(clients[0] || {})}
          onRulesChange={setClientRules}
        />
        <DataGridDisplay<Client>
          data={applyRules(clients, clientRules)}
          type="clients"
          onUpdate={(updated) => setClients(updated)}
          rules={clientRules}
        />
      </>
    )}

    {workers.length > 0 && (
      <>
        <RuleBuilder
          type="workers"
          fields={Object.keys(workers[0] || {})}
          onRulesChange={setWorkerRules}
        />
        <DataGridDisplay<Worker>
          data={applyRules(workers, workerRules)}
          type="workers"
          onUpdate={(updated) => setWorkers(updated)}
          rules={workerRules}
        />
      </>
    )}

    {tasks.length > 0 && (
      <>
        <RuleBuilder
          type="tasks"
          fields={Object.keys(tasks[0] || {})}
          onRulesChange={setTaskRules}
        />
        <DataGridDisplay<Task>
          data={applyRules(tasks, taskRules)}
          type="tasks"
          onUpdate={(updated) =>
            setTasks(updated.filter((t): t is Task => "TaskID" in t))
          }
          rules={taskRules}
        />
      </>
    )}
  </main>
  );
}
