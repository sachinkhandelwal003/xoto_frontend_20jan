import React, { useEffect, useState } from "react";
import { Card, Typography, Row, Col, Spin, Empty, Select, notification } from "antd"; // ✅ notification added
import { apiService } from "../../../../manageApi/utils/custom.apiservice";
import { Download } from "lucide-react"; // ✅ Download icon added

const { Title, Text } = Typography;
const { Option } = Select;

const ViewLibrary = () => {
  const [displayData, setDisplayData] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Landscaping"); // Default value

  // Category ke hisaab se API fetch karne ka function
  const fetchLibrary = async (category) => {
    try {
      setLoading(true);
      let endpoint = "";

      // 1. EXACT Endpoints mapped from your app.js routes
      if (category === "Landscaping") {
        endpoint = "/ai/get-landscape-designs";
      } 
      else if (category === "Interior AI") {
        endpoint = "/ai/get-interior-designs";
      } 
      else if (category === "Sky Replacement") {
        endpoint = "/ai/sky-replacement/get-sky-library"; 
      } 
      else if (category === "Virtual Staging") {
        endpoint = "/ai/virtual-staging/get-staging-library"; 
      } 
      else if (category === "Image Enhancer") {
        endpoint = "/ai/enhance/get-customer-liabrary"; 
      } 
      else {
        setDisplayData([]);
        setLoading(false);
        return;
      }

      console.log(`Fetching from: ${endpoint}`);

      // 2. Data fetch karna
      const res = await apiService.get(endpoint);
      console.log(`Raw API Response for ${category}:`, res);

      // 3. BULLETPROOF Data Extraction (Backend se format chahe jo ho, data nikal aayega)
      let rawData = [];
      if (Array.isArray(res)) {
        rawData = res; // Direct array (Landscaping/Interior)
      } else if (res?.data && Array.isArray(res.data)) {
        rawData = res.data; // res.data (Virtual Staging)
      } else if (res?.data?.data && Array.isArray(res.data.data)) {
        rawData = res.data.data; // res.data.data (Sky API mostly uses this)
      } else if (res?.data?.images && Array.isArray(res.data.images)) {
        rawData = res.data.images; 
      }

      console.log(`Extracted Data Array for ${category}:`, rawData);

      // 4. ULTRA BULLETPROOF Data Mapping
      let formatted = [];

      rawData.forEach((item, index) => {
        // Case 1: Agar backend direct string (URL) bhej raha hai
        if (typeof item === "string") {
          formatted.push({ id: index, image: item, category });
        } 
        // Case 2: Agar image 'images' array ke andar hai (Jaise Image Enhancer me hota hai)
        else if (item.images && Array.isArray(item.images)) {
          item.images.forEach((imgUrl, i) => {
            formatted.push({
              id: item._id ? `${item._id}-${i}` : `${index}-${i}`,
              image: imgUrl,
              category
            });
          });
        } 
        // Case 3: Agar normal object hai to saari possible keys check kar lo
        else {
          // 🔥 YAHAN PAR SABHI KEYS HAIN INCL. stagedImage?.url 🔥
          const imgUrl = item.imageUrl || item.image || item.url || item.enhancedImage || item.enhancedUrl || item.output || item.stagedImage?.url;
          
          if (imgUrl) {
            formatted.push({ id: item._id || index, image: imgUrl, category });
          }
        }
      });

      console.log(`Final Valid Images for UI:`, formatted);
      setDisplayData(formatted);

    } catch (error) {
      console.error(`❌ ${category} fetch failed:`, error);
      setDisplayData([]); // Error aane par page empty dikhega, phatega nahi
    } finally {
      setLoading(false);
    }
  };

  // ✅ 100% WORKING PDF DOWNLOAD LOGIC
  const downloadImage = async (imageUrl, categoryName) => {
    try {
      const key = imageUrl.split(".amazonaws.com/")[1];

      if (!key) {
        notification.error({ message: "Invalid Image URL" });
        return;
      }

      // PDF API Hit karega seedha
      await apiService.download(
        `/download-pdf?key=${encodeURIComponent(key)}`,
        `XOTO_${categoryName}_${Date.now()}.pdf`
      );

    } catch (error) {
      console.error("Download error:", error);
      notification.error({
        message: "Download Failed",
        description: "PDF could not be generated."
      });
    }
  };

  // Dropdown change hone par naya data fetch karne ka function
  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    fetchLibrary(value); 
  };

  // Page load hote hi default (Landscaping) ka data layega
  useEffect(() => {
    fetchLibrary(selectedCategory);
  }, []);

  return (
    <div style={{ padding: "40px", background: "#f8f9fa", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
        <div>
          <Title level={1} style={{ margin: 0, fontWeight: 600, fontSize: "36px" }}>
            View Library
          </Title>
          <Text type="secondary" style={{ fontSize: "16px" }}>
            Browse your AI generated designs
          </Text>
        </div>

        {/* --- Dropdown --- */}
        <Select 
          value={selectedCategory} 
          style={{ width: 220 }} 
          onChange={handleCategoryChange}
          size="large"
        >
          <Option value="Landscaping">Landscaping</Option>
          <Option value="Interior AI">Interior AI</Option>
          <Option value="Virtual Staging">Virtual Staging</Option>
          <Option value="Sky Replacement">Sky Replacement</Option>
          <Option value="Image Enhancer">Image Enhancer</Option>
        </Select>
      </div>

      {/* Loading & Content */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "100px" }}>
          <Spin size="large" />
        </div>
      ) : displayData.length === 0 ? (
        <div style={{ marginTop: "100px" }}>
          <Empty description={`No images found for ${selectedCategory}`} />
        </div>
      ) : (
        <Row gutter={[32, 32]}>
          {displayData.map((item) => (
            <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
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
                  <div className="img-container">
                    <img
                      src={item.image}
                      alt={selectedCategory}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        transition: "0.4s"
                      }}
                      className="card-img"
                    />
                    {/* ✅ DOWNLOAD HOVER OVERLAY ADDED */}
                    <div className="overlay">
                      <button 
                        className="download-btn"
                        onClick={(e) => {
                          e.stopPropagation(); // Card click event ko rokne ke liye
                          downloadImage(item.image, selectedCategory.replace(/\s+/g, ''));
                        }}
                      >
                        <Download size={24} />
                      </button>
                      <span style={{ color: "white", fontSize: "12px", fontWeight: "bold", letterSpacing: "1px", textTransform: "uppercase" }}>
                        Download
                      </span>
                    </div>
                  </div>
                }
              />
            </Col>
          ))}
        </Row>
      )}

      {/* ✅ CSS STYLES FOR OVERLAY AND HOVER EFFECT */}
      <style>
        {`
        .img-container {
          position: relative;
          overflow: hidden;
          height: 320px;
        }

        .overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          opacity: 0;
          transition: 0.3s ease-in-out;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 12px;
          backdrop-filter: blur(2px);
        }

        .img-container:hover .overlay {
          opacity: 1;
        }

        .download-btn {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          border-radius: 50%;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: 0.3s;
        }

        .download-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }

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