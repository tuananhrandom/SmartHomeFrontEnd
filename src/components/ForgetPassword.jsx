import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "../styles/auth.css";
import { BACKEND_URL } from "../config/api";
const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError("Vui lòng nhập email của bạn");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Đảm bảo xóa token trước khi gửi yêu cầu quên mật khẩu
      localStorage.removeItem('token');
      
      const response = await fetch(`${BACKEND_URL}/api/auth/forget?email=${email}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
        // Không gửi token Authorization
      });

      // Kiểm tra nếu response không phải JSON
      const contentType = response.headers.get("content-type");
      let data;
      
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text || "Đã nhận phản hồi không hợp lệ từ máy chủ" };
      }

      if (!response.ok) {
        throw new Error(data.message || "Không thể đặt lại mật khẩu");
      }

      setSuccess(data.message || "Mật khẩu mới đã được gửi tới email của bạn");
      
      // Chuyển hướng về trang đăng nhập sau 3 giây
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      console.error("Lỗi quên mật khẩu:", error);
      setError(error.message || "Đã xảy ra lỗi, vui lòng thử lại sau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Quên mật khẩu</h2>
        <p className="auth-description">
          Nhập email của bạn để nhận mật khẩu mới
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Nhập email của bạn"
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button 
            type="submit" 
            className="auth-button" 
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Gửi yêu cầu"}
          </button>

          <div className="auth-links">
            <Link to="/login">Quay lại đăng nhập</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgetPassword;