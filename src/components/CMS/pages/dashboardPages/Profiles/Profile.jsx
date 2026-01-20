import React from "react";
import { useSelector } from "react-redux";
import MyProfile from "./MyProfile";
import VendorMYProfile from "./VendorMYProfile";
i

const Profile = () => {
  const { user } = useSelector((state) => state.auth);

  // Safety check (in case user is null)
  if (!user || !user.role) {
    return <div>No user found</div>;
  }

  const isFreelancer = user.role.name?.toLowerCase() === "freelancer";

  return (
    <>
      {isFreelancer ? (
        <MyProfile />
      ) : (
        <VendorMYProfile />
      )}
    </>
  );
};

export default Profile;
