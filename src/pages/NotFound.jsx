import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const NotFound = () => {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        textAlign: "center",
        padding: "40px 20px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <Helmet>
        <title>Halaman Tidak Ditemukan - SukaMuda</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <h1 style={{ margin: 0, fontSize: "48px", color: "#111" }}>404</h1>
      <p style={{ margin: 0, color: "#595959", fontSize: "15px" }}>
        Halaman yang kamu cari tidak ditemukan atau sudah dipindahkan.
      </p>
      <Link
        to="/"
        style={{
          color: "#d83a34",
          fontWeight: 600,
          textDecoration: "none",
          fontSize: "15px",
          marginTop: "8px",
        }}
      >
        ← Kembali ke Beranda
      </Link>
    </div>
  );
};

export default NotFound;