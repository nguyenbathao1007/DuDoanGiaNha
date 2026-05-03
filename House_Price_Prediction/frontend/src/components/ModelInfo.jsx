function ModelInfo({ info }) {
  return (
    <div className="model-info">
      <h3>Thông tin mô hình</h3>
      <p>Model: {info.model}</p>
      <p>RMSE: {info.rmse}</p>
      <p>Train time: {info.train_time}</p>
    </div>
  );
}

export default ModelInfo;