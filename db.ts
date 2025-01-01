import { Database } from "sqlite";

export const db = new Database("database.db");
db.run(
  [
    "CREATE TABLE IF NOT EXISTS messages (",
    "    id INT AUTO_INCREMENT PRIMARY KEY,",
    "    text VARCHAR(4096) NOT NULL,",
    "    user VARCHAR(128) NOT NULL,",
    "    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
    ");",
  ]
    .join("\n"),
);

export interface ToolResponse {
  name: string;
  input: string;
  output: string;
  id: string;
  kind: "tool-response";
}

export interface ToolRequest {
  id: string;
  name: string;
  input: string;
  kind: "tool-request";
}
