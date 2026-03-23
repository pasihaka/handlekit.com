from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import os
import requests
import random
import time
from PIL import Image
import io
import uuid
import hashlib

app = Flask(__name__)
app.url_map.strict_slashes = False
CORS(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/health')
def health():
    return jsonify({"status": "ok", "timestamp": time.time()}), 200

@app.route('/username-checker')
def username_checker():
    return render_template('username_checker.html')

@app.route('/username-rules')
def username_rules():
    return render_template('username_rules.html')

@app.route('/privacy-policy')
def privacy_policy():
    return render_template('privacy_policy.html')

@app.route('/terms-of-service')
def terms_of_service():
    return render_template('terms_of_service.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/robots.txt')
def robots_txt():
    return app.send_static_file('robots.txt')

@app.route('/sitemap.xml')
def sitemap_xml():
    return app.send_static_file('sitemap.xml')

@app.route('/ads.txt')
def ads_txt():
    return app.send_static_file('ads.txt')

@app.route('/api/check-username')
def api_check_username():
    username = request.args.get('user')
    platform = request.args.get('platform')
    
    if not username or not platform:
        return jsonify({"error": "Missing params"}), 400

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    }

    available = None  # None = uncertain
    try:
        if platform == 'github':
            import re
            if len(username) < 1 or len(username) > 39 or not re.match(r'^[a-zA-Z0-9\-]+$', username) or username.startswith('-') or username.endswith('-') or '--' in username:
                available = 'invalid'
            else:
                r = requests.get(f"https://github.com/signup_check/username?value={username}", timeout=5)
                available = (r.status_code == 200)

        elif platform == 'reddit':
            import re
            if len(username) < 3 or len(username) > 20 or not re.match(r'^[a-zA-Z0-9_\-]+$', username):
                available = 'invalid'
            else:
                r = requests.get(f"https://www.reddit.com/api/username_available.json?user={username}",
                                 headers=headers, timeout=5)
                available = r.json() if r.status_code == 200 else False

        elif platform == 'gitlab':
            r = requests.get(f"https://gitlab.com/{username}", headers=headers, timeout=6)
            available = (r.status_code == 404)

        elif platform == 'hackernews':
            r = requests.get(f"https://hacker-news.firebaseio.com/v0/user/{username}.json", timeout=5)
            available = (r.json() is None)

        elif platform == 'npm':
            r = requests.get(f"https://registry.npmjs.org/-/user/org.couchdb.user:{username}",
                             headers=headers, timeout=5)
            available = (r.status_code == 404)

        elif platform == 'devto':
            r = requests.get(f"https://dev.to/api/users/by_username?url={username}",
                             headers=headers, timeout=5)
            available = (r.status_code == 404)

        elif platform == 'twitter':
            import re
            user_lower = username.lower()
            if len(username) > 15 or not re.match(r'^[a-zA-Z0-9_]+$', username) or 'twitter' in user_lower or 'admin' in user_lower:
                available = 'invalid'
            elif len(username) < 4:
                available = 'taken_or_invalid'
            else:
                # Use Twitter's signup username check API — same approach as GitHub
                r = requests.get(
                    f'https://api.twitter.com/i/users/username_available.json?username={username}',
                    headers=headers, timeout=6
                )
                if r.status_code == 200:
                    try:
                        data = r.json()
                        reason = data.get('reason', '')
                        if data.get('valid') and reason == 'available':
                            available = True
                        else:
                            if reason in ['too_long', 'too_short', 'invalid_characters']:
                                available = 'invalid'
                            elif reason == 'is_banned_word':
                                available = 'taken_or_invalid'
                            else:
                                available = False  # taken
                    except Exception:
                        available = None
                else:
                    available = None

        elif platform == 'instagram':
            import re
            if len(username) < 1 or len(username) > 30 or not re.match(r'^[a-zA-Z0-9_\.]+$', username):
                available = 'invalid'
            elif username.startswith('.') or username.endswith('.') or '..' in username:
                available = 'invalid'
            elif len(username) <= 3:
                # User request: mark 3 or less as "Unavailable" (Taken)
                available = 'taken_or_invalid'
            elif username.isdigit():
                available = 'invalid'
            else:
                # Instagram rate-limits all server-side requests (HTTP 429) regardless of cookies.
                # Cannot be checked without a residential proxy or authenticated session.
                available = None

        elif platform == 'tiktok':
            import re
            if len(username) < 2 or len(username) > 24 or not re.match(r'^[a-zA-Z0-9_\.]+$', username) or username.endswith('.') or username.isdigit():
                available = 'invalid'
            else:
                # Use TikTok's public OEmbed API which is much less restricted than profile scraping
                import urllib.parse
                target_url = f"https://www.tiktok.com/@{username}"
                encoded_url = urllib.parse.quote(target_url, safe='')
                oembed_url = f"https://www.tiktok.com/oembed?url={encoded_url}"
                
                r = requests.get(oembed_url, headers=headers, timeout=8)
                
                # DIAGNOSTIC LOGGING
                print(f"[TikTok DEBUG] OEmbed status {r.status_code} for {username}. Snippet: {r.text[:100]}")
                
                if r.status_code == 200:
                    try:
                        data = r.json()
                        if "author_name" in data:
                            available = False  # Account found
                        else:
                            available = None   # Ambiguous response
                    except:
                        available = None
                elif r.status_code == 400 or r.status_code == 404:
                    # On some environments, 400 might be a block. Check content.
                    if "something went wrong" in r.text.lower() and r.status_code == 400:
                        # For now, treat 400 as available, but log it.
                        available = True
                    else:
                        available = True    # Account not found
                elif r.status_code == 401:
                    available = False   # Private/Restricted but exists
                else:
                    content = r.text.lower()
                    if "slardar" in content or "slardarwaf" in content or r.status_code == 429:
                        available = "rate_limited" 
                    else:
                        available = None

        elif platform == 'youtube':
            yt_username = username.replace('\u00B7', '.')
            # YouTube shows a cookie consent wall to EU users/bots without cookies.
            # Pass the SOCS bypass cookie to skip it and reach the actual page.
            yt_cookies = {
                'SOCS': 'CAISNQgDEitib3FfaWRlbnRpdHlmcm9udGVuZHVpc2VydmVyXzIwMjYwMzE4LjA3X3AwGgJmaSACGgYIgJzyzQY',
                'VISITOR_INFO1_LIVE': 'TOwB_epDIbg'
            }
            r = requests.get(f"https://www.youtube.com/@{yt_username}", headers=headers,
                             cookies=yt_cookies, timeout=8, allow_redirects=True)
            # If we still landed on the consent domain, mark uncertain
            if 'consent.youtube.com' in r.url:
                available = None
            elif r.status_code == 404:
                available = True
            elif r.status_code == 200:
                content = r.text.lower()
                handle_marker  = f'"canonicalbaseurl":"/@{yt_username.lower()}"'
                handle_marker2 = f'"vanityurl":"@{yt_username.lower()}"'
                redirected_away = f'@{yt_username.lower()}' not in r.url.lower()
                if handle_marker in content or handle_marker2 in content:
                    available = False  # channel metadata found → taken
                elif 'ytinitialdata' in content and redirected_away:
                    available = True   # redirected to homepage → handle not registered
                elif 'ytinitialdata' in content:
                    available = None   # ambiguous
                else:
                    available = None   # consent wall or bot block

            # Only reject if we think it's available, otherwise respect the taken status of legacy handles
            if available is True:
                import re
                alphanum = re.sub(r'[^a-zA-Z0-9]', '', username.lower())
                alphanum_len = len(alphanum)
                
                # Smart squatter traps
                common_squats = {
                    'abcdef', 'bcdefg', 'cdefgh', 'defghi', 'efghij',
                    'qwerty', 'asdfgh', 'zxcvbn', 'qazwsx', 'yt1234', 'admin1', 'test12', 'system',
                    '123456', '234567', '345678', '456789', '567890', '098765', '987654', '876543',
                    '123123', '012345'
                }
                is_repeating = len(set(alphanum)) <= 2 and alphanum_len > 0
                
                if len(username) < 3 or len(username) > 30 or not re.match(r'^[a-zA-Z0-9_\-\.\u00B7]+$', username) or not username[0].isalnum() or not username[-1].isalnum():
                    available = 'invalid'
                elif alphanum_len <= 5 or alphanum in common_squats or is_repeating:
                    available = 'taken_or_invalid'

        elif platform == 'pinterest':
            r = requests.get(f"https://www.pinterest.com/{username}/", headers=headers, timeout=6)
            if r.status_code == 404:
                available = True
            elif r.status_code == 200:
                available = False

        elif platform == 'twitch':
            r = requests.get(f"https://www.twitch.tv/{username}", headers=headers, timeout=6)
            if r.status_code == 404:
                available = True
            elif r.status_code == 200:
                available = False

    except Exception as e:
        print(f"[TikTok ERROR] {str(e)}")
        available = None  # timeout or connection error → uncertain

    # Add diagnostic info to the response if uncertain
    response_data = {"platform": platform, "available": available}
    if available is None and platform == 'tiktok':
        try:
            # We already have r from the scope above if it didn't except
            response_data["debug_status"] = r.status_code
        except:
            response_data["debug_status"] = "exception"
            
    return jsonify(response_data)

