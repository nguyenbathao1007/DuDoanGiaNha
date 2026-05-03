import { useState } from "react";

function HouseForm({ onPredict, loading }) {
  // 🔥 state ban đầu
  const initialState = {
    TotalArea: "",
    YearBuilt: "",
    Neighborhood: "NAmes",
    OverallQual: "5",
    TotalBathrooms: "2",
    GarageCars: "1",
    ExterQual: "TA",
    BsmtQual: "TA",
  };

  const [form, setForm] = useState(initialState);
  const [error, setError] = useState("");

  // 🔄 xử lý thay đổi input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🚀 submit
  const handleSubmit = () => {
    setError("");

    // ❗ validate
    if (!form.TotalArea || form.TotalArea <= 0) {
      setError("Diện tích phải > 0");
      return;
    }

    if (!form.YearBuilt || form.YearBuilt < 1900) {
      setError("Năm xây dựng không hợp lệ");
      return;
    }

    // 🔥 convert dữ liệu gửi API
    const payload = {
      ...form,
      TotalArea: Number(form.TotalArea),
      YearBuilt: Number(form.YearBuilt),
      OverallQual: Number(form.OverallQual),
      TotalBathrooms: Number(form.TotalBathrooms),
      GarageCars: Number(form.GarageCars),
    };

    onPredict(payload);
  };

  // 🔁 reset
  const handleReset = () => {
    setForm(initialState);
    setError("");
  };

  return (
    <div className="card">
      <h2>Nhập thông tin nhà</h2>

      {/* ❗ hiển thị lỗi */}
      {error && <p className="error">{error}</p>}

      <div className="form-grid">
        {/* 1. Tổng diện tích */}
        <div className="form-group">
          <label>Tổng diện tích (sq.ft)</label>
          <input
            type="number"
            name="TotalArea"
            placeholder="VD: 1500"
            min="1"
            value={form.TotalArea}
            onChange={handleChange}
          />
        </div>

        {/* 2. Năm xây dựng */}
        <div className="form-group">
          <label>Năm xây dựng</label>
          <input
            type="number"
            name="YearBuilt"
            placeholder="VD: 2005"
            min="1900"
            value={form.YearBuilt}
            onChange={handleChange}
          />
        </div>

        {/* 3. Khu vực */}
        <div className="form-group">
          <label>Khu vực</label>
          <select name="Neighborhood" value={form.Neighborhood} onChange={handleChange}>
            <option value="Blmngtn">Khu Bloomington Heights</option>
            <option value="Blueste">Khu Bluestem</option>
            <option value="BrDale">Khu Briardale</option>
            <option value="BrkSide">Khu Brookside</option>
            <option value="ClearCr">Khu Clear Creek</option>
            <option value="CollgCr">Khu College Creek</option>
            <option value="Crawfor">Khu Crawford</option>
            <option value="Edwards">Khu Edwards</option>
            <option value="Gilbert">Khu Gilbert</option>
            <option value="IDOTRR">Khu Iowa DOT & Rail Road</option>
            <option value="MeadowV">Khu Meadow Village</option>
            <option value="Mitchel">Khu Mitchell</option>
            <option value="NAmes">Khu North Ames</option>
            <option value="NoRidge">Khu Northridge</option>
            <option value="NPkVill">Khu Northpark Villa</option>
            <option value="NridgHt">Khu Northridge Heights</option>
            <option value="NWAmes">Khu Northwest Ames</option>
            <option value="OldTown">Khu Phố cổ</option>
            <option value="SWISU">Khu South & West ISU</option>
            <option value="Sawyer">Khu Sawyer</option>
            <option value="SawyerW">Khu Sawyer West</option>
            <option value="Somerst">Khu Somerset</option>
            <option value="StoneBr">Khu Stone Brook</option>
            <option value="Timber">Khu Timberland</option>
            <option value="Veenker">Khu Veenker</option>
          </select>
        </div>

        {/* 4. Chất lượng */}
        <div className="form-group">
          <label>Chất lượng tổng thể (1-10)</label>
          <select name="OverallQual" value={form.OverallQual} onChange={handleChange}>
            {[...Array(10)].map((_, i) => (
              <option key={i} value={i + 1}>{i + 1}</option>
            ))}
          </select>
        </div>

        {/* 5. Phòng tắm */}
        <div className="form-group">
          <label>Số phòng tắm</label>
          <select name="TotalBathrooms" value={form.TotalBathrooms} onChange={handleChange}>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </div>

        {/* 6. Gara */}
        <div className="form-group">
          <label>Sức chứa gara</label>
          <select name="GarageCars" value={form.GarageCars} onChange={handleChange}>
            <option value="0">0</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </div>

        {/* 7. Ngoại thất */}
        <div className="form-group">
          <label>Chất lượng ngoại thất</label>
          <select name="ExterQual" value={form.ExterQual} onChange={handleChange}>
            <option value="Ex">Xuất sắc</option>
            <option value="Gd">Tốt</option>
            <option value="TA">Trung bình</option>
            <option value="Fa">Kém</option>
          </select>
        </div>

        {/* 8. Tầng hầm */}
        <div className="form-group">
          <label>Chất lượng tầng hầm</label>
          <select name="BsmtQual" value={form.BsmtQual} onChange={handleChange}>
            <option value="Ex">Xuất sắc</option>
            <option value="Gd">Tốt</option>
            <option value="TA">Trung bình</option>
            <option value="Fa">Kém</option>
            <option value="None">Không có</option>
          </select>
        </div>
      </div>

      {/* 🔥 BUTTON */}
      <div style={{ marginTop: "15px" }}>
        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Đang dự đoán..." : "Dự đoán giá"}
        </button>

        <button className="btn-secondary" onClick={handleReset}>
          Nhập lại
        </button>
      </div>
    </div>
  );
}

export default HouseForm;