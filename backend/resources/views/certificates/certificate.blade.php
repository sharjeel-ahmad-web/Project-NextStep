<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Certificate of Completion | NextStep AI</title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Playfair+Display:ital,wght@1,600&family=Source+Serif+Pro:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        @page {
            margin: 0;
            size: A4 landscape;
        }

        body {
            font-family: 'Roboto', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #ffffff;
            color: #1f2937;
            width: 100%;
            height: 100vh;
            -webkit-font-smoothing: antialiased;
        }

        .certificate-wrapper {
            width: 100%;
            height: 100%;
            padding: 40px;
            box-sizing: border-box;
            background-color: #ffffff;
            position: relative;
            border: 20px solid #f3f4f6; /* Outer thick light border */
        }

        .inner-frame {
            border: 1px solid #d1d5db;
            height: 100%;
            position: relative;
            padding: 60px 80px;
            box-sizing: border-box;
            background-image: radial-gradient(#f3f4f6 1px, transparent 1px);
            background-size: 20px 20px; /* Subtle dot pattern instead of guilloche for simplicity in PDF */
        }

        /* --- Right Banner Section --- */
        .right-banner {
            position: absolute;
            top: 0;
            right: 80px;
            width: 180px;
            height: 550px;
            background-color: #f1f5f9;
            text-align: center;
            padding-top: 60px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .banner-text {
            font-family: 'Roboto', sans-serif;
            font-size: 20px;
            letter-spacing: 2px;
            color: #475569;
            text-transform: uppercase;
            font-weight: 500;
            line-height: 1.4;
        }

        .seal-container {
            margin-top: 180px;
            position: relative;
        }

        .seal-circle {
            width: 130px;
            height: 130px;
            border: 2px dashed #94a3b8;
            border-radius: 50%;
            display: inline-block;
            padding: 5px;
        }

        .seal-inner {
            width: 116px;
            height: 116px;
            border: 1px solid #94a3b8;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Roboto', sans-serif;
            font-weight: 700;
            font-size: 14px;
            color: #475569;
            text-transform: uppercase;
            padding: 10px;
            box-sizing: border-box;
        }

        /* --- Header / Logo --- */
        .header {
            margin-bottom: 80px;
        }

        .logo-text {
            font-size: 42px;
            font-weight: 700;
            letter-spacing: -1px;
        }

        .logo-next { color: #4285F4; } /* Google Blue */
        .logo-step { color: #EA4335; } /* Google Red */
        .logo-ai   { color: #FBBC05; } /* Google Gold */

        /* --- Content Area --- */
        .content {
            max-width: 65%;
        }

        .issued-date {
            font-size: 14px;
            color: #64748b;
            margin-bottom: 10px;
        }

        .learner-name {
            font-family: 'Source Serif Pro', serif;
            font-size: 58px;
            font-weight: 600;
            color: #111827;
            margin: 0 0 25px 0;
        }

        .success-text {
            font-size: 14px;
            color: #64748b;
            margin-bottom: 25px;
        }

        .course-title {
            font-family: 'Source Serif Pro', serif;
            font-size: 28px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 10px;
        }

        .course-description {
            font-size: 14px;
            color: #64748b;
            line-height: 1.6;
        }

        /* --- Signatures --- */
        .footer-section {
            position: absolute;
            bottom: 80px;
            left: 80px;
            width: 85%;
        }

        .signature-area {
            float: left;
            width: 300px;
        }

        .signature-img {
            font-family: 'Playfair Display', serif;
            font-style: italic;
            font-size: 32px;
            color: #000000;
            border-bottom: 1px solid #111827;
            padding-bottom: 5px;
            margin-bottom: 10px;
        }

        .signature-name {
            font-size: 13px;
            font-weight: 500;
            color: #111827;
            margin: 0;
        }

        .signature-title {
            font-size: 12px;
            color: #64748b;
            margin: 2px 0 0 0;
        }

        /* --- Verification Info --- */
        .verify-area {
            float: right;
            text-align: right;
            margin-top: 20px;
        }

        .verify-label {
            font-size: 12px;
            color: #64748b;
            margin-bottom: 4px;
        }

        .verify-link {
            font-size: 12px;
            color: #2563eb;
            text-decoration: underline;
        }

        .verify-disclaimer {
            font-size: 10px;
            color: #94a3b8;
            margin-top: 8px;
            max-width: 300px;
            line-height: 1.4;
        }

        /* --- Legal Footer --- */
        .legal-footer {
            position: absolute;
            bottom: 20px;
            left: 0;
            width: 100%;
            text-align: center;
            font-size: 9px;
            color: #94a3b8;
            padding: 0 80px;
            box-sizing: border-box;
        }

        .qr-code-tiny {
            position: absolute;
            bottom: 80px;
            right: 0;
            width: 60px;
            height: 60px;
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <div class="certificate-wrapper">
        <div class="inner-frame">
            
            <!-- Right Sidebar Banner -->
            <div class="right-banner">
                <div class="banner-text">COURSE<br>CERTIFICATE</div>
                
                <div class="seal-container">
                    <div class="seal-circle">
                        <div class="seal-inner">
                            NEXTSTEP<br>CERTIFIED
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Header -->
            <div class="header">
                <div class="logo-text">
                    <span class="logo-next">Next</span><span class="logo-step">Step</span> <span class="logo-ai">AI</span>
                </div>
            </div>

            <!-- Main Content -->
            <div class="content">
                <div class="issued-date">{{ $issued_at }}</div>
                
                <h1 class="learner-name">{{ $user_name }}</h1>
                
                <div class="success-text">has successfully completed</div>
                
                <h2 class="course-title">{{ $target_role }} Professional Roadmap</h2>
                
                <div class="course-description">
                    an online learning roadmap authorized by NextStep AI and offered through our intelligent career acceleration platform. 
                    This program validates proficiency in advanced industry-standard skills and practical application.
                </div>
            </div>

            <!-- Footer Section -->
            <div class="footer-section">
                <div class="signature-area">
                    <div class="signature-img">Sara Mitchell</div>
                    <p class="signature-name">Sara Mitchell</p>
                    <p class="signature-title">Global Director of NextStep AI Career Certifications</p>
                </div>

                <div class="verify-area">
                    <div class="verify-label">Verify at:</div>
                    <a href="{{ $verify_url }}" class="verify-link">{{ str_replace(['http://', 'https://'], '', $verify_url) }}</a>
                    <div class="verify-disclaimer">
                        NextStep AI has confirmed the identity of this individual and their participation in the course.
                    </div>
                </div>

                <div class="qr-code-tiny">
                    <img src="https://chart.googleapis.com/chart?chs=100x100&cht=qr&chl={{ urlencode($verify_url) }}&choe=UTF-8" style="width: 100%; height: 100%;">
                </div>
            </div>

            <!-- Small Legal Footer -->
            <div class="legal-footer">
                This certificate attests to the learner's completion of an online roadmap delivered via NextStep AI. It does not constitute formal enrollment at any university or entity and does not itself grant academic credit, grades, or a degree. Institutions or organizations may, at their discretion, recognize this learning toward their own programs or credentials.
            </div>

        </div>
    </div>
</body>
</html>