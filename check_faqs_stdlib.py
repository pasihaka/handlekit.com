import json
import os
import re
from html.parser import HTMLParser

class FAQParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_card = False
        self.in_h3 = False
        self.in_p_or_li = False
        self.current_q = ''
        self.current_a = []
        self.faqs = {}
        self.div_depth = 0
        self.card_depth = 0

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == 'div':
            self.div_depth += 1
            if 'class' in attrs_dict and 'faq-card' in attrs_dict['class']:
                self.in_card = True
                self.card_depth = self.div_depth
                self.current_q = ''
                self.current_a = []
        elif self.in_card:
            if tag == 'h3':
                self.in_h3 = True
            elif tag in ['p', 'li']:
                self.in_p_or_li = True

    def handle_endtag(self, tag):
        if tag == 'div':
            if self.in_card and self.div_depth == self.card_depth:
                self.in_card = False
                if self.current_q:
                    self.faqs[self.current_q.strip()] = " ".join(self.current_a).strip()
            self.div_depth -= 1
        elif self.in_card:
            if tag == 'h3':
                self.in_h3 = False
            elif tag in ['p', 'li']:
                self.in_p_or_li = False

    def handle_data(self, data):
        if self.in_card:
            text = re.sub(r'\s+', ' ', data)
            if not text.strip():
                return
            if self.in_h3:
                self.current_q += text
            elif self.in_p_or_li:
                # Add a space before appending so words aren't squished between HTML tags like `<strong>word</strong>.` -> `word.`
                self.current_a.append(text.strip())

def normalize_text(t):
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
        except: pass

    # Extract HTML FAQs
    parser = FAQParser()
    parser.feed(content)
    
    html_faqs = {}
    for q, a in parser.faqs.items():
        # Clean up any potential double spaces from our rough list append
        clean_q = normalize_text(q)
        clean_a = normalize_text(a).replace(" ,", ",").replace(" .", ".").replace(" '", "'")
        html_faqs[clean_q] = clean_a

    if not json_faqs and not html_faqs: continue

    print(f"\n======== File: {fname} ========")
    mismatched = []
    
    for q in list(json_faqs.keys()):
        matched_html_q = next((hq for hq in html_faqs if q.lower() == hq.lower()), None)
        if not matched_html_q:
            mismatched.append(f"[MISMATCH - MISSING Q in HTML]\nJSON has Q: {q}")
        elif json_faqs[q] != html_faqs[matched_html_q]:
            mismatched.append(f"[MISMATCH - ANSWER DIFFERENCE for Q: '{q}']\nJSON  : {json_faqs[q]}\nHTML  : {html_faqs[matched_html_q]}")
                
    for hq in html_faqs:
        if not any(q.lower() == hq.lower() for q in json_faqs):
            mismatched.append(f"[MISMATCH - MISSING Q in JSON]\nHTML has Q: {hq}")

    if not mismatched:
        print("MATCH PERFECTLY")
    else:
        for m in mismatched:
            print(m)
