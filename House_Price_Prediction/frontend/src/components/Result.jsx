function Result({ price }) {
  return (
    <div className="result-box">
      <h3>Giá nhà ước tính (mô hình AI)</h3>
      <h1>${Number(price).toLocaleString()}</h1>
      <p>Dự đoán bởi mô hình AI</p>
    </div>
  );
}

export default Result;