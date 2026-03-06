import { Form, Input, Button, Card, Select, message, Space } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api/property";

export default function DeveloperAddUnit() {

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {

    const developerId = localStorage.getItem("developerId");
    const projectId = localStorage.getItem("selectedProject");

    if (!developerId || !projectId) {
      message.error("Please select project first from inventory page");
      return;
    }

    setLoading(true);

    try {

      const res = await fetch(`${API}/create-inventory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          developerId,
          projectId,
          unitId: values.unitId,
          area: values.area,
          price: values.price,
          view: values.view,
          status: values.status
        })
      });

      const data = await res.json();

      if (data.success) {

        message.success("Unit Added Successfully");

        // redirect back to inventory
        setTimeout(() => {
          navigate("/dashboard/developer/inventory");
        }, 700);

      } else {
        message.error(data.message);
      }

    } catch (error) {

      message.error("Failed to add unit");

    }

    setLoading(false);

  };

  return (

    <Card
      title="Add New Unit"
      extra={
        <Button onClick={() => navigate("/dashboard/developer/inventory")}>
          Back
        </Button>
      }
    >

      <Form layout="vertical" onFinish={onFinish}>

        <Form.Item
          label="Unit ID"
          name="unitId"
          rules={[{ required: true, message: "Unit ID is required" }]}
        >
          <Input placeholder="A101" />
        </Form.Item>

        <Form.Item
          label="Area (sqft)"
          name="area"
          rules={[{ required: true, message: "Area is required" }]}
        >
          <Input type="number" placeholder="1200" />
        </Form.Item>

        <Form.Item
          label="Price"
          name="price"
          rules={[{ required: true, message: "Price is required" }]}
        >
          <Input type="number" placeholder="8000000" />
        </Form.Item>

        <Form.Item
          label="View"
          name="view"
        >
          <Input placeholder="Sea View / Garden View / Road View" />
        </Form.Item>

        <Form.Item
          label="Status"
          name="status"
          initialValue="Available"
        >
          <Select
            options={[
              { label: "Available", value: "Available" },
              { label: "Booked", value: "Booked" },
              { label: "Blocked", value: "Blocked" },
              { label: "Sold", value: "Sold" }
            ]}
          />
        </Form.Item>

        <Space>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
          >
            Add Unit
          </Button>

          <Button
            onClick={() => navigate("/dashboard/developer/inventory")}
          >
            Cancel
          </Button>

        </Space>

      </Form>

    </Card>

  );

}