<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <style>
        @page { margin: 28px; }
        body { font-family: DejaVu Sans, sans-serif; color: #17202a; font-size: 12px; }
        h1,h2,h3,p { margin: 0; }
        .resume {
            border: 1px solid #d9e2ef;
            padding: 28px;
            border-radius: 14px;
        }
        .header { border-bottom: 2px solid #d9e2ef; padding-bottom: 16px; margin-bottom: 18px; }
        .muted { color: #586576; }
        .section { margin-top: 18px; }
        .section-title {
            font-size: 13px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
        }
        .chip {
            display: inline-block;
            background: #eef4fb;
            padding: 6px 10px;
            border-radius: 999px;
            margin: 0 6px 6px 0;
            font-size: 10px;
        }
        .experience-item { margin-bottom: 14px; }
        ul { margin: 8px 0 0 18px; padding: 0; }
        li { margin-bottom: 5px; }
        .template-classic { border-top: 6px solid #8d6e63; }
        .template-tech { border-top: 6px solid #2563eb; }
        .template-creative { border-top: 6px solid #f97316; }
        .template-executive { border-top: 6px solid #111827; }
        .template-global { border-top: 6px solid #0f766e; }
    </style>
</head>
<body>
@php
    $personal = data_get($resume, 'resume_data.personal_info', []);
    $skills = data_get($resume, 'resume_data.skills', []);
    $experience = data_get($resume, 'resume_data.work_experience', []);
    $education = data_get($resume, 'resume_data.education', []);
    $templateClass = match($templateId) {
        'TEMPL_CLASSIC_SERIF' => 'template-classic',
        'TEMPL_TECH_MINIMAL' => 'template-tech',
        'TEMPL_CREATIVE_MODERN' => 'template-creative',
        'TEMPL_EXECUTIVE_BOLD' => 'template-executive',
        default => 'template-global',
    };
@endphp

<div class="resume {{ $templateClass }}">
    <div class="header">
        <h1 style="font-size: 28px;">{{ $personal['full_name'] ?? 'Professional Candidate' }}</h1>
        <p style="font-size: 14px; margin-top: 6px;">{{ $personal['professional_title'] ?? ($resume->target_role ?? 'Professional Resume') }}</p>
        <p class="muted" style="margin-top: 8px;">
            {{ $personal['email'] ?? '' }}
            @if(!empty($personal['phone'])) | {{ $personal['phone'] }} @endif
            @if(!empty($personal['linkedin_url'])) | {{ $personal['linkedin_url'] }} @endif
            @if(!empty($personal['location'])) | {{ $personal['location'] }} @endif
        </p>
    </div>

    <div class="section">
        <div class="section-title">Professional Summary</div>
        <p class="muted">{{ data_get($resume, 'resume_data.summary', '') }}</p>
    </div>

    <div class="section">
        <div class="section-title">Skills</div>
        @foreach(array_filter(array_merge($skills['hard_skills'] ?? [], $skills['tools_technologies'] ?? [], $skills['soft_skills'] ?? [])) as $skill)
            <span class="chip">{{ $skill }}</span>
        @endforeach
    </div>

    <div class="section">
        <div class="section-title">Experience</div>
        @foreach($experience as $item)
            <div class="experience-item">
                <h3 style="font-size: 14px;">{{ $item['role'] ?? '' }} - {{ $item['company'] ?? '' }}</h3>
                <p class="muted" style="margin-top: 4px;">{{ $item['location'] ?? '' }} | {{ $item['duration'] ?? '' }}</p>
                <ul>
                    @foreach(($item['achievements'] ?? []) as $achievement)
                        <li>{{ $achievement }}</li>
                    @endforeach
                </ul>
            </div>
        @endforeach
    </div>

    <div class="section">
        <div class="section-title">Education</div>
        @foreach($education as $item)
            <div style="margin-bottom: 10px;">
                <h3 style="font-size: 13px;">{{ $item['degree'] ?? '' }}</h3>
                <p class="muted" style="margin-top: 4px;">
                    {{ $item['institution'] ?? '' }}
                    @if(!empty($item['year'])) | {{ $item['year'] }} @endif
                    @if(!empty($item['gpa_or_honors'])) | {{ $item['gpa_or_honors'] }} @endif
                </p>
            </div>
        @endforeach
    </div>
</div>
</body>
</html>
