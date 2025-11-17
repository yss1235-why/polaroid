import { useState, useEffect } from "react";
import { cloudinaryService } from "@/services/cloudinary";

interface CloudinaryAccountInfo {
  currentAccount: 1 | 2;
  account1Failed: boolean;
  isUsingBackup: boolean;
}

export const useCloudinaryAccount = () => {
  const [accountInfo, setAccountInfo] = useState<CloudinaryAccountInfo>({
    currentAccount: 1,
    account1Failed: false,
    isUsingBackup: false,
  });

  useEffect(() => {
    const checkAccountStatus = () => {
      const info = cloudinaryService.getAccountInfo();
      setAccountInfo({
        currentAccount: info.currentAccount,
        account1Failed: info.account1Failed,
        isUsingBackup: info.currentAccount === 2,
      });
    };

    // Check initially
    checkAccountStatus();

    // Check every 30 seconds
    const interval = setInterval(checkAccountStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  const resetAccounts = () => {
    cloudinaryService.resetAccounts();
    setAccountInfo({
      currentAccount: 1,
      account1Failed: false,
      isUsingBackup: false,
    });
  };

  return {
    ...accountInfo,
    resetAccounts,
  };
};
