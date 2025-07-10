"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Client, Worker, Task, Rule } from "@/types/entities";
import DataGridDisplay from "@/components/Datagrid/page";
import RuleBuilder from "@/components/Rulebuilder/page";
import { useEffect } from "react";
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
  const [isClient, setIsClient] = useState(false);
const dataTypes: ("clients" | "workers" | "tasks")[] = ["clients", "workers", "tasks"];
    useEffect(() => {
    setIsClient(true);
  }, []);

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
    <main className="min-h-screen px-6 md:px-12 py-8 bg-gradient-to-br from-gray-100 via-white to-gray-50 text-gray-800 dark:from-black dark:to-gray-900 dark:text-gray-100">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2">📊 Data Alchemist</h1>
        <p className="text-lg text-gray-700 dark:text-black">
          Upload your CSV/XLSX files and apply dynamic rules to clean & visualize your data
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {dataTypes.map((type) => (
          <div key={type} className="p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-lg capitalize mb-2">{type} upload</h3>
{isClient && (

              <FileUpload onDataLoaded={(data) => handleData(data,type)} />
            )}          </div>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
          👤 Clients Loaded: {clients.length}
        </div>
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
          👷 Workers Loaded: {workers.length}
        </div>
        <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
          📋 Tasks Loaded: {tasks.length}
        </div>
      </div>

      {clients.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">🔍 Client Rules & Data</h2>
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
        </section>
      )}

      {workers.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">🔧 Worker Rules & Data</h2>
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
        </section>
      )}

      {tasks.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">✅ Task Rules & Data</h2>
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
        </section>
      )}
    </main>
  );
}
