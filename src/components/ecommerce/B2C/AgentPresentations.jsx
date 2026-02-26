import {
  Card,
  Typography,
  Row,
  Col,
  Tag,
  Button,
  Space,
  Input,
  Select,
  Dropdown,
  Menu
} from "antd";
import {
  FilePdfOutlined,
  ShareAltOutlined,
  EyeOutlined,
  MoreOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

export default function AgentPresentations() {

  const presentations = [
    {
      id: 1,
      client: "Mr. Ahmed Khan",
      project: "Sky Tower Residences",
      location: "Downtown Dubai",
      price: "AED 1,250,000",
      date: "20 Feb 2026",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
    },
    {
      id: 2,
      client: "Ms. Fatima Noor",
      project: "Palm Heights",
      location: "Palm Jumeirah",
      price: "AED 2,850,000",
      date: "18 Feb 2026",
      image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d"
    },
    {
      id: 3,
      client: "Mr. Rahul Sharma",
      project: "Downtown View",
      location: "Business Bay",
      price: "AED 980,000",
      date: "15 Feb 2026",
      image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d"
    }
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      {/* PAGE HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <Title level={2} className="!mb-1">
            My Presentations
          </Title>
          <Text type="secondary">
            View and manage all client presentations
          </Text>
        </div>

        <Space>
          <Input.Search placeholder="Search client / project" />
          <Select defaultValue="latest" style={{ width: 150 }}>
            <Option value="latest">Latest</Option>
            <Option value="oldest">Oldest</Option>
          </Select>
        </Space>
      </div>

      {/* PRESENTATIONS GRID */}
      <Row gutter={[24, 24]}>

        {presentations.map((item) => (

          <Col xs={24} sm={12} lg={8} key={item.id}>

            <Card
              bordered={false}
              className="rounded-2xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden"
              bodyStyle={{ padding: 0 }}
            >

              {/* Property Image */}
              <div className="relative">
                <img
                  src={item.image}
                  alt="property"
                  className="w-full h-52 object-cover"
                />

                <div className="absolute top-3 right-3">
                  <Dropdown
                    overlay={
                      <Menu>
                        <Menu.Item key="1">Edit</Menu.Item>
                        <Menu.Item key="2">Delete</Menu.Item>
                      </Menu>
                    }
                  >
                    <Button
                      shape="circle"
                      icon={<MoreOutlined />}
                    />
                  </Dropdown>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">

                <Title level={5} className="!mb-1">
                  {item.project}
                </Title>

                <Tag color="blue" className="mb-2">
                  For: {item.client}
                </Tag>

                <div className="text-gray-600 text-sm space-y-1 mb-4">
                  <div>📍 {item.location}</div>
                  <div>💰 {item.price}</div>
                  <div>🗓 Generated on {item.date}</div>
                </div>

                <Space direction="vertical" className="w-full">

                  <Button
                    icon={<EyeOutlined />}
                    block
                    className="rounded-xl"
                  >
                    View Presentation
                  </Button>

                  <Button
                    icon={<FilePdfOutlined />}
                    block
                    className="rounded-xl"
                  >
                    Download PDF
                  </Button>

                  <Button
                    type="primary"
                    icon={<ShareAltOutlined />}
                    block
                    className="rounded-xl"
                  >
                    Share Link
                  </Button>

                </Space>

              </div>

            </Card>

          </Col>

        ))}

      </Row>

    </div>
  );
}