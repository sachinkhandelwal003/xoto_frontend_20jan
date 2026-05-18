import React from "react";
import { motion } from "framer-motion";

const ChatBoat = ({ onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full h-full bg-white flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="bg-purple-600 text-white px-4 py-3 font-semibold flex justify-between items-center">
        <span>Xobia AI Assistant</span>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-purple-700 text-xl leading-none"
        >
          ×
        </button>
      </div>

      {/* Widget */}
      <div className="flex-1">
        <vapi-widget
          public-key="0c5b3eb5-76fc-46ce-a227-889f321291f6"
          assistant-id="2e5fdf84-bb62-4ea7-a620-ae5cb40d264a"
          mode="chat"
          theme="light"
          style={{ width: "100%", height: "100%" }}
        ></vapi-widget>
      </div>
    </motion.div>
  );
};

export default ChatBoat;