@app.route('/image-optimizer')
def image_optimizer():
    return render_template('image_optimizer.html')

@app.route('/api/optimize-image', methods=['POST'])
def api_optimize_image():
    if 'image' not in request.files:
        return jsonify({"success": False, "error": "No image"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"success": False, "error": "No filename"}), 400

    try:
        img = Image.open(file.stream)
        original_size = file.content_length if file.content_length else 0
        output_format = request.form.get('format', 'JPEG').upper()
        
        # If content_length is 0, we need to read the stream to find out
        if original_size == 0:
            file.stream.seek(0, os.SEEK_END)
            original_size = file.stream.tell()
            file.stream.seek(0)

        # Optimize
        output = io.BytesIO()
        
        # Handle formats
        if output_format == 'JPEG':
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            img.save(output, format="JPEG", quality=70, optimize=True)
            ext = "jpg"
        elif output_format == 'PNG':
            img.save(output, format="PNG", optimize=True)
            ext = "png"
        elif output_format == 'WEBP':
            img.save(output, format="WEBP", quality=80)
            ext = "webp"
        else:
            return jsonify({"success": False, "error": "Unsupported format"}), 400

        new_size = output.tell()
        
        # Save to static/img/optimized for download
        os.makedirs('static/img/optimized', exist_ok=True)
        filename = f"{uuid.uuid4()}.{ext}"
        filepath = os.path.join('static/img/optimized', filename)
        with open(filepath, 'wb') as f:
            f.write(output.getvalue())

        if original_size > 0:
            savings_ratio = 1.0 - (float(new_size) / float(original_size))
            savings = int(savings_ratio * 1000) / 10.0
        else:
            savings = 0.0
        
        return jsonify({
            "success": True,
            "new_size": new_size,
            "savings": max(0.0, float(savings)),
            "url": f"/static/img/optimized/{filename}"
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/qr-generator')
def qr_generator():
    return render_template('qr_generator.html')

@app.route('/password-generator')
def password_generator():
    return render_template('password_generator.html')

@app.route('/100-worst-passwords')
def worst_passwords():
    return render_template('worst_passwords.html')

@app.route('/word-counter')
def word_counter():
    return render_template('word_counter.html')

@app.route('/words-to-pages')
def words_to_pages():
    return render_template('words_to_pages.html')


@app.route('/text-case-converter')
def text_case_converter():
    return render_template('text_case_converter.html')

@app.route('/color-picker')
def color_picker():
    return render_template('color_picker.html')

@app.route('/url-encoder')
def url_encoder():
    return render_template('url_encoder.html')

@app.route('/json-formatter')
def json_formatter():
    return render_template('json_formatter.html')

@app.route('/unit-converter')
def unit_converter():
    return render_template('unit_converter.html')

@app.route('/base64-encoder')
def base64_encoder():
    return render_template('base64_encoder.html')

@app.route('/hash-generator')
def hash_generator():
    return render_template('hash_generator.html')

@app.route('/api/generate-hashes', methods=['POST'])
def api_generate_hashes():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({"error": "Missing text"}), 400
    
    text = data['text'].encode('utf-8')
    md5_hash = hashlib.md5(text).hexdigest()
    sha256_hash = hashlib.sha256(text).hexdigest()
    
    return jsonify({
        "md5": md5_hash,
        "sha256": sha256_hash
    })


if __name__ == '__main__':
    app.run(debug=True, port=5000)
