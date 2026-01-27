import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Select,
  Button,
  Upload,
  Modal,
  message,
  Typography,
  Space,
  Empty,
  Spin,
  Popconfirm,
  Input,
  Image,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  LoadingOutlined,
  CloseCircleFilled,
} from "@ant-design/icons";
import { apiService } from "../../../../manageApi/utils/custom.apiservice";

const { Title } = Typography;
const { Meta } = Card;

const API_PREFIX = "/estimate/master/category";

/* ---------- SAFE ID EXTRACTOR ---------- */
const getImageId = (img) => {
  if (!img) return null;
  if (typeof img._id === "string") return img._id;
  if (typeof img.id === "string") return img.id;
  if (typeof img.imageId === "string") return img.imageId;
  if (img._id?.$oid) return img._id.$oid;
  return null;
};

const TypesGallery = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [types, setTypes] = useState([]);

  const [selectedCat, setSelectedCat] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  const [gallery, setGallery] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [uploadModal, setUploadModal] = useState({
    open: false,
    type: "", // preview | moodboard
    title: "",
    uploadedUrl: "",
    preview: "",
  });

  /* ---------- FETCH CATEGORIES ---------- */
  useEffect(() => {
    apiService
      .get(API_PREFIX)
      .then((res) => setCategories(res.categories || res.data || []))
      .catch(() => message.error("Failed to load categories"));
  }, []);

  const handleCatChange = async (val) => {
    setSelectedCat(val);
    setSelectedSub(null);
    setSelectedType(null);
    setGallery(null);

    const res = await apiService.get(`${API_PREFIX}/${val}/subcategories`);
    setSubcategories(res.data || []);
  };

  const handleSubChange = async (val) => {
    setSelectedSub(val);
    setSelectedType(null);
    setGallery(null);

    const res = await apiService.get(
      `${API_PREFIX}/${selectedCat}/subcategories/${val}/types`
    );
    setTypes(res.data || []);
  };

  /* ---------- FETCH GALLERY ---------- */
  const fetchGallery = useCallback(async () => {
    if (!selectedType) return;
    setLoading(true);
    try {
      const res = await apiService.get(
        `${API_PREFIX}/types/${selectedType}/gallery`
      );
      setGallery(res.gallery || null);
    } catch {
      setGallery(null);
    } finally {
      setLoading(false);
    }
  }, [selectedType]);

  useEffect(() => {
    if (selectedType) fetchGallery();
  }, [selectedType, fetchGallery]);

  /* ---------- UPLOAD FILE ---------- */
  const handleFilePick = async (file) => {
    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await apiService.post("/upload", formData);
      const uploadedUrl =
        res?.file?.url || res?.data?.file?.url || res?.data?.url;

      if (!uploadedUrl) throw new Error("Upload URL missing");

      setUploadModal((p) => ({
        ...p,
        uploadedUrl,
        preview: uploadedUrl,
      }));

      message.success("Image uploaded");
    } catch (err) {
      console.error(err);
      message.error("Upload failed");
    } finally {
      setActionLoading(false);
    }

    return false;
  };

  const removeImage = () => {
    setUploadModal((p) => ({
      ...p,
      uploadedUrl: "",
      preview: "",
    }));
  };

  /* ---------- SAVE DATA ---------- */
  const submitData = async () => {
    const { type, title, uploadedUrl } = uploadModal;
    if (!uploadedUrl) return message.error("Upload image first");

    setActionLoading(true);
    try {
      if (type === "moodboard") {
        await apiService.post(
          `${API_PREFIX}/types/${selectedType}/gallery/moodboard`,
          {
            moodBoardImages: [{ title: title || "Untitled", url: uploadedUrl }],
          }
        );
      } else {
        await apiService.post(
          `${API_PREFIX}/types/${selectedType}/gallery/preview`,
          {
            previewFile: { title: title || "Preview", url: uploadedUrl },
          }
        );
      }

      message.success("Saved successfully");
      fetchGallery();
      setUploadModal({
        open: false,
        type: "",
        title: "",
        uploadedUrl: "",
        preview: "",
      });
    } catch (err) {
      console.error(err);
      message.error("Save failed");
    } finally {
      setActionLoading(false);
    }
  };

  /* ---------- DELETE ---------- */
  const deleteImage = async (id, type) => {
    const url =
      type === "preview"
        ? `${API_PREFIX}/types/${selectedType}/gallery/preview`
        : `${API_PREFIX}/types/${selectedType}/gallery/moodboard/${id}`;

    try {
      await apiService.delete(url);
      message.success("Deleted");
      fetchGallery();
    } catch (err) {
      console.error(err);
      message.error("Delete failed");
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="p-6 bg-[#f0f2f5] min-h-screen">
      <div className="max-w-7xl mx-auto">

        {/* FILTERS */}
        <Card className="mb-6">
          <div className="grid md:grid-cols-3 gap-6">
            <Select placeholder="Category" onChange={handleCatChange}>
              {categories.map((c) => (
                <Select.Option key={c._id} value={c._id}>{c.name}</Select.Option>
              ))}
            </Select>

            <Select placeholder="Subcategory" disabled={!selectedCat} onChange={handleSubChange}>
              {subcategories.map((s) => (
                <Select.Option key={s._id} value={s._id}>{s.label}</Select.Option>
              ))}
            </Select>

            <Select placeholder="Master Type" disabled={!selectedSub} onChange={setSelectedType}>
              {types.map((t) => (
                <Select.Option key={t._id} value={t._id}>{t.label}</Select.Option>
              ))}
            </Select>
          </div>
        </Card>

        {loading ? <Spin /> : selectedType ? (
          <>
            <div className="flex justify-between mb-4">
              <Title level={4}>Moodboard</Title>
              <Button icon={<PlusOutlined />} onClick={() =>
                setUploadModal({ open: true, type: "moodboard", title: "", uploadedUrl: "", preview: "" })
              }>
                Add Image
              </Button>
            </div>

            {gallery?.moodboardImages?.length ? (
              <div className="grid md:grid-cols-4 gap-6">
                {gallery.moodboardImages.map((img, index) => {
                  const imageId = getImageId(img);
                  return (
                    <Card
                      key={imageId || index}
                      cover={<img src={img.url} className="h-48 w-full object-cover" />}
                      actions={[
                        <Popconfirm title="Delete?" onConfirm={() => deleteImage(imageId, "moodboard")}>
                          <DeleteOutlined className="text-red-500" />
                        </Popconfirm>,
                      ]}
                    >
                      <Meta title={img.title || "Untitled"} />
                    </Card>
                  );
                })}
              </div>
            ) : <Empty />}
          </>
        ) : <Empty description="Select a master type" />}
      </div>

      {/* UPLOAD MODAL */}
      <Modal
        open={uploadModal.open}
        title={uploadModal.type === "preview" ? "Upload Preview" : "Add Moodboard Image"}
        onOk={submitData}
        onCancel={() => setUploadModal({ open: false, type: "", title: "", uploadedUrl: "", preview: "" })}
      >
        <Space direction="vertical" className="w-full">
          {!uploadModal.uploadedUrl ? (
            <Upload beforeUpload={handleFilePick} showUploadList={false}>
              <Button>Select Image</Button>
            </Upload>
          ) : (
            <div className="relative">
              <Image src={uploadModal.preview} />
              <CloseCircleFilled
                onClick={removeImage}
                className="absolute top-2 right-2 text-red-500 text-xl cursor-pointer"
              />
            </div>
          )}

          <Input
  placeholder="Image title"
  value={uploadModal.title}
  className="text-center" // ✅ Ye line add kari hai center alignment ke liye
  onChange={(e) =>
    setUploadModal((p) => ({ ...p, title: e.target.value }))
  }
/>
        </Space>
      </Modal>

      {actionLoading && (
        <div className="fixed inset-0 bg-white/70 flex items-center justify-center">
          <Spin indicator={<LoadingOutlined spin />} />
        </div>
      )}
    </div>
  );
};

export default TypesGallery;
