import json
import os
import re
from bs4 import BeautifulSoup

def normalize_text(t):
    # Removes consecutive whitespaces and trims
    return re.sub(r'\s+', ' ', t).strip()

template_dir = 'templates'
for fname in os.listdir(template_dir):
    if not fname.endswith('.html'): continue
    filepath = os.path.join(template_dir, fname)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract JSON-LD FAQs
    json_faqs = {}
    schema_pattern = re.compile(r'<script type=["\']application/ld\+json["\']>(.*?)</script>', re.DOTALL)
    for match in schema_pattern.finditer(content):
        try:
            data = json.loads(match.group(1))
            if data.get('@type') == 'FAQPage':
                for item in data.get('mainEntity', []):
                    q = normalize_text(item['name'])
                    a = normalize_text(item['acceptedAnswer']['text'])
                    json_faqs[q] = a
        except Exception as e:
            pass

    # Extract HTML FAQs
    html_faqs = {}
    soup = BeautifulSoup(content, 'html.parser')
    for card in soup.find_all(class_='faq-card'):
        h3 = card.find('h3')
        if not h3: continue
        q = normalize_text(h3.get_text())
        
        # Extract text from p and li directly avoiding random spacing issues
        a_texts = []
        for tag in card.find_all(['p', 'li']):
            a_texts.append(normalize_text(tag.get_text()))
            
        a = normalize_text(" ".join(a_texts))
        html_faqs[q] = a

    if not json_faqs and not html_faqs:
        continue

    print(f"\n======== File: {fname} ========")
    
    mismatched = []
    
    # Check JSON vs HTML
    for q in list(json_faqs.keys()):
        matched_html_q = None
        for hq in html_faqs:
            if q.lower() == hq.lower():
                matched_html_q = hq
                break
        
        if not matched_html_q:
            mismatched.append(f"[MISMATCH - MISSING Q in HTML]\nJSON has Q: {q}")
        else:
            if json_faqs[q] != html_faqs[matched_html_q]:
                mismatched.append(f"[MISMATCH - ANSWER DIFFERENCE for Q: '{q}']\nJSON  : {json_faqs[q]}\nHTML  : {html_faqs[matched_html_q]}")
                
    # Check HTML vs JSON
    for hq in html_faqs:
        matched_json_q = None
        for q in json_faqs:
             if q.lower() == hq.lower():
                matched_json_q = q
                break       
        if not matched_json_q:
            mismatched.append(f"[MISMATCH - MISSING Q in JSON]\nHTML has Q: {hq}")

    if not mismatched:
        print("MATCH PERFECTLY")
    else:
        for m in mismatched:
            print(m)
