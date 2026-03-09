import React, { useEffect, useState } from "react";
import { Card, Typography, Row, Col, Spin, Empty, Select } from "antd"; // Select add kiya
import { apiService } from "../../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;
const { Option } = Select;

const ViewLibrary = () => {
  const [libraryData, setLibraryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]); // Filtered images ke liye
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Landscaping"); // Default value

  const fetchLibrary = async () => {
    try {
      setLoading(true);
      const res = await apiService.get("/ai/get-landscape-designs");
      const designs = res?.data || [];

      const formatted = designs.map((item, index) => ({
        id: item._id || index,
        image: item.imageUrl,
        category: item.category || "Landscaping" // API se category check karne ke liye
      }));

      setLibraryData(formatted);
      // Initial filter: Jo default selected hai wahi dikhega
      setFilteredData(formatted.filter(item => item.category === "Landscaping"));

    } catch (error) {
      console.error("Library fetch failed", error);
    } finally {
      setLoading(false);
    }
  };

  // Dropdown change hone par data filter karne ka function
  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    const filtered = libraryData.filter(item => 
      value === "All" ? true : item.category === value
    );
    setFilteredData(filtered);
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  return (
    <div style={{ padding: "40px", background: "#f8f9fa", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Title level={1} style={{ margin: 0, fontWeight: 600, fontSize: "36px" }}>
            View Library
          </Title>
          <Text type="secondary" style={{ fontSize: "16px" }}>
            Browse your AI generated designs
          </Text>
        </div>

        {/* --- Dropdown Added Here --- */}
        <Select 
          defaultValue="Landscaping" 
          style={{ width: 220 }} 
          onChange={handleCategoryChange}
          size="large"
        >
          <Option value="Landscaping">Landscaping</Option>
          <Option value="Interior AI">Interior AI</Option>
          <Option value="Virtual Staging">Virtual Staging</Option>
          <Option value="SKU Replacement">SKY Replacement</Option>
          <Option value="Image Enhancer">Image Enhancer</Option>
          {/* <Option value="All">All Designs</Option> */}
        </Select>
      </div>

      {/* Loading */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "100px" }}>
          <Spin size="large" />
        </div>
      ) : filteredData.length === 0 ? (

        <Empty description={`No images found for ${selectedCategory}`} />

      ) : (

        <Row gutter={[32, 32]}>

          {filteredData.map((item) => (

            <Col xs={24} sm={12} lg={6} key={item.id}>

              <Card
                hoverable
                styles={{ body: { display: "none" } }}
                style={{
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
                }}

                cover={

                  <div style={{ overflow: "hidden", height: "320px" }}>

                    <img
                      src={item.image}
                      alt="library"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        transition: "0.4s"
                      }}
                      className="card-img"
                    />

                  </div>

                }
              />

            </Col>

          ))}

        </Row>

      )}

      <style>
        {`
        .card-img:hover {
          transform: scale(1.08);
        }

        .ant-card {
          line-height: 0;
        }
        `}
      </style>

    </div>
  );
};

export default ViewLibrary;