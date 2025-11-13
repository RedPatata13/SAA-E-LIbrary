import React, { useState } from "react";
import AccountPage from "../components/accountPage";

const PersonalAccount: React.FC = () => {
return <AccountPage isAdmin={true} />;
};

export default PersonalAccount;