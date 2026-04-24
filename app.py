from flask import Flask, render_template, request, jsonify, redirect, url_for, send_from_directory
from flask_cors import CORS
from flask_compress import Compress
import os
import requests
import random
import time
from PIL import Image
import io
import uuid
import hashlib
import json
import re
import sqlite3
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'), override=True)
print(f"DEBUG: GOOGLE_API_KEY loaded: {os.environ.get('GOOGLE_API_KEY') is not None}")

app = Flask(__name__)
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.url_map.strict_slashes = False
CORS(app)
Compress(app)

DATABASE = 'data/handlekit.db'

def get_db():
    db = sqlite3.connect(DATABASE)
    db.row_factory = sqlite3.Row
    return db

def db_init():
    os.makedirs('data', exist_ok=True)
    db = get_db()
    # JND Scores
    db.execute('''CREATE TABLE IF NOT EXISTS jnd_scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nickname TEXT,
        score INTEGER,
        level INTEGER,
        delta_e REAL,
        mode TEXT,
        difficulty TEXT,
        timestamp REAL,
        is_public INTEGER DEFAULT 0
    )''')
    try:
        db.execute('ALTER TABLE jnd_scores ADD COLUMN is_public INTEGER DEFAULT 0')
    except: pass
    try:
        db.execute('ALTER TABLE jnd_scores ADD COLUMN delta_e REAL')
    except: pass
    try:
        db.execute('ALTER TABLE jnd_scores ADD COLUMN mode TEXT')
    except: pass
    # Color Guessing Scores
    db.execute('''CREATE TABLE IF NOT EXISTS color_scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nickname TEXT,
        score REAL,
        timestamp REAL,
        is_public INTEGER DEFAULT 0
    )''')
    try:
        db.execute('ALTER TABLE color_scores ADD COLUMN is_public INTEGER DEFAULT 0')
    except: pass
    # Contrast Scores
    db.execute('''CREATE TABLE IF NOT EXISTS contrast_scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nickname TEXT,
        log_cs REAL,
        timestamp REAL
    )''')
    # Tool Ratings
    db.execute('''CREATE TABLE IF NOT EXISTS tool_ratings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tool_id TEXT,
        rating INTEGER,
        ip_hash TEXT,
        timestamp REAL
    )''')
    db.commit()
    db.close()

def sanitize_string(text, max_len=50):
    if not text: return "Anonymous"
    # Strip HTML tags
    clean = re.sub(r'<[^>]*?>', '', text)
    # Trim and limit length
    return clean.strip()[:max_len]

# Ensure DB is ready on startup
db_init()

# Simple In-Memory Rate Limiting
rate_limit_store = {}

def is_rate_limited(ip, limit=10, period=60):
    now = time.time()
    if ip not in rate_limit_store:
        rate_limit_store[ip] = []
    # Filter out old requests
    rate_limit_store[ip] = [t for t in rate_limit_store[ip] if now - t < period]
    if len(rate_limit_store[ip]) >= limit:
        return True
    rate_limit_store[ip].append(now)
    return False

@app.route('/')
def index():
    return render_template('index.html')

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

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

