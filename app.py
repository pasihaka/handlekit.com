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
CORS(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/username-checker')
def username_checker():
    return render_template('username_checker.html')

@app.route('/privacy-policy')
def privacy_policy():
    return render_template('privacy_policy.html')

@app.route('/api/check-username')
def api_check_username():
    username = request.args.get('user')
    platform = request.args.get('platform')
    
    if not username or not platform:
        return jsonify({"error": "Missing params"}), 400

    # Real world check for GitHub using the internal signup check endpoint
    # This is more reliable as it accounts for flagged/reserved accounts
    available = True
    try:
        if platform == 'github':
            # This endpoint returns 200 for available, non-200 (like 403) for taken/reserved
            r = requests.get(f"https://github.com/signup_check/username?value={username}", timeout=5)
            available = (r.status_code == 200)
        elif platform == 'reddit':
            # Reddit's official availability endpoint
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
            r = requests.get(f"https://www.reddit.com/api/username_available.json?user={username}", headers=headers, timeout=5)
            # Returns true/false JSON
            available = r.json() if r.status_code == 200 else False
        else:
            available = False
    except:
        available = False

    return jsonify({"platform": platform, "available": available})

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

        savings = round((1 - new_size / original_size) * 100, 1) if original_size > 0 else 0
        
        return jsonify({
            "success": True,
            "new_size": new_size,
            "savings": max(0, savings),
            "url": f"/static/img/optimized/{filename}"
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/developer-toolbox')
def developer_toolbox():
    return render_template('developer_toolbox.html')

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
