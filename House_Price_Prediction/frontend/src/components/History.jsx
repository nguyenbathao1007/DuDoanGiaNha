function History({ data }) {
  return (
    <div className="history">
      <h3>📜 Lịch sử dự đoán</h3>

      {data.length === 0 && <p>Chưa có dữ liệu</p>}

      {data.map((item) => (
        <div key={item.id} className="history-item">
          <p> ${Number(item.predicted_price).toLocaleString()}</p>
          <p> {item.TotalArea} sq.ft</p>
          <p> {item.Neighborhood}</p>
          <p> {new Date(item.created_at).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}

export default History;