import React, { useState } from "react";
import { Card, Table, Select, Button } from "antd";

const AgencyAssignProjects = () => {
  const [assignments, setAssignments] = useState([]);

  const agents = ["Rahul Sharma", "Priya Mehta"];
  const projects = ["Palm Residency", "Sky Heights"];

  const handleAssign = (agent, project) => {
    setAssignments([...assignments, { key: Date.now(), agent, project }]);
  };

  const columns = [
    { title: "Agent", dataIndex: "agent" },
    { title: "Project", dataIndex: "project" },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card title="Assign Projects to Agents">
        <Select
          placeholder="Select Agent"
          style={{ width: 200, marginRight: 10 }}
          onChange={(value) => (window.selectedAgent = value)}
        >
          {agents.map((a) => (
            <Select.Option key={a} value={a}>
              {a}
            </Select.Option>
          ))}
        </Select>

        <Select
          placeholder="Select Project"
          style={{ width: 200, marginRight: 10 }}
          onChange={(value) => (window.selectedProject = value)}
        >
          {projects.map((p) => (
            <Select.Option key={p} value={p}>
              {p}
            </Select.Option>
          ))}
        </Select>

        <Button
          type="primary"
          onClick={() =>
            handleAssign(window.selectedAgent, window.selectedProject)
          }
        >
          Assign
        </Button>

        <Table
          style={{ marginTop: 20 }}
          columns={columns}
          dataSource={assignments}
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default AgencyAssignProjects;