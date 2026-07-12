<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $shareTitle }}</title>
    <meta name="description" content="{{ $shareDescription }}">

    <link rel="canonical" href="{{ $articleUrl }}" />

    <meta property="og:type" content="article">
    <meta property="og:site_name" content="SUKAMUDA">
    <meta property="og:url" content="{{ $articleUrl }}">
    <meta property="og:title" content="{{ $shareTitle }}">
    <meta property="og:description" content="{{ $shareDescription }}">
    <meta property="og:image" content="{{ $shareImage }}">
    <meta property="og:image:secure_url" content="{{ $shareImage }}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="{{ $shareUrl }}">
    <meta name="twitter:title" content="{{ $shareTitle }}">
    <meta name="twitter:description" content="{{ $shareDescription }}">
    <meta name="twitter:image" content="{{ $shareImage }}">

    <script type="application/ld+json">
        {!! $schemaMarkup !!}
    </script>

    <meta http-equiv="refresh" content="0; url={{ $articleUrl }}">

    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f7f9fa;
            color: #333;
        }
        .container {
            text-align: center;
            padding: 30px 20px;
            border-radius: 12px;
            background: white;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
            max-width: 400px;
            width: 90%;
        }
        .loader {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #d83a34;
            border-radius: 50%;
            width: 35px;
            height: 35px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        p {
            margin: 10px 0;
            font-size: 16px;
        }
        a {
            color: #d83a34;
            text-decoration: none;
            font-weight: bold;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="loader"></div>
        <p>Mengarahkan Anda ke portal utama SUKAMUDA...</p>
        <p>Jika tidak berpindah otomatis, <a href="{{ $articleUrl }}">klik di sini</a>.</p>
    </div>

    <script>
        window.location.href = "{{ $articleUrl }}";
    </script>
</body>
</html>