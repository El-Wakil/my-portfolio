<?php
// Basic security and JSON response header
header('Content-Type: application/json; charset=utf-8');

// Allow only POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method Not Allowed']);
    exit;
}

// Helper to sanitize
function field($key) {
    return isset($_POST[$key]) ? trim(strip_tags($_POST[$key])) : '';
}

$name    = field('name');
$email   = field('email');
$subject = field('subject');
$budget  = field('Budget'); // matches form name
$message = field('message');

if (!$name || !$email || !$subject || !$message) {
    http_response_code(422);
    echo json_encode(['status' => 'error', 'message' => 'Please fill all required fields.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['status' => 'error', 'message' => 'Invalid email address.']);
    exit;
}

// Configure destination email (CHANGE THIS TO YOUR EMAIL)
$to = 'm7.elwakil@gmail.com';

$siteName = 'Portfolio Contact Form';
$subjectLine = '[' . $siteName . '] ' . $subject;

// Build HTML email body
$time = date('Y-m-d H:i:s');
$ip   = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

$html = "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\"><title>New Message</title>".
    "<style>body{font-family:Arial,Helvetica,sans-serif;background:#f5f7fb;margin:0;padding:30px;color:#1a1f2c;}".
    ".card{max-width:620px;margin:0 auto;background:#ffffff;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,.06);overflow:hidden;}".
    ".header{background:#1a1f2c;padding:20px 24px;color:#fff;}".
    ".header h2{margin:0;font-size:20px;font-weight:600;letter-spacing:.5px;}".
    ".content{padding:24px;}h3{margin-top:0;}".
    ".meta-table{width:100%;border-collapse:collapse;margin:16px 0;}".
    ".meta-table th,.meta-table td{text-align:left;padding:10px 12px;font-size:14px;}".
    ".meta-table th{background:#f0f2f7;width:140px;font-weight:600;}".
    ".message-box{background:#fafbff;border:1px solid #e3e8f0;padding:16px;border-radius:8px;white-space:pre-line;line-height:1.5;font-size:14px;}".
    ".footer{font-size:12px;color:#6a727f;margin-top:28px;text-align:center;}".
    "</style></head><body><div class='card'>".
    "<div class='header'><h2>New Contact Form Message</h2></div><div class='content'>".
    "<table class='meta-table'>".
    "<tr><th>Name</th><td>".htmlspecialchars($name)."</td></tr>".
    "<tr><th>Email</th><td>".htmlspecialchars($email)."</td></tr>".
    ($budget ? "<tr><th>Budget</th><td>".htmlspecialchars($budget)."</td></tr>" : '') .
    "<tr><th>Subject</th><td>".htmlspecialchars($subject)."</td></tr>".
    "<tr><th>Time</th><td>$time</td></tr>".
    "<tr><th>Sender IP</th><td>".htmlspecialchars($ip)."</td></tr>".
    "</table>".
    "<h3>Message</h3><div class='message-box'>".nl2br(htmlspecialchars($message))."</div>".
    "<div class='footer'>This email was generated automatically from your portfolio contact form.</div>".
    "</div></div></body></html>";

// Plain text fallback
$plain = "New Contact Form Message\n".
         "Name: $name\n".
         "Email: $email\n".
         ($budget ? "Budget: $budget\n" : '') .
         "Subject: $subject\n".
         "Time: $time\n".
         "Sender IP: $ip\n\n".
         "Message:\n$message\n";

$boundary = md5(uniqid(time(), true));

$headers  = 'From: '.$siteName.' <no-reply@'.($_SERVER['SERVER_NAME'] ?? 'example.com').">\r\n";
$headers .= 'Reply-To: '.$name.' <'.$email.">\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: multipart/alternative; boundary=\"$boundary\"\r\n";

$body  = "--$boundary\r\n";
$body .= "Content-Type: text/plain; charset=UTF-8\r\n";
$body .= "Content-Transfer-Encoding: 8bit\r\n\r\n$plain\r\n";
$body .= "--$boundary\r\n";
$body .= "Content-Type: text/html; charset=UTF-8\r\n";
$body .= "Content-Transfer-Encoding: 8bit\r\n\r\n$html\r\n";
$body .= "--$boundary--";

$sent = @mail($to, $subjectLine, $body, $headers);

if ($sent) {
    echo json_encode(['status' => 'success', 'message' => 'Message sent successfully.']);
} else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Server error: unable to send email.']);
}
