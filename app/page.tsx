"use client";

import { message } from "antd";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleConnect = async () => {
    console.log("COnnect");
    const response = await axios.get("/api/instagram/auth/connect");
    const url = response?.data?.url;

    console.log("Url = ", url);

    if (!url) {
      message.error("Something went wrong!");
      return;
    }

    router.push(url);
  };

  return <button onClick={handleConnect}>Connect to Instagram</button>;
}
