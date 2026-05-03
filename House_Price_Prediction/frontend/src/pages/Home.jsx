import { useState, useEffect } from "react";
import { predictPrice, getModelInfo, getHistory } from "../services/api";
import HouseForm from "../components/HouseForm";
import Result from "../components/Result";
import ModelInfo from "../components/ModelInfo";
import History from "../components/History";

function Home() {
  const [price, setPrice] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // load model + history
  useEffect(() => {
    getModelInfo()
      .then(res => setModelInfo(res.data))
      .catch(() => console.log("Backend chưa chạy"));

    getHistory()
      .then(res => setHistory(res.data))
      .catch(() => console.log("Không load được history"));
  }, []);
  const handlePredict = async (data) => {
    setLoading(true);
    setApiError("");
    setPrice(null);

    try {
      const res = await predictPrice(data);
      setPrice(res.data.predicted_price);

      const his = await getHistory();
      setHistory(his.data);
    } catch {
      setApiError("Không thể kết nối API dự đoán. Vui lòng kiểm tra backend server.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="container">
      <h1>🏠 Dự đoán giá nhà</h1>

      <HouseForm onPredict={handlePredict} loading={loading} />

      {apiError && <p className="error">{apiError}</p>}

      {price !== null && <Result price={price} />}

      {modelInfo && <ModelInfo info={modelInfo} />}

      <History data={history} />
    </div>
  );
}

export default Home;