@app.route('/favicon.ico')
def favicon():
    return app.send_static_file('favicon.ico')

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
                reddit_headers = {**headers, 'Accept': 'application/json'}
                r = requests.get(f"https://www.reddit.com/api/username_available.json?user={username}",
                                 headers=reddit_headers, timeout=6)
                # On first check Reddit sometimes returns 429 or 5xx due to cold-start / burst.
                # Retry once with a short backoff before giving up.
                if r.status_code != 200:
                    time.sleep(0.8)
                    r = requests.get(f"https://www.reddit.com/api/username_available.json?user={username}",
                                     headers=reddit_headers, timeout=6)
                available = r.json() if r.status_code == 200 else None

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
            elif user_lower == 'zuck':
                available = 'reserved'
            elif len(username) < 4:
                available = 'taken_or_invalid'
            else:
                # Use Twitter's public OEmbed API — more accurate than the signup check for numeric/legacy handles
                r = requests.get(
                    f'https://publish.twitter.com/oembed?url=https://x.com/{username}',
                    headers=headers, timeout=6
                )
                if r.status_code == 200:
                    available = False  # Account exists (Taken)
                elif r.status_code == 404:
                    if username.isdigit():
                        available = 'invalid' # Numeric-only names are legacy and cannot be created new
                    else:
                        available = True     # Available
                else:
                    available = None         # Rate limit or error

        elif platform == 'instagram':
            import re
            if len(username) < 1 or len(username) > 30 or not re.match(r'^[a-zA-Z0-9_\.]+$', username) or '..' in username or username.startswith('.') or username.endswith('.'):
                available = 'invalid'
            else:
                # Use Twitterbot UA for raw metadata access without login shell
                bot_headers = {'User-Agent': 'Mozilla/5.0 (compatible; Twitterbot/1.1)'}
                try:
                    r = requests.get(f"https://www.instagram.com/{username}/", headers=bot_headers, timeout=6)
                    content = r.text.lower()
                    handle_lower = username.lower()
                    
                    # CASE 1: Taken (Handle found in metadata or common markers)
                    if f'instagram.com/{handle_lower}' in content or f'@{handle_lower}' in content or f'&#064;{handle_lower}' in content or 'property="og:title"' in content:
                        available = False
                    # CASE 2: Available (Explicit 404 status or specific "Not Found" message)
                    elif r.status_code == 404 or "this page isn't available" in content or "link you followed may be broken" in content:
                        available = True
                    # CASE 3: Uncertain (Generic 200, but no profile info — e.g. login wall or challenge page)
                    else:
                        available = None
                except:
                    available = None

        elif platform == 'tiktok':
            import re
            if len(username) < 2 or len(username) > 24 or not re.match(r'^[a-zA-Z0-9_\.]+$', username) or username.endswith('.') or username.isdigit():
                available = 'invalid'
            else:
                # Step 1: Try TikTok's public OEmbed API — returns 200 + author_name for accounts with public content
                import urllib.parse
                target_url = f"https://www.tiktok.com/@{username.lower()}"
                encoded_url = urllib.parse.quote(target_url, safe='')
                oembed_url = f"https://www.tiktok.com/oembed?url={encoded_url}"

                r = requests.get(oembed_url, headers=headers, timeout=8)

                if r.status_code == 200 and ('"author_name"' in r.text):
                    available = False  # Account found and has public content → Taken
                elif r.status_code == 401:
                    available = False  # Private/restricted but exists → Taken
                elif r.status_code in (400, 404):
                    # Ambiguous: TikTok returns 400 for BOTH non-existent accounts AND accounts
                    # that exist but have no public content yet (e.g. newly registered, private).
                    # Fall back: scrape the profile page and check for "uniqueId" in the HTML.
                    #
                    # NOTE: Cloud/datacenter IPs (e.g. Render) get bot-blocked by TikTok's
                    # profile page — the response is a short challenge page with no user data.
                    # We detect bot-blocking by checking for specific TikTok webapp markers.
                    try:
                        profile_headers = {**headers,
                                           'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                                           'Accept-Language': 'en-US,en;q=0.9'}
                        rp = requests.get(target_url, headers=profile_headers, timeout=8, allow_redirects=True)
                        body = rp.text
                        # A genuine TikTok profile page contains specific markers.
                        # 'webapp.user-detail' or 'userInfo' are usually present in the initial state JSON.
                        is_real_page = ('webapp.user-detail' in body or 'userInfo' in body 
                                        or 'TIKTOK_SSR_DATA' in body or len(body) > 60000)
                        
                        if '"uniqueId"' in body or '"uniqueid"' in body.lower():
                            available = False  # Account data found in page → Taken
                        elif is_real_page:
                            # It's a real page but uniqueId is missing? This is rare.
                            # Check for "couldn't find this account" which is a clear 404 signal.
                            if "couldn't find this account" in body.lower() or "page not found" in body.lower():
                                available = True
                            else:
                                available = None  # Ambiguous/blocked
                        else:
                            available = None   # Bot-blocked or challenge page → Uncertain
                    except Exception:
                        available = None  # Fallback scrape failed → Uncertain
                elif r.status_code == 429 or 'slardar' in r.text.lower():
                    available = None  # Rate limited → Uncertain
                else:
                    available = None  # Unknown response → Uncertain

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
            import re
            if len(username) < 3 or len(username) > 30 or not re.match(r'^[a-zA-Z0-9_]+$', username) or username.isdigit():
                available = 'invalid'
            else:
                # Use Twitterbot UA for raw metadata access.
                # OEmbed is inaccurate for accounts with no pins; scraping for og:title is reliable.
                bot_headers = {'User-Agent': 'Mozilla/5.0 (compatible; Twitterbot/1.1)'}
                try:
                    r = requests.get(f"https://www.pinterest.com/{username}/", headers=bot_headers, timeout=6)
                    # Presence of og:title or og:url indicates an existing profile
                    if 'og:title' in r.text or 'og:url' in r.text:
                        available = False
                    else:
                        available = True
                except:
                    available = None

        elif platform == 'threads':
            import re
            if len(username) < 1 or len(username) > 30 or not re.match(r'^[a-zA-Z0-9_\.]+$', username) or '..' in username or username.startswith('.') or username.endswith('.'):
                available = 'invalid'
            else:
                # Threads/Instagram use SPA shells. Twitterbot UA gets raw metadata.
                bot_headers = {'User-Agent': 'Mozilla/5.0 (compatible; Twitterbot/1.1)'}
                try:
                    r = requests.get(f"https://www.threads.net/@{username}/", headers=bot_headers, timeout=6)
                    # Available handles redirect to login shell or have "Log in" in title
                    if 'Log in' in r.text or 'login' in r.url or r.status_code == 404:
                        available = True
                    else:
                        available = False
                except:
                    available = None

        elif platform == 'twitch':
            import re
            if len(username) < 4 or len(username) > 25 or not re.match(r'^[a-zA-Z0-9_]+$', username) or username.startswith('_'):
                available = 'invalid'
            else:
                # Use Twitch GQL for high accuracy (Distinguishes Ghost/Available from Taken)
                gql_url = "https://gql.twitch.tv/gql"
                gql_headers = {
                    "Client-Id": "kimne78kx3ncx6brgo4mv6wki5h1ko",
                    "Content-Type": "application/json"
                }
                query = "query($login: String!) { user(login: $login) { id } }"
                payload = [{"operationName": None, "variables": {"login": username}, "query": query}]
                
                try:
                    # Twitch GQL returns 200 with 'user': null for available names
                    r = requests.post(gql_url, headers=gql_headers, json=payload, timeout=6)
                    if r.status_code == 200:
                        data = r.json()
                        user_data = data[0].get('data', {}).get('user')
                        available = (user_data is None)
                    else:
                        # Fallback if GQL fails or rate limits
                        available = None
                except:
                    available = None

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

@app.route('/worst-password')
@app.route('/worst-passwords')
@app.route('/100-worst-password')
def worst_passwords_redirect():
    return redirect(url_for('worst_passwords'), code=301)

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

@app.route('/color-guessing-game')
def color_guessing_game():
    return render_template('color_guessing_game.html')

@app.route('/jnd-test')
def jnd_test():
    return render_template('jnd_test.html')

@app.route('/contrast-sensitivity-test')
def contrast_sensitivity_test():
    return render_template('contrast_sensitivity_test.html')



@app.route('/articles')
def articles_list():
    return render_template('articles_list.html')

@app.route('/articles/jnd-perception')
def article_jnd_perception():
    return render_template('article_jnd.html')

@app.route('/articles/pelli-robson-contrast-sensitivity')
def article_pelli_robson():
    return render_template('article_pelli_robson.html')

@app.route('/blog')
def blog_list():
    return render_template('blog_list.html')


@app.route('/blog/how-to-generate-barcode-2026')
def blog_post_barcode():
    return render_template('blog/how-to-generate-barcode-2026.html')

@app.route('/blog/science-of-color-memory')
def blog_post_color_memory():
    return render_template('blog/science-of-color-memory.html')

@app.route('/barcode-generator')
def barcode_generator():
    return render_template('barcode_generator.html')


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



@app.route('/api/color-guessing/submit', methods=['POST'])
def api_color_submit():
    data = request.get_json()
    if not data or 'score' not in data:
        return jsonify({"success": False, "error": "Invalid data"}), 400
    
    try:
        session_id = data.get('id')
        nickname = sanitize_string(data.get('nickname'))
        score = float(data['score'])
        
        # Public only if nickname is provided and not Anonymous
        is_public = 1 if (nickname and nickname != "Anonymous") else 0
        
        db = get_db()
        if session_id:
            db.execute('UPDATE color_scores SET nickname = ?, is_public = ? WHERE id = ?',
                       (nickname, is_public, session_id))
            new_id = session_id
        else:
            cursor = db.execute('INSERT INTO color_scores (nickname, score, timestamp, is_public) VALUES (?, ?, ?, ?)',
                       (nickname, score, time.time(), is_public))
            new_id = cursor.lastrowid
            
        db.commit()
        db.close()
        return jsonify({"success": True, "id": new_id})
    except Exception as e:
        print(f"Color Submit Error: {e}")
        return jsonify({"success": False, "error": "Server error"}), 500

@app.route('/api/color-guessing/stats', methods=['GET'])
def api_color_stats():
    try:
        db = get_db()
        cursor = db.execute('SELECT score FROM color_scores ORDER BY score ASC')
        scores = [row['score'] for row in cursor.fetchall()]
        db.close()
        
        if not scores:
            return jsonify({"buckets": [], "total": 0, "percentiles": {}})
            
        total = len(scores)
        percentiles = {
            "0": scores[0],
            "25": scores[int(total * 0.25)],
            "50": scores[int(total * 0.50)],
            "75": scores[int(total * 0.75)],
            "100": scores[-1]
        }
        
        bucket_size = 2.5
        max_score = 50
        
        buckets = {}
        for s in scores:
            b_idx = float((s // bucket_size) * bucket_size)
            buckets[b_idx] = buckets.get(b_idx, 0) + 1
            
        final_buckets = []
        num_buckets = int(max_score // bucket_size) + 1
        for i in range(num_buckets):
            b_min = float(i * bucket_size)
            final_buckets.append({
                "min": b_min,
                "max": b_min + bucket_size,
                "count": buckets.get(b_min, 0)
            })
        
        score_val = request.args.get('score')
        higher_count = 0
        if score_val is not None:
            try:
                score_val = float(score_val)
                higher_count = sum(1 for s in scores if s > score_val)
            except: pass

        return jsonify({
            "buckets": final_buckets,
            "total": total,
            "max_score": max_score,
            "bucket_size": bucket_size,
            "percentiles": percentiles,
            "higher_count": higher_count
        })
    except Exception:
        return jsonify({"error": "Server error"}), 500

@app.route('/api/color-guessing/leaderboard', methods=['GET'])
def api_color_leaderboard():
    try:
        db = get_db()
        cursor = db.execute('SELECT nickname, score FROM color_scores WHERE is_public = 1 ORDER BY score DESC LIMIT 10')
        results = [dict(row) for row in cursor.fetchall()]
        db.close()
        return jsonify(results)
    except Exception:
        return jsonify({"error": "Server error"}), 500

@app.route('/api/jnd/submit', methods=['POST'])
def api_jnd_submit():
    ip = request.remote_addr or 'unknown'
    if is_rate_limited(ip):
        return jsonify({"success": False, "error": "Too many requests"}), 429
        
    data = request.get_json()
    if not data or 'level' not in data:
        return jsonify({"success": False, "error": "Invalid data"}), 400
    
    try:
        session_id = data.get('id')
        nickname = sanitize_string(data.get('nickname'))
        mode = sanitize_string(request.json.get('mode', 'arcade'), 20)
        score = int(data.get('score', 0))
        level = int(data.get('level', 1))
        delta_e = float(data.get('delta_e', 0.0))
        difficulty = sanitize_string(data.get('difficulty', 'pro'), 20)
        
        # Diagnostic mode is never public
        is_public = 1 if (nickname and nickname != "Anonymous" and mode == 'arcade') else 0
        
        db = get_db()
        if session_id:
            db.execute('UPDATE jnd_scores SET nickname = ?, is_public = ? WHERE id = ?',
                       (nickname, is_public, session_id))
            new_id = session_id
        else:
            cursor = db.execute('''INSERT INTO jnd_scores 
                (nickname, score, level, delta_e, mode, difficulty, timestamp, is_public) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
                (nickname, score, level, delta_e, mode, difficulty, time.time(), is_public))
            new_id = cursor.lastrowid
            
        db.commit()
        db.close()
        return jsonify({"success": True, "id": new_id})
    except Exception as e:
        print(f"JND Submit Error: {e}")
        return jsonify({"success": False, "error": "Server error"}), 500

@app.route('/api/jnd/stats', methods=['GET'])
def api_jnd_stats():
    try:
        mode = request.args.get('mode', 'arcade')
        db = get_db()
        
        if mode == 'diagnostic':
            # Diagnostic Stats: Focus on Delta E
            cursor = db.execute('SELECT delta_e FROM jnd_scores WHERE mode = ? AND delta_e > 0 ORDER BY delta_e ASC', (mode,))
            dataset = [row['delta_e'] for row in cursor.fetchall()]
        else:
            # Arcade Stats: Focus on Levels
            cursor = db.execute('SELECT level FROM jnd_scores WHERE mode = ? OR mode IS NULL ORDER BY level ASC', ('arcade',))
            dataset = [row['level'] for row in cursor.fetchall()]
        
        db.close()
        
        if not dataset:
            return jsonify({"buckets": [], "total": 0, "better_count": 0})
            
        total = len(dataset)
        final_buckets = []
        
        if mode == 'diagnostic':
            # Delta E buckets (0.00 to 0.50, steps of 0.01)
            bucket_map = {}
            for val in dataset:
                b_idx = round(val, 2)
                bucket_map[b_idx] = bucket_map.get(b_idx, 0) + 1
            
            for i in range(0, 51):
                b_val = i / 100.0
                final_buckets.append({
                    "min": b_val.toFixed(2) if hasattr(b_val, 'toFixed') else f"{b_val:.2f}",
                    "count": bucket_map.get(b_val, 0)
                })
            
            val_to_compare = request.args.get('delta_e')
            better_count = 0 
            if val_to_compare:
                try:
                    v = float(val_to_compare)
                    better_count = sum(1 for d in dataset if d < v) # BETTER means LOWER delta_e
                except: pass
            
            return jsonify({
                "buckets": final_buckets,
                "total": total,
                "better_count": better_count
            })
        else:
            # Level buckets
            max_level = max(dataset) if dataset else 20
            bucket_map = {}
            for l in dataset:
                bucket_map[l] = bucket_map.get(l, 0) + 1
            
            max_graph_level = max(30, max_level + 5)
            for i in range(1, max_graph_level + 1):
                final_buckets.append({
                    "min": i,
                    "count": bucket_map.get(i, 0)
                })
            
            val_to_compare = request.args.get('level')
            better_count = 0
            if val_to_compare:
                try:
                    v = int(val_to_compare)
                    better_count = sum(1 for l in dataset if l > v) # BETTER means HIGHER level
                except: pass

        return jsonify({
            "buckets": final_buckets,
            "total": total,
            "better_count": better_count
        })
    except Exception as e:
        print(f"JND Stats Error: {e}")
        return jsonify({"error": "Server error"}), 500

@app.route('/api/jnd/leaderboard', methods=['GET'])
def api_jnd_leaderboard():
    try:
        db = get_db()
        # Only show PUBLIC scores on the leaderboard, ranked by Level
        cursor = db.execute('SELECT nickname, level FROM jnd_scores WHERE is_public = 1 ORDER BY level DESC, id ASC LIMIT 10')
        results = [dict(row) for row in cursor.fetchall()]
        db.close()
        return jsonify(results)
    except Exception:
        return jsonify({"error": "Server error"}), 500

@app.route('/api/contrast/submit', methods=['POST'])
def api_contrast_submit():
    ip = request.remote_addr or 'unknown'
    if is_rate_limited(ip):
        return jsonify({"success": False, "error": "Too many requests"}), 429
        
    data = request.get_json()
    if not data or 'log_cs' not in data:
        return jsonify({"success": False, "error": "Invalid data"}), 400
    
    try:
        nickname = sanitize_string(data.get('nickname'))
        log_cs = float(data['log_cs'])
        
        db = get_db()
        db.execute('INSERT INTO contrast_scores (nickname, log_cs, timestamp) VALUES (?, ?, ?)',
                   (nickname, log_cs, time.time()))
        db.commit()
        db.close()
        return jsonify({"success": True})
    except Exception:
        return jsonify({"success": False, "error": "Server error"}), 500

@app.route('/api/contrast/leaderboard', methods=['GET'])
def api_contrast_leaderboard():
    try:
        db = get_db()
        cursor = db.execute('SELECT nickname, log_cs FROM contrast_scores ORDER BY log_cs DESC LIMIT 10')
        results = [dict(row) for row in cursor.fetchall()]
        db.close()
        return jsonify(results)
    except Exception:
        return jsonify({"error": "Server error"}), 500

@app.route('/api/contrast/stats', methods=['GET'])
def api_contrast_stats():
    try:
        db = get_db()
        cursor = db.execute('SELECT log_cs FROM contrast_scores ORDER BY log_cs ASC')
        scores = [row['log_cs'] for row in cursor.fetchall()]
        db.close()
        
        if not scores:
            return jsonify({"buckets": [], "total": 0})
            
        total = len(scores)
        bucket_size = 0.05
        max_val = 2.4
        
        buckets = {}
        for s in scores:
            b_idx = round(s / bucket_size) * bucket_size
            key = f"{b_idx:.2f}"
            buckets[key] = buckets.get(key, 0) + 1
            
        final_buckets = []
        for i in range(int(max_val / bucket_size) + 1):
            val = i * bucket_size
            key = f"{val:.2f}"
            final_buckets.append({
                "x": val,
                "y": buckets.get(key, 0)
            })
            
        score_val = request.args.get('score')
        higher_count = 0
        lower_count = 0
        if score_val is not None:
            try:
                score_val = float(score_val)
                higher_count = sum(1 for s in scores if s > (score_val + 0.001))
                lower_count = sum(1 for s in scores if s < (score_val - 0.001))
            except: pass

        return jsonify({
            "buckets": final_buckets,
            "total": total,
            "higher_count": higher_count,
            "lower_count": lower_count,
            "percentiles": {
                "25": scores[int(total * 0.25)],
                "50": scores[int(total * 0.50)],
                "75": scores[int(total * 0.75)]
            }
        })
    except Exception:
        return jsonify({"error": "Server error"}), 500


@app.route('/gbp-triage')
def gbp_triage_redirect():
    return redirect('/gbp-triage/', code=301)

@app.route('/gbp-triage/')
@app.route('/gbp-triage/<path:path>')
def gbp_triage_serve(path='index.html'):
    return send_from_directory('static/gbp-tool', path)


@app.route('/api/rate-tool', methods=['POST'])
def api_rate_tool():
    ip = request.remote_addr or 'unknown'
    if is_rate_limited(ip, limit=5):
        return jsonify({"success": False, "error": "Too many requests"}), 429
        
    data = request.get_json()
    if not data or 'tool_id' not in data or 'rating' not in data:
        return jsonify({"success": False, "error": "Invalid data"}), 400
    
    try:
        rating = int(data['rating'])
        if rating < 1 or rating > 5:
            return jsonify({"success": False, "error": "Invalid rating"}), 400
            
        tool_id = sanitize_string(data['tool_id'], 50)
        valid_tools = [
            'username-checker', 'password-generator', 'base64-encoder', 
            'url-encoder', 'json-formatter', 'hash-generator', 'gbp-triage'
        ]
        if tool_id not in valid_tools:
            return jsonify({"success": False, "error": "Invalid tool"}), 400

        ip_hash = hashlib.sha256(f"{ip}-handlekit-salt".encode()).hexdigest()

        db = get_db()
        db.execute('INSERT INTO tool_ratings (tool_id, rating, ip_hash, timestamp) VALUES (?, ?, ?, ?)',
                   (tool_id, rating, ip_hash, time.time()))
        db.commit()
        db.close()
        return jsonify({"success": True})
    except Exception:
        return jsonify({"success": False, "error": "Server error"}), 500

if __name__ == '__main__':

    app.run(debug=True, port=5000, threaded=True)